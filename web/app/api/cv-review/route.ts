import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { cvText } = await request.json();

    if (!cvText || !cvText.trim()) {
      return NextResponse.json({ success: false, error: 'CV content is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'OPENAI_API_KEY is not configured on the server.' 
      }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Use gpt-5.4-mini as the default thinking/smart model for deep review
    const model = 'gpt-5.4-mini';

    const systemPrompt = `You are a world-class executive resume auditor and ATS compliance specialist.
Analyze the candidate's CV text and provide a highly detailed, constructive, and actionable review.
Your analysis must be structured exactly as a clean, raw JSON object (without any markdown formatting or code blocks) with the following schema:
{
  "overallScore": 65, // A number between 0 and 100
  "sections": [
    {
      "name": "Professional Summary", // or "Work Experience", "Skills", "Education"
      "score": 50, // Section score 0-100
      "status": "needs_improvement", // "excellent" | "good" | "needs_improvement"
      "suggestions": [
        {
          "priority": "HIGH", // "HIGH" | "MEDIUM" | "LOW"
          "text": "Specific, actionable feedback. E.g. 'Add 2-3 sentence summary emphasizing cloud infrastructure expertise instead of general phrases.'"
        }
      ]
    }
  ],
  "quickWins": [
    "Short, easy-to-fix suggestions that have high impact, like 'Add clickable LinkedIn profile url', 'Bold technical skills tags'"
  ],
  "antiPatterns": [
    {
      "type": "too_generic", // E.g. "too_generic", "no_metrics", "formatting", "wordiness"
      "message": "Explain what anti-pattern is present and how to eliminate it."
    }
  ]
}

Be critical, encouraging, and highly specific. Ensure you analyze "Work Experience" for missing metrics/KPIs, and "Skills" for organization.`;

    const response = await openai.chat.completions.create({
      model: model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `CANDIDATE CV TEXT:\n\n${cvText}` }
      ]
    });

    const responseText = response.choices[0].message?.content?.trim() || '';

    // Strip markdown formatting if outputted
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/```$/, '')
      .trim();

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      review: parsedData
    });

  } catch (error: any) {
    console.error('Deep CV Review API failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to review CV.' }, { status: 500 });
  }
}
