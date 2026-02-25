/**
 * 行政向け API: 訓練インセンティブキャンペーン一覧・作成（Agent D）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { IncentiveCampaignCreate } from '@/shared/types';
import { getCampaigns, createCampaign } from '@/lib/admin/campaigns';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validAt = searchParams.get('validAt') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Number(limitParam), 200) : undefined;
    const list = await getCampaigns({ limit, validAt });
    return NextResponse.json(list);
  } catch (e) {
    console.error('GET /api/admin/campaigns', e);
    return NextResponse.json({ error: 'Failed to list campaigns' }, { status: 500 });
  }
}

function parseBody(body: unknown): IncentiveCampaignCreate | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (typeof b.name !== 'string' || !b.targeting || !b.reward || !b.condition) return null;
  const targeting = b.targeting as Record<string, unknown>;
  if (
    typeof targeting.validFrom !== 'string' ||
    typeof targeting.validTo !== 'string'
  )
    return null;
  const budgetLimits =
    b.budgetLimits && typeof b.budgetLimits === 'object'
      ? (b.budgetLimits as IncentiveCampaignCreate['budgetLimits'])
      : undefined;
  return {
    name: b.name as string,
    description: typeof b.description === 'string' ? b.description : undefined,
    targeting: b.targeting as IncentiveCampaignCreate['targeting'],
    reward: b.reward as IncentiveCampaignCreate['reward'],
    condition: b.condition as IncentiveCampaignCreate['condition'],
    budgetLimits,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = parseBody(body);
    if (!data) {
      return NextResponse.json(
        {
          error:
            'Invalid body. Required: name, targeting { validFrom, validTo, region?, ageRange?, gender? }, reward { type, name?, amountYen?, ... }, condition { minTrainingCount?, scenarioId? }',
        },
        { status: 400 }
      );
    }
    const campaign = await createCampaign(data);
    return NextResponse.json(campaign, { status: 201 });
  } catch (e) {
    console.error('POST /api/admin/campaigns', e);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
