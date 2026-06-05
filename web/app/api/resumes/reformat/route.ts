import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { cvText } = await request.json();

    if (!cvText) {
      return NextResponse.json({ success: false, error: 'CV Text is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key is not configured.' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) CV editor. 
Your task is to take a raw text extraction of a user's CV/resume and reformat it into clean, well-structured, professional Markdown.

Format requirements:
1. Output should be strictly Markdown text.
2. Use professional heading structures (e.g. # Name, ## Professional Summary, ## Work Experience, ## Education, ## Skills, ## Projects).
3. Do not include any raw markdown block wraps like \`\`\`markdown or \`\`\` - just output the raw markdown text directly, so it can be dropped into the editor.
4. Extract a list of skills as a JSON array at the very bottom inside a special delimiter block, like this:
---SKILLS_EXTRACTED---
["React", "Node.js", "TypeScript", ...]
---END_SKILLS---
5. Keep the formatting clean and highly readable. Do not embellish or add experiences the user doesn't have, but make sure to clean up OCR or text extraction noise.
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `RAW CV TEXT TO REFORMAT:\n\n${cvText}` }
      ]
    });

    const responseText = response.choices[0].message?.content || '';

    // Extract skills array
    let skills: string[] = [];
    let cvMarkdown = responseText;

    const skillsMatch = responseText.match(/---SKILLS_EXTRACTED---([\s\S]*?)---END_SKILLS---/);
    if (skillsMatch) {
      try {
        skills = JSON.parse(skillsMatch[1].trim());
      } catch (e) {
        console.warn("Failed to parse skills JSON from response", e);
      }
      // Remove the skills section from the markdown body
      cvMarkdown = responseText.replace(/---SKILLS_EXTRACTED---[\s\S]*?---END_SKILLS---/, '').trim();
    }

    return NextResponse.json({
      success: true,
      cvMarkdown: cvMarkdown,
      skills: skills
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
