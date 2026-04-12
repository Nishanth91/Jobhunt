import { NextResponse } from 'next/server';
import { getSalaryInsights } from '@/lib/salary-data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  if (!role) {
    return NextResponse.json(
      { error: 'Missing required parameter: role' },
      { status: 400 }
    );
  }

  const insights = getSalaryInsights(role);

  if (!insights) {
    return NextResponse.json(
      { error: `No salary data found for "${role}". Try a different role title.` },
      { status: 404 }
    );
  }

  return NextResponse.json(insights);
}
