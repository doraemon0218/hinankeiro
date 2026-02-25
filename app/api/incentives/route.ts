/**
 * 住民向け API: 自分に適用される訓練インセンティブ一覧（Agent D 型・Agent C が呼び出し）
 * 緯度・経度を渡すと、その地域向けキャンペーンのみ返す。未指定の場合は現在有効な全キャンペーン。
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCampaignsForUser } from '@/lib/admin/campaigns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    let position: { lat: number; lng: number } | undefined;
    if (
      latParam != null &&
      lngParam != null &&
      Number.isFinite(Number(latParam)) &&
      Number.isFinite(Number(lngParam))
    ) {
      position = { lat: Number(latParam), lng: Number(lngParam) };
    }
    const campaigns = await getCampaignsForUser(position);
    return NextResponse.json(campaigns);
  } catch (e) {
    console.error('GET /api/incentives', e);
    return NextResponse.json({ error: 'Failed to get incentives' }, { status: 500 });
  }
}
