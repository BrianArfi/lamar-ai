import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '../../lib/db';

export async function POST(request: Request) {
  try {
    // 1. Verify Sync Token Auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Missing sync token.' }, { status: 401 });
    }

    const syncToken = authHeader.substring(7).trim();
    if (!syncToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Empty sync token.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      include: { resumes: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Invalid sync token.' }, { status: 401 });
    }

    // 2. Parse request payload
    const { fields, cvId } = await request.json();
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json({ success: false, error: 'No form fields provided.' }, { status: 400 });
    }

    // 3. Load CV content
    let selectedCv = user.resumes.find(r => r.id === cvId);
    if (!selectedCv) {
      // Fallback to Master CV
      selectedCv = user.resumes.find(r => r.isMaster) || user.resumes[0];
    }

    if (!selectedCv) {
      return NextResponse.json({ success: false, error: 'No CV found for this user. Please upload a CV first.' }, { status: 400 });
    }

    const cvMarkdown = selectedCv.cvMarkdown;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Separate fields into custom essay/textareas and standard simple fields
    // Custom/essay fields are textareas or long text inputs with questions like "why", "describe", "experience"
    const essayFields = fields.filter(f => {
      const type = (f.type || '').toLowerCase();
      const label = (f.label || '').toLowerCase();
      const placeholder = (f.placeholder || '').toLowerCase();
      const name = (f.name || '').toLowerCase();

      return type === 'textarea' || 
             label.includes('why') || label.includes('tell us') || label.includes('describe') ||
             placeholder.includes('why') || name.includes('essay') || name.includes('question') ||
             label.includes('explain') || label.includes('cover letter');
    });

    const standardFields = fields.filter(f => !essayFields.includes(f));

    const resultMapping: Record<string, string> = {};

    // 4. Fill Standard Fields (Using fast model: gpt-5.4-nano)
    if (standardFields.length > 0) {
      const standardPrompt = `You are a helper that extracts basic contact and work details from a CV to auto-fill job application form fields.
Analyze the candidate's CV and map the appropriate value to each form field listed.
Only fill fields where you can identify highly relevant information from the CV (e.g. First Name, Last Name, Email, Phone, LinkedIn, GitHub, Location/Address, current job title).
If a field is not found or not applicable (like password, upload file fields), return an empty string for that field key.

You must respond with a clean, raw JSON object mapping the input field ID or Name to its extracted value:
{
  "fieldIdOrName": "value_to_fill"
}

DO NOT include markdown backticks or formatting.`;

      const standardResponse = await openai.chat.completions.create({
        model: 'gpt-5.4-nano',
        temperature: 0.1,
        messages: [
          { role: 'system', content: standardPrompt },
          { role: 'user', content: `CANDIDATE CV:\n\n${cvMarkdown}\n\nFORM FIELDS TO FILL:\n${JSON.stringify(standardFields, null, 2)}` }
        ]
      });

      const responseText = standardResponse.choices[0].message?.content?.trim() || '';
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
      
      try {
        const parsedStandard = JSON.parse(cleanJson);
        Object.assign(resultMapping, parsedStandard);
      } catch (e) {
        console.error('Failed to parse standard fields response:', e, responseText);
      }
    }

    // 5. Fill Essay/Custom Questions (Using thinking model: gpt-5.4-mini)
    if (essayFields.length > 0) {
      for (const field of essayFields) {
        const essayPrompt = `You are a professional resume writer helping a candidate fill a custom, long-answer question on a job application.
Using the candidate's CV, write a highly professional, tailored, and compelling answer (between 100 and 200 words) for the following question.
Align your tone to be enthusiastic, professional, and impact-oriented. Focus on actual achievements present in the CV.
If the question is about why they want to join, write a persuasive draft referencing standard career growth alignment.

You must respond with a clean, raw JSON object mapping the input field ID or Name to its generated draft:
{
  "${field.id || field.name}": "generated_answer_text_here"
}

DO NOT include markdown backticks or formatting.`;

        const essayResponse = await openai.chat.completions.create({
          model: 'gpt-5.4-mini',
          temperature: 0.6,
          messages: [
            { role: 'system', content: essayPrompt },
            { role: 'user', content: `CANDIDATE CV:\n\n${cvMarkdown}\n\nQUESTION TO ANSWER:\nLabel: ${field.label}\nName: ${field.name}\nPlaceholder: ${field.placeholder}` }
          ]
        });

        const responseText = essayResponse.choices[0].message?.content?.trim() || '';
        const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();

        try {
          const parsedEssay = JSON.parse(cleanJson);
          Object.assign(resultMapping, parsedEssay);
        } catch (e) {
          console.error('Failed to parse essay field response:', e, responseText);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: resultMapping
    });

  } catch (error: any) {
    console.error('Autofill API failed:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to auto-fill form.' }, { status: 500 });
  }
}
