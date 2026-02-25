/**
 * ユーザー属性（年齢・性別・移動能力）の登録・取得
 * 住民が最初に入力。インセンティブ対象判定に利用（Agent C が呼び出し）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { MobilityCapability } from '@/shared/types';
import { getDemographics, upsertDemographics } from '@/lib/user/demographics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Query parameter "userId" is required' },
        { status: 400 }
      );
    }
    const demographics = await getDemographics(userId);
    if (!demographics) return NextResponse.json(null);
    return NextResponse.json(demographics);
  } catch (e) {
    console.error('GET /api/user/demographics', e);
    return NextResponse.json({ error: 'Failed to get demographics' }, { status: 500 });
  }
}

const MOBILITY_VALUES: MobilityCapability[] = [
  'walk',
  'run',
  'bicycle',
  'car',
  'cane',
  'wheelchair',
  'bedridden',
];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof (body as Record<string, unknown>).userId !== 'string') {
      return NextResponse.json(
        { error: 'Body must include "userId". Optional: age, gender, mobilityCapability' },
        { status: 400 }
      );
    }
    const b = body as Record<string, unknown>;
    const userId = b.userId as string;
    const age = typeof b.age === 'number' && b.age >= 0 && b.age <= 120 ? b.age : undefined;
    const gender =
      b.gender === 'male' || b.gender === 'female' || b.gender === 'other' ? b.gender : undefined;
    const mobilityCapability =
      typeof b.mobilityCapability === 'string' && MOBILITY_VALUES.includes(b.mobilityCapability as MobilityCapability)
        ? (b.mobilityCapability as MobilityCapability)
        : undefined;
    const demographics = await upsertDemographics(userId, {
      age,
      gender,
      mobilityCapability,
    });
    return NextResponse.json(demographics);
  } catch (e) {
    console.error('POST /api/user/demographics', e);
    return NextResponse.json({ error: 'Failed to save demographics' }, { status: 500 });
  }
}
