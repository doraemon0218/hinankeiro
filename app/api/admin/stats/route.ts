/**
 * 行政向け集計 API: 期間別の訓練数・成功率等（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedStats } from '@/lib/analytics/aggregation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const scenarioId = searchParams.get('scenarioId') ?? undefined;
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Query parameters "from" and "to" (ISO8601 date) are required' },
        { status: 400 }
      );
    }
    const stats = await getAggregatedStats({ from, to, scenarioId });
    return NextResponse.json(stats);
  } catch (e) {
    console.error('GET /api/admin/stats', e);
    return NextResponse.json({ error: 'Failed to get aggregated stats' }, { status: 500 });
  }
}
