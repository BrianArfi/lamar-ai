import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { cvMarkdown, roleTitle, companyName, jobDescription } = await request.json();

    if (!cvMarkdown || !roleTitle) {
      return NextResponse.json({ success: false, error: 'CV Markdown and Target Role Title are required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key is not configured.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are an elite, security-first executive career coach and ATS optimization engine.
Your task is to take a candidate's current master CV in Markdown format, and customize/tailor it to perfectly match a target job position:
- Role Title: "${roleTitle}"
- Company Name: "${companyName || 'Unknown Company'}"
- Job Description / Requirements context: "${jobDescription || 'Not provided'}"

Instructions:
1. Maintain absolute truthfulness. Do NOT invent new degrees, certifications, or work experience that the candidate does not have.
2. Highlight and emphasize the candidate's existing experience, tools, and technical accomplishments that directly align with the target job requirements.
3. Incorporate relevant keywords and key technical methodologies naturally into the bullet points.
4. Clean up structural metrics, converting key accomplishments into quantitative outcome metrics (e.g. SITUATION/TASK/ACTION/RESULT - STAR method) where possible.
5. Ensure the tailored resume maintains standard ATS-compliant markdown heading sections (using level-3 headers):
   - "### Professional Experience" (or "### Experience")
   - "### Education"
   - "### Skills" (or "### Technical Skills")
   - "### Projects" (or "### Key Projects", if candidate has projects listed)
6. Output ONLY the tailored Markdown CV. Do NOT include conversational prefaces, concluding notes, or markdown backticks wraps (\`\`\`markdown or \`\`\`).
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CANDIDATE CURRENT MASTER CV:\n\n${cvMarkdown}` }
      ]
    });

    const tailoredMarkdown = response.choices[0].message?.content?.trim() || '';

    // Strip markdown wrappers if any leaked
    const cleanMarkdown = tailoredMarkdown
      .replace(/^```markdown\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/, '')
      .trim();

    return NextResponse.json({
      success: true,
      cvMarkdown: cleanMarkdown
    });

  } catch (error: any) {
    console.error('CV Tailoring API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'CV tailoring failed.' }, { status: 500 });
  }
}
