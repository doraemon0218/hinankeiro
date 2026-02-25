/**
 * 行政向け API: ユーザー別運動能力（匿名）（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserMobilityProfiles } from '@/lib/analytics/aggregation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const scenarioId = searchParams.get('scenarioId') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Number(limitParam), 5000) : undefined;

    const profiles = await getUserMobilityProfiles({ from, to, scenarioId, limit });
    return NextResponse.json(profiles);
  } catch (e) {
    console.error('GET /api/admin/mobility', e);
    return NextResponse.json({ error: 'Failed to get mobility profiles' }, { status: 500 });
  }
}
