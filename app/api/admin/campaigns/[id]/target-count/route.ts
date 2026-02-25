/**
 * 行政向け API: キャンペーンの想定対象者数（地域内の生活拠点ユーザー数）（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCampaignTargetUserCount } from '@/lib/admin/campaigns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const result = await getCampaignTargetUserCount(id, { from, to });
    return NextResponse.json(result);
  } catch (e) {
    console.error('GET /api/admin/campaigns/[id]/target-count', e);
    return NextResponse.json({ error: 'Failed to get target count' }, { status: 500 });
  }
}
