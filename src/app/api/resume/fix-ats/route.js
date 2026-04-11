import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateATSScore } from '@/lib/ats-scorer';
import { injectKeywordsIntoResume } from '@/lib/resume-generator';
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

  // Get current ATS score and missing keywords
  const before = calculateATSScore(resume.rawText, job.description || '');

  // Inject missing keywords into the resume raw text
  const fixedText = injectKeywordsIntoResume(resume.rawText, before.missingKeywords);

  // Calculate new ATS score
  const after = calculateATSScore(fixedText, job.description || '');

  // Save fixed resume as a new version
  await prisma.resume.updateMany({ where: { userId: session.user.id }, data: { isActive: false } });

  const fixedResume = await prisma.resume.create({
    data: {
      userId: session.user.id,
      fileName: `${resume.fileName} (ATS Fixed)`,
      filePath: resume.filePath,
      rawText: fixedText,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      summary: resume.summary,
      jobTitle: resume.jobTitle,
      yearsExp: resume.yearsExp,
      isActive: true,
    },
  });

  // Update job ATS score
  await prisma.savedJob.update({ where: { id: job.id }, data: { atsScore: after.total } });

  return NextResponse.json({
    before: before.total,
    after: after.total,
    addedKeywords: before.missingKeywords,
    resumeId: fixedResume.id,
  });
}
