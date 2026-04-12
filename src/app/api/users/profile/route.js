import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { linkedIn: true, phone: true, contactEmail: true },
  });

  return NextResponse.json(user || {});
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { linkedIn, phone, contactEmail } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      linkedIn: linkedIn?.trim() || null,
      phone: phone?.trim() || null,
      contactEmail: contactEmail?.trim() || null,
    },
  });

  return NextResponse.json({ success: true });
}
