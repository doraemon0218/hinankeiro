/**
 * 行政向け API: 避難施設設置シミュレーション（Agent D）
 * POST: 候補地・シナリオ・費用単価を送ると、想定避難人数・推奨キャパシティ・概算費用を返す
 */

import { NextRequest, NextResponse } from 'next/server';
import type { EvacuationFacilitySimulationInput } from '@/shared/types';
import { runEvacuationFacilitySimulation } from '@/lib/analytics/facility-simulation';

type SimulateBody = {
  location?: { lat: number; lng: number };
  scenarioId?: string;
  tsunamiArrivalSeconds?: number;
  period?: { from: string; to: string };
  costPerPerson?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SimulateBody;
    if (
      !body ||
      !body.location ||
      typeof body.location.lat !== 'number' ||
      typeof body.location.lng !== 'number' ||
      typeof body.scenarioId !== 'string'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid body. Required: location { lat, lng }, scenarioId. Optional: tsunamiArrivalSeconds, period { from, to }, costPerPerson',
        },
        { status: 400 }
      );
    }
    const input: EvacuationFacilitySimulationInput = {
      location: { lat: body.location.lat, lng: body.location.lng },
      scenarioId: body.scenarioId,
      tsunamiArrivalSeconds:
        typeof body.tsunamiArrivalSeconds === 'number' ? body.tsunamiArrivalSeconds : undefined,
      period:
        body.period && typeof body.period.from === 'string' && typeof body.period.to === 'string'
          ? { from: body.period.from, to: body.period.to }
          : undefined,
    };
    const costPerPerson =
      typeof body.costPerPerson === 'number' && body.costPerPerson >= 0
        ? body.costPerPerson
        : undefined;
    const result = await runEvacuationFacilitySimulation(input, { costPerPerson });
    return NextResponse.json(result);
  } catch (e) {
    console.error('POST /api/admin/simulate-facility', e);
    return NextResponse.json(
      { error: 'Failed to run facility simulation' },
      { status: 500 }
    );
  }
}
