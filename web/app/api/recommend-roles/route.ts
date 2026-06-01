import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: Request) {
  try {
    const { cvText } = await request.json();

    if (!cvText || !cvText.trim()) {
      return NextResponse.json({ success: false, error: 'CV content is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'OPENAI_API_KEY is not configured on the server. Please check your environment variables.' 
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const systemPrompt = `You are a professional career recruiter and career matcher.
Analyze the candidate's CV text and suggest exactly 3-5 specific job titles (e.g. "Senior Software Engineer", "Product Manager", "AI Engineer") that represent a strong fit for their skills and experience.

You must respond with a clean, raw JSON object (and no markdown code block backticks or formatting, just plain text) with the following structure:
{
  "roles": [
    {
      "title": "Exact Role Title",
      "confidence": 95,
      "reason": "Explain in one sentence why this is a great fit based on their specific skills."
    }
  ]
}
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CANDIDATE CV CONTENT:\n\n${cvText}` }
      ]
    });

    const responseText = response.choices[0].message?.content?.trim() || '';

    // Strip markdown formatting if the model still outputs them
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      roles: parsedData.roles || []
    });

  } catch (error: any) {
    console.error('Role recommendation failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
