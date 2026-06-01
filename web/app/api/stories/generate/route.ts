import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '../../../lib/db';
import { ensureDefaultUser } from '../../../lib/seed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const userId = await ensureDefaultUser();

    // 1. Fetch user's Master CV
    const masterCv = await prisma.resume.findFirst({
      where: { userId, isMaster: true }
    });

    if (!masterCv) {
      return NextResponse.json({ 
        success: false, 
        error: 'Master CV not found. Please upload or write your CV first in the CV Tailoring Studio so the AI can generate stories tailored to your actual accomplishments.' 
      }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key is not configured.' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    const systemPrompt = `You are an elite career coach and interview preparation expert.
Your job is to analyze the user's master CV and generate three (3) highly compelling behavioral interview stories tailored specifically to their actual experiences and accomplishments.
Each story MUST strictly follow the STAR (Situation, Task, Action, Result) methodology.

Please choose 3 different behavioral archetypes based on their CV experiences (e.g. "Problem Solving", "Technical Leadership", "Conflict Resolution", "Innovation", "Teamwork").

Output format requirements:
You MUST output a valid JSON array of objects. Do not include any markdown block wrapping like \`\`\`json or \`\`\`. Just output the raw JSON text directly.
Each object in the array must have the following fields:
- "title": A short, punchy title for the accomplishment (e.g., "Optimizing E-commerce Checkout Flow")
- "archetypeTags": An array of 1 or 2 strings representing competency categories (e.g., ["Problem Solving", "Innovation"])
- "starSituation": A detailed description of the Situation (the context, background, and challenges faced)
- "starTask": A detailed description of the Task (what needed to be done, the goal, and your responsibility)
- "starAction": A detailed description of the Action (exactly what YOU did, step-by-step, the decisions, and execution)
- "starResult": A detailed description of the Result (the positive outcomes, quantified metrics, percentages, or concrete success)
- "reflection": A brief, valuable lesson learned or key takeaway from this experience.

Rules:
1. Ground the stories 100% in their actual CV experiences (companies, roles, achievements). Do not make up fake companies or fake experience.
2. Embellish the STAR structure to make it sound premium, professional, and impact-driven, using proper technical terms and high-impact action verbs.
3. Keep the JSON perfectly valid.
`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `USER MASTER CV:\n\n${masterCv.cvMarkdown}` }
      ]
    });

    const text = response.choices[0].message?.content || '';
    
    // Parse the JSON array
    let generatedStories = [];
    try {
      // Clean up markdown block if it was included despite prompt instruction
      const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedStories = JSON.parse(jsonText);
    } catch (parseError: any) {
      console.error("Failed to parse OpenAI JSON output:", parseError, text);
      return NextResponse.json({ 
        success: false, 
        error: 'AI did not return a valid JSON array. Please try again.',
        rawOutput: text
      }, { status: 500 });
    }

    // Save the stories to the user's database automatically!
    const createdStories = [];
    for (const s of generatedStories) {
      const story = await prisma.story.create({
        data: {
          userId,
          title: s.title || 'AI Achievement',
          starSituation: s.starSituation || '',
          starTask: s.starTask || '',
          starAction: s.starAction || '',
          starResult: s.starResult || '',
          reflection: s.reflection || null,
          archetypeTags: JSON.stringify(s.archetypeTags || [])
        }
      });
      createdStories.push(story);
    }

    return NextResponse.json({ success: true, data: createdStories });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
