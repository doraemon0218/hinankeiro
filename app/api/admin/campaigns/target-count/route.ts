/**
 * 行政向け API: キャンペーンの想定対象者数（id はクエリで指定。静的エクスポート対応）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCampaignTargetUserCount } from '@/lib/admin/campaigns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const result = await getCampaignTargetUserCount(id, { from, to });
    return NextResponse.json(result);
  } catch (e) {
    console.error('GET /api/admin/campaigns/target-count', e);
    return NextResponse.json({ error: 'Failed to get target count' }, { status: 500 });
  }
}
