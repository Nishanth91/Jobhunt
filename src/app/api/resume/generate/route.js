import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTailoredResume } from '@/lib/resume-generator';
import { calculateATSScore } from '@/lib/ats-scorer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { resumeId, jobId, additionalText = '', linkedInUrl = '', downloadNow = false } = await request.json();

  const [resume, job, userProfile] = await Promise.all([
    prisma.resume.findFirst({ where: { id: resumeId, userId: session.user.id } }),
    prisma.savedJob.findFirst({ where: { id: jobId, userId: session.user.id } }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { linkedIn: true, phone: true, contactEmail: true } }),
  ]);

  if (!resume || !job) {
    return NextResponse.json({ error: 'Resume or job not found' }, { status: 404 });
  }

  // Use saved profile contact info; allow per-request override for linkedIn
  const resolvedLinkedIn = linkedInUrl || userProfile?.linkedIn || '';
  const resolvedPhone = userProfile?.phone || '';
  const resolvedEmail = userProfile?.contactEmail || '';

  try {
    const resumeData = {
      ...resume,
      name: session.user.name,
      skills: JSON.parse(resume.skills || '[]'),
      experience: JSON.parse(resume.experience || '[]'),
      education: JSON.parse(resume.education || '[]'),
    };

    const { buffer, content } = await generateTailoredResume(resumeData, job, additionalText, resolvedLinkedIn, resolvedPhone, resolvedEmail);

    // Calculate ATS score
    const atsResult = calculateATSScore(resume.rawText, job.description || '');

    // Save document record
    const doc = await prisma.tailoredDocument.create({
      data: {
        userId: session.user.id,
        jobId: job.id,
        type: 'RESUME',
        content: JSON.stringify(content),
        atsScore: atsResult.total,
      },
    });

    // Update job's ATS score
    await prisma.savedJob.update({ where: { id: job.id }, data: { atsScore: atsResult.total } });

    if (downloadNow) {
      // Return binary for direct download
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="Resume_${job.company}_${job.title}.docx"`.replace(/\s+/g, '_'),
        },
      });
    }

    // Return preview content as JSON
    return NextResponse.json({
      documentId: doc.id,
      content,
      atsScore: atsResult.total,
      atsBreakdown: atsResult,
    });
  } catch (err) {
    console.error('Resume generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
