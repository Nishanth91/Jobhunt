import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseResume } from '@/lib/resume-parser';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('resume');

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the resume in memory (no disk write needed — works on serverless)
    const parsed = await parseResume(buffer, file.type);

    // Deactivate previous resumes
    await prisma.resume.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });

    // Save to database — store parsed data, filePath is just a reference label
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        filePath: `memory://${session.user.id}/${file.name}`,
        rawText: parsed.rawText.slice(0, 50000), // cap at 50k chars
        skills: JSON.stringify(parsed.skills),
        experience: JSON.stringify(parsed.experience),
        education: JSON.stringify(parsed.education),
        summary: parsed.summary,
        jobTitle: parsed.jobTitle,
        yearsExp: parsed.yearsExp,
        isActive: true,
      },
    });

    return NextResponse.json({
      id: resume.id,
      fileName: resume.fileName,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      yearsExp: parsed.yearsExp,
      jobTitle: parsed.jobTitle,
      summary: parsed.summary,
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
