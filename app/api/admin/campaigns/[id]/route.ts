/**
 * 行政向け API: キャンペーン 1件取得・更新・削除（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { IncentiveCampaignCreate } from '@/shared/types';
import { getCampaignById, updateCampaign, deleteCampaign } from '@/lib/admin/campaigns';

/** 静的エクスポート用（GitHub Pages）。1件だけ生成してビルドを通す */
export function generateStaticParams() {
  return [{ id: '_' }];
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (e) {
    console.error('GET /api/admin/campaigns/[id]', e);
    return NextResponse.json({ error: 'Failed to get campaign' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<IncentiveCampaignCreate>;
    const campaign = await updateCampaign(id, body);
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (e) {
    console.error('PATCH /api/admin/campaigns/[id]', e);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteCampaign(id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/admin/campaigns/[id]', e);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
