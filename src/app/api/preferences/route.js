import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await request.json();

  const pref = await prisma.preference.upsert({
    where: { userId: session.user.id },
    update: {
      jobRoles: JSON.stringify(body.jobRoles || []),
      locations: JSON.stringify(body.locations || []),
      industries: JSON.stringify(body.industries || []),
      jobType: body.jobType || 'any',
      minSalary: body.minSalary || null,
      maxSalary: body.maxSalary || null,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      jobRoles: JSON.stringify(body.jobRoles || []),
      locations: JSON.stringify(body.locations || []),
      industries: JSON.stringify(body.industries || []),
      jobType: body.jobType || 'any',
      minSalary: body.minSalary || null,
      maxSalary: body.maxSalary || null,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json(pref);
}
