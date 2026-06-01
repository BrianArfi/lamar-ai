import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, starSituation, starTask, starAction, starResult, reflection, archetypeTags } = await request.json();

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (starSituation !== undefined) updatedData.starSituation = starSituation;
    if (starTask !== undefined) updatedData.starTask = starTask;
    if (starAction !== undefined) updatedData.starAction = starAction;
    if (starResult !== undefined) updatedData.starResult = starResult;
    if (reflection !== undefined) updatedData.reflection = reflection;
    if (archetypeTags !== undefined) {
      updatedData.archetypeTags = typeof archetypeTags === 'string' ? archetypeTags : JSON.stringify(archetypeTags);
    }

    const story = await prisma.story.update({
      where: { id },
      data: updatedData
    });

    return NextResponse.json({ success: true, data: story });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.story.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'STAR Story successfully deleted.' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
