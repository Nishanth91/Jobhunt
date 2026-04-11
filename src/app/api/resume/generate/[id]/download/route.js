import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTailoredResume } from '@/lib/resume-generator';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const doc = await prisma.tailoredDocument.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { job: true },
  });

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const resume = await prisma.resume.findFirst({
    where: { userId: session.user.id, isActive: true },
  });

  if (!resume) return NextResponse.json({ error: 'No active resume' }, { status: 404 });

  const resumeData = {
    ...resume,
    name: session.user.name,
    skills: JSON.parse(resume.skills || '[]'),
    experience: JSON.parse(resume.experience || '[]'),
    education: JSON.parse(resume.education || '[]'),
  };

  // Retrieve stored additional text from the document content if available
  let additionalText = '';
  try {
    const stored = JSON.parse(doc.content || '{}');
    additionalText = stored.additional || '';
  } catch { /* ignore */ }

  const { buffer } = await generateTailoredResume(resumeData, doc.job, additionalText);

  // Filename: Resume_RoleName_CompanyName.docx — clean, no timestamps
  const safeName = (s) => s.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
  const filename = `Resume_${safeName(doc.job.title)}_${safeName(doc.job.company)}.docx`;

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
