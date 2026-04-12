import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diag = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasTursoUrl: !!process.env.TURSO_DATABASE_URL,
    hasTursoToken: !!process.env.TURSO_AUTH_TOKEN,
    hasDbUrl: !!process.env.DATABASE_URL,
  };

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
    });
    diag.dbConnected = true;
    diag.userCount = users.length;
    diag.users = users.map(u => u.email);
  } catch (e) {
    diag.dbConnected = false;
    diag.dbError = e.message;
    diag.dbErrorStack = e.stack?.split('\n').slice(0, 5);
  }

  return NextResponse.json(diag);
}
