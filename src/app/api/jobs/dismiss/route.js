import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST — dismiss a job by externalId
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { externalId, jobId } = await request.json();

  if (jobId) {
    // Dismiss a saved job — mark as DISMISSED status
    await prisma.savedJob.updateMany({
      where: { id: jobId, userId: session.user.id },
      data: { status: 'DISMISSED' },
    });
  } else if (externalId) {
    // Dismiss an unsaved search result — store in dismissed list
    await prisma.dismissedJob.upsert({
      where: { userId_externalId: { userId: session.user.id, externalId } },
      update: {},
      create: { userId: session.user.id, externalId },
    });
  }

  return NextResponse.json({ success: true });
}

// GET — return list of dismissed externalIds for current user
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const dismissed = await prisma.dismissedJob.findMany({
    where: { userId: session.user.id },
    select: { externalId: true },
  });

  return NextResponse.json(dismissed.map((d) => d.externalId));
}
