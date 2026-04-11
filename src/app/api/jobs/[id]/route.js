import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const job = await prisma.savedJob.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { application: true, documents: { orderBy: { createdAt: 'desc' } } },
  });

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();

  // Update job status
  if (body.status) {
    const job = await prisma.savedJob.update({
      where: { id: params.id },
      data: { status: body.status, updatedAt: new Date() },
    });

    // Create/update application record for tracking
    if (['APPLIED', 'SCREENING', 'INTERVIEW', 'FINAL_ROUND', 'OFFER', 'REJECTED'].includes(body.status)) {
      await prisma.application.upsert({
        where: { jobId: params.id },
        update: { status: body.status, updatedAt: new Date() },
        create: {
          userId: session.user.id,
          jobId: params.id,
          status: body.status,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(job);
  }

  const job = await prisma.savedJob.update({
    where: { id: params.id },
    data: { ...body, updatedAt: new Date() },
  });

  return NextResponse.json(job);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await prisma.savedJob.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
