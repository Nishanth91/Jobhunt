import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTailoredResume } from '@/lib/resume-generator';
import { calculateATSScore } from '@/lib/ats-scorer';
import { NextResponse } from 'next/server';

/**
 * Tailor the user's active resume against a pasted job description.
 * No SavedJob needed — used by the /tailor page where the user just
 * wants a downloadable tailored resume for an external listing.
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();
  const {
    jobDescription = '',
    jobTitle = '',
    company = '',
    additionalText = '',
    linkedInUrl = '',
    download = false,
  } = body;

  if (!jobDescription || jobDescription.trim().length < 40) {
    return NextResponse.json({ error: 'Paste a full job description (at least a few sentences).' }, { status: 400 });
  }

  const [resume, userProfile] = await Promise.all([
    prisma.resume.findFirst({ where: { userId: session.user.id, isActive: true } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { linkedIn: true, phone: true, contactEmail: true },
    }),
  ]);

  if (!resume) {
    return NextResponse.json({
      error: 'No active resume. Upload a resume and mark it active under Resumes first.',
    }, { status: 400 });
  }

  const resolvedLinkedIn = linkedInUrl || userProfile?.linkedIn || '';
  const resolvedPhone = userProfile?.phone || '';
  const resolvedEmail = userProfile?.contactEmail || '';

  const resumeData = {
    ...resume,
    name: session.user.name,
    skills: JSON.parse(resume.skills || '[]'),
    experience: JSON.parse(resume.experience || '[]'),
    education: JSON.parse(resume.education || '[]'),
  };

  const job = {
    title: jobTitle || 'Target Role',
    company: company || 'Target Company',
    description: jobDescription,
  };

  try {
    const { buffer, content, plainText } = await generateTailoredResume(
      resumeData, job, additionalText,
      resolvedLinkedIn, resolvedPhone, resolvedEmail,
    );

    const ats = calculateATSScore(plainText || resume.rawText, jobDescription, { jobTitle: job.title });

    if (download) {
      const safeCompany = (company || 'JobDescription').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().replace(/\s+/g, '_') || 'JobDescription';
      const safeResume = (session.user.name || 'Resume').replace(/[^a-zA-Z0-9\s\-_]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${safeResume}_${safeCompany}_Tailored.docx`;
      return new Response(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      content,
      atsScore: ats.total,
      atsBreakdown: ats,
    });
  } catch (err) {
    console.error('Custom tailor error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
