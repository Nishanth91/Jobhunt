import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { searchAllSources, searchJSearch, searchSerpAPI, searchAdzuna, searchRemotive, searchJobicy, searchTheMuse } from '@/lib/job-search';
import { calculateMatchScore } from '@/lib/ats-scorer';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const source = searchParams.get('source') || 'all';

  if (!query.trim()) {
    return NextResponse.json({ jobs: [], total: 0 });
  }

  // Get user's active resume + dismissed IDs in parallel
  const [resume, dismissed] = await Promise.all([
    prisma.resume.findFirst({
      where: { userId: session.user.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dismissedJob.findMany({
      where: { userId: session.user.id },
      select: { externalId: true },
    }),
  ]);

  const dismissedSet = new Set(dismissed.map((d) => d.externalId));

  let result;
  switch (source) {
    case 'jsearch':
      result = await searchJSearch({ query, location });
      break;
    case 'google':
      result = await searchSerpAPI({ query, location });
      break;
    case 'adzuna':
      result = await searchAdzuna({ query, location });
      break;
    case 'remotive':
      result = await searchRemotive({ query });
      break;
    case 'jobicy':
      result = await searchJobicy({ query });
      break;
    case 'themuse':
      result = await searchTheMuse({ query, location });
      break;
    default:
      result = await searchAllSources({ query, location });
  }

  // Filter dismissed jobs
  result.jobs = result.jobs.filter((job) => !dismissedSet.has(job.externalId));

  // Add match scores if resume exists
  if (resume && result.jobs.length > 0) {
    result.jobs = result.jobs.map((job) => ({
      ...job,
      matchScore: calculateMatchScore(
        { ...resume, skills: JSON.parse(resume.skills || '[]') },
        job.title,
        job.description,
        job.location
      ),
    }));
  }

  // Sort by most recent posted date first, then by match score as tiebreaker
  result.jobs.sort((a, b) => {
    const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
    const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
    if (dateB !== dateA) return dateB - dateA;
    return (b.matchScore || 0) - (a.matchScore || 0);
  });

  return NextResponse.json({
    ...result,
    debug: {
      adzunaConfigured: !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
      jsearchConfigured: !!process.env.JSEARCH_API_KEY,
      serpApiConfigured: !!process.env.SERPAPI_KEY,
      query,
      location,
    },
  });
}
