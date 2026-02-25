/**
 * 行政向け API: 生活拠点の集計データ（匿名）（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLifeBasePoints } from '@/lib/analytics/aggregation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const scenarioId = searchParams.get('scenarioId') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Number(limitParam), 5000) : undefined;

    const points = await getLifeBasePoints({ from, to, scenarioId, limit });
    return NextResponse.json(points);
  } catch (e) {
    console.error('GET /api/admin/life-bases', e);
    return NextResponse.json({ error: 'Failed to get life base points' }, { status: 500 });
  }
}
