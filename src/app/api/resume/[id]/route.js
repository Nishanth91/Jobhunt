import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await prisma.resume.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}

// PATCH — toggle active status
export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { isActive } = await request.json();

  if (isActive) {
    // Deactivate all other resumes first
    await prisma.resume.updateMany({
      where: { userId: session.user.id },
      data: { isActive: false },
    });
  }

  // Set this resume's active status
  await prisma.resume.update({
    where: { id: params.id },
    data: { isActive },
  });

  return NextResponse.json({ success: true });
}
