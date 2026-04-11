import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateCoverLetter, generateApplicationEmail } from '@/lib/cover-letter-generator';
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

  const resumeData = {
    ...resume,
    skills: JSON.parse(resume.skills || '[]'),
    experience: JSON.parse(resume.experience || '[]'),
  };

  const coverLetter = generateCoverLetter(resumeData, job, session.user.name);
  const email = generateApplicationEmail(resumeData, job, session.user.name);

  // Save to database
  await prisma.tailoredDocument.create({
    data: {
      userId: session.user.id,
      jobId: job.id,
      type: 'COVER_LETTER',
      content: coverLetter,
    },
  });

  await prisma.tailoredDocument.create({
    data: {
      userId: session.user.id,
      jobId: job.id,
      type: 'EMAIL',
      content: JSON.stringify(email),
    },
  });

  return NextResponse.json({ coverLetter, email });
}
