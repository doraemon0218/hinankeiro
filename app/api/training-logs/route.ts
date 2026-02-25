/**
 * 訓練ログ API（Agent B）
 * POST: ログ保存 / GET: ログ取得（userId / 期間 / scenarioId でフィルタ）
 */

import { NextRequest, NextResponse } from 'next/server';
import type { TrainingLogCreate, TransportMode } from '@/shared/types';
import { createTrainingLog, getTrainingLogs } from '@/lib/logs/training-logs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const route = body?.route as Record<string, unknown> | undefined;
    const validModes: TransportMode[] = ['walk', 'wheelchair', 'crutch', 'other'];
    if (
      !body ||
      typeof body.userId !== 'string' ||
      typeof body.scenarioId !== 'string' ||
      !route ||
      !Array.isArray(route.coordinates) ||
      typeof route.durationSeconds !== 'number' ||
      typeof route.distanceMeters !== 'number' ||
      typeof body.startedAt !== 'string' ||
      typeof body.finishedAt !== 'string' ||
      typeof body.evacuatedInTime !== 'boolean' ||
      typeof body.consentToShareWithGovernment !== 'boolean' ||
      !validModes.includes(body.transportMode as TransportMode) ||
      !Array.isArray(body.actualTrajectory) ||
      typeof body.actualDistanceMeters !== 'number' ||
      typeof body.actualDurationSeconds !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid body. Required: userId, scenarioId, route{coordinates,durationSeconds,distanceMeters}, startedAt, finishedAt, evacuatedInTime, consentToShareWithGovernment, transportMode, actualTrajectory, actualDistanceMeters, actualDurationSeconds' },
        { status: 400 }
      );
    }
    const data: TrainingLogCreate = {
      userId: body.userId as string,
      scenarioId: body.scenarioId as string,
      route: {
        coordinates: route.coordinates as TrainingLogCreate['route']['coordinates'],
        durationSeconds: route.durationSeconds as number,
        distanceMeters: route.distanceMeters as number,
      },
      startedAt: body.startedAt as string,
      finishedAt: body.finishedAt as string,
      evacuatedInTime: body.evacuatedInTime as boolean,
      consentToShareWithGovernment: body.consentToShareWithGovernment as boolean,
      transportMode: body.transportMode as TransportMode,
      actualTrajectory: body.actualTrajectory as TrainingLogCreate['actualTrajectory'],
      actualDistanceMeters: body.actualDistanceMeters as number,
      actualDurationSeconds: body.actualDurationSeconds as number,
    };
    const log = await createTrainingLog(data);
    return NextResponse.json(log, { status: 201 });
  } catch (e) {
    console.error('POST /api/training-logs', e);
    return NextResponse.json({ error: 'Failed to create training log' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') ?? undefined;
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;
    const scenarioId = searchParams.get('scenarioId') ?? undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Number(limitParam), 500) : undefined;

    const logs = await getTrainingLogs({ userId, from, to, scenarioId, limit });
    return NextResponse.json(logs);
  } catch (e) {
    console.error('GET /api/training-logs', e);
    return NextResponse.json({ error: 'Failed to fetch training logs' }, { status: 500 });
  }
}
