import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateATSScore } from '@/lib/ats-scorer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { resumeId, jobId } = await request.json();

  const [resume, job] = await Promise.all([
    prisma.resume.findFirst({ where: { id: resumeId, userId: session.user.id } }),
    prisma.savedJob.findFirst({ where: { id: jobId, userId: session.user.id } }),
  ]);

  if (!resume || !job) {
    return NextResponse.json({ error: 'Resume or job not found' }, { status: 404 });
  }

  const result = calculateATSScore(resume.rawText, job.description || '');

  // Update the saved job's ATS score
  await prisma.savedJob.update({
    where: { id: jobId },
    data: { atsScore: result.total },
  });

  return NextResponse.json(result);
}
