import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load context files helper
function loadContextFile(path: string, fallbackLabel: string): string {
  if (!existsSync(path)) {
    return `[${fallbackLabel} not found - skipping]`;
  }
  return readFileSync(path, 'utf-8').trim();
}

export async function POST(request: Request) {
  try {
    const { title, company, description, url } = await request.json();

    if (!description) {
      return NextResponse.json({ success: false, error: 'Job description is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'OPENAI_API_KEY is not configured on the server. Please check your environment variables.' 
      }, { status: 500 });
    }

    // Resolve paths to the parent directory (project root containing career-ops profiles)
    const rootPath = join(process.cwd(), '..');
    const sharedContext = loadContextFile(join(rootPath, 'modes', '_shared.md'), 'modes/_shared.md');
    const ofertaLogic = loadContextFile(join(rootPath, 'modes', 'oferta.md'), 'modes/oferta.md');
    const cvContent = loadContextFile(join(rootPath, 'cv.md'), 'cv.md');
    const profileContent = loadContextFile(join(rootPath, 'modes', '_profile.md'), 'modes/_profile.md');
    const profileYml = loadContextFile(join(rootPath, 'config', 'profile.yml'), 'config/profile.yml');

    // Build standard career-ops prompt
    const systemPrompt = `You are career-ops, an AI-powered job search assistant.
You evaluate job offers against the user's CV using a structured A-G scoring system.

Your evaluation methodology is defined below. Follow it exactly.

═══════════════════════════════════════════════════════
SYSTEM CONTEXT (_shared.md)
═══════════════════════════════════════════════════════
${sharedContext}

═══════════════════════════════════════════════════════
EVALUATION MODE (oferta.md)
═══════════════════════════════════════════════════════
${ofertaLogic}

═══════════════════════════════════════════════════════
CANDIDATE RESUME (cv.md)
═══════════════════════════════════════════════════════
${cvContent}

═══════════════════════════════════════════════════════
CANDIDATE PROFILE & TARGETS (config/profile.yml)
═══════════════════════════════════════════════════════
${profileYml}

═══════════════════════════════════════════════════════
USER ARCHETYPES & NARRATIVE (_profile.md)
═══════════════════════════════════════════════════════
${profileContent}

═══════════════════════════════════════════════════════
IMPORTANT OPERATING RULES FOR THIS SESSION
═══════════════════════════════════════════════════════
1. You do NOT have access to WebSearch, Playwright, or file writing tools.
   - For Block D (Comp research): provide salary estimates based on your training data, clearly noted as estimates.
   - For Block G (Legitimacy): analyze the JD text only; skip URL/page freshness checks.
2. Generate Blocks A through G in full, in English, unless the JD is in another language.
3. At the very end, output a machine-readable summary block in this exact format:

---SCORE_SUMMARY---
COMPANY: <company name or "Unknown">
ROLE: <role title>
SCORE: <global score as decimal, e.g. 3.8>
ARCHETYPE: <detected archetype>
LEGITIMACY: <High Confidence | Proceed with Caution | Suspicious>
---END_SUMMARY---
`;

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const jdPayload = `
Title: ${title || 'Unknown Role'}
Company: ${company || 'Unknown Company'}
URL: ${url || 'Not Provided'}

Job Description:
${description}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      temperature: 0.2, // Low temperature for deterministic evaluation
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `JOB DESCRIPTION TO EVALUATE:\n\n${jdPayload}` }
      ]
    });

    const evaluationText = response.choices[0].message?.content || '';

    // Parse score summary block
    const summaryMatch = evaluationText.match(/---SCORE_SUMMARY---\s*([\s\S]*?)---END_SUMMARY---/);
    
    let parsedCompany = company || 'Unknown Company';
    let parsedRole = title || 'Unknown Role';
    let parsedScore = '3.0';
    let parsedArchetype = 'Unknown';
    let parsedLegitimacy = 'Proceed with Caution';

    if (summaryMatch) {
      const block = summaryMatch[1];
      const extract = (key: string) => {
        const prefix = `${key}:`;
        const lines = block.split('\n');
        for (const line of lines) {
          const trimmed = line.trimStart();
          if (trimmed.startsWith(prefix)) {
            return trimmed.slice(prefix.length).trim();
          }
        }
        return '';
      };

      parsedCompany = extract('COMPANY') || parsedCompany;
      parsedRole = extract('ROLE') || parsedRole;
      parsedScore = extract('SCORE') || parsedScore;
      parsedArchetype = extract('ARCHETYPE') || parsedArchetype;
      parsedLegitimacy = extract('LEGITIMACY') || parsedLegitimacy;
    }

    // Strip out the machine-readable summary block from the user-facing report
    const cleanReport = evaluationText
      .replace(/---SCORE_SUMMARY---[\s\S]*?---END_SUMMARY---/, '')
      .trim();

    return NextResponse.json({
      success: true,
      company: parsedCompany,
      role: parsedRole,
      score: parseFloat(parsedScore) || 3.0,
      archetype: parsedArchetype,
      legitimacy: parsedLegitimacy,
      report: cleanReport
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
