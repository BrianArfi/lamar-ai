import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes, fitScore, appliedDate, tailoredCv, tailoredCvSkills, tailoredAtsScore } = await request.json();

    const updatedData: any = {};
    if (status !== undefined) updatedData.status = status;
    if (notes !== undefined) updatedData.notes = notes;
    if (fitScore !== undefined) updatedData.fitScore = parseFloat(fitScore);
    if (appliedDate !== undefined) updatedData.appliedDate = appliedDate ? new Date(appliedDate) : null;
    if (tailoredCv !== undefined) updatedData.tailoredCv = tailoredCv;
    if (tailoredCvSkills !== undefined) updatedData.tailoredCvSkills = tailoredCvSkills;
    if (tailoredAtsScore !== undefined) updatedData.tailoredAtsScore = tailoredAtsScore !== null ? parseInt(tailoredAtsScore) : null;

    const application = await prisma.application.update({
      where: { id },
      data: updatedData
    });

    return NextResponse.json({ success: true, data: application });

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

    await prisma.application.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Application successfully deleted.' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
