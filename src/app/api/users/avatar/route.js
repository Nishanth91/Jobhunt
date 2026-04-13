import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatar: true },
  });

  return NextResponse.json({ avatar: user.avatar });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { avatar } = await request.json();

  // base64 of a 5MB file ≈ 6.8MB string — allow up to 7MB
  if (avatar && avatar.length > 7 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image too large (max 5MB)' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: null },
  });

  return NextResponse.json({ success: true });
}
