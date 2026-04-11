import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET - list user's saved jobs
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const jobs = await prisma.savedJob.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(jobs);
}

// POST - save a job
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();

  // Check for duplicate
  if (body.externalId) {
    const existing = await prisma.savedJob.findFirst({
      where: { userId: session.user.id, externalId: body.externalId },
    });
    if (existing) return NextResponse.json(existing);
  }

  const job = await prisma.savedJob.create({
    data: {
      userId: session.user.id,
      externalId: body.externalId || null,
      title: body.title || 'Unknown Title',
      company: body.company || 'Unknown Company',
      location: body.location || 'Not specified',
      description: (body.description || '').slice(0, 30000),
      url: body.url || '',
      salary: body.salary || null,
      postedAt: body.postedAt ? new Date(body.postedAt) : null,
      source: body.source || 'manual',
      companyWebsite: body.companyWebsite || null,
      hrEmail: body.hrEmail || null,
      matchScore: body.matchScore || 0,
      atsScore: body.atsScore || 0,
      status: 'SAVED',
    },
  });

  return NextResponse.json(job, { status: 201 });
}
