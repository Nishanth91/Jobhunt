import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  await prisma.tailoredDocument.deleteMany({
    where: { id: params.id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
