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
- Job Description context: "${jobDescription || 'Not provided'}"

Instructions:
1. Maintain absolute truthfulness. Do NOT invent new degrees, certifications, or roles that the candidate does not have.
2. Highlight and emphasize the candidate's existing experience, tools, and technical accomplishments that directly align with the target job requirements.
3. Incorporate relevant keywords and key technical methodologies naturally into the bullet points.
4. ATS Gap Analysis: Identify critical requirements or tools in the job description that are completely absent in the candidate's CV.
   - For each gap, generate a tailored bullet point recommendation showing how they can describe related transferrable experience, personal research projects, or self-taught skills to address it.

You must respond with a clean, raw JSON object (with no markdown code block backticks, just plain text) with the following structure:
{
  "cvMarkdown": "The tailored Markdown CV content",
  "suggestedAdditions": [
    {
      "gap": "The required tool or experience (e.g. 'Kubernetes clustering experience')",
      "recommendation": "Drafted bullet point. E.g. 'Engineered a personal homelab Kubernetes cluster to test microservices orchestration and container network interfaces, simulating production high availability workflows.'"
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CANDIDATE CURRENT MASTER CV:\n\n${cvMarkdown}` }
      ]
    });

    const responseText = response.choices[0].message?.content?.trim() || '';

    // Strip markdown formatting if any leaked
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      cvMarkdown: parsedData.cvMarkdown,
      suggestedAdditions: parsedData.suggestedAdditions || []
    });

  } catch (error: any) {
    console.error('CV Tailoring API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'CV tailoring failed.' }, { status: 500 });
  }
}
