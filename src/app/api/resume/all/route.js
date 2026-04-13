import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  // Delete tailored documents first (they reference resumes via FK)
  await prisma.document.deleteMany({ where: { userId: session.user.id } });

  // Then delete all resumes
  await prisma.resume.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ success: true });
}
