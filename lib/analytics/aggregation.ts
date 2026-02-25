/**
 * 行政向け集計: 訓練ログから生活拠点・運動能力を算出（Agent D）
 * shared/types.ts の LifeBasePoint, UserMobilityProfile, AggregatedStats に準拠
 */

import type {
  LifeBasePoint,
  UserMobilityProfile,
  LatLng,
  AggregatedStats,
} from '../../shared/types';
import { getTrainingLogs } from '../logs/training-logs';

/** 2点間の直線距離（メートル）簡易計算（ Haversine 近似） */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000; // 地球半径 m
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** 訓練ログ一覧から生活拠点を集計（同意済み・匿名。ユーザーごとに直近の経路起点を代表とする） */
export async function getLifeBasePoints(options: {
  from?: string;
  to?: string;
  scenarioId?: string;
  limit?: number;
}): Promise<LifeBasePoint[]> {
  const logs = await getTrainingLogs({
    from: options.from,
    to: options.to,
    scenarioId: options.scenarioId,
    limit: options.limit ?? 5000,
  });
  const consentLogs = logs.filter((l) => l.consentToShareWithGovernment);
  const byUser = new Map<string, { position: LatLng; count: number; lastRecordedAt: string }>();

  for (const log of consentLogs) {
    const start = log.route.coordinates[0];
    if (!start) continue;
    const existing = byUser.get(log.userId);
    const finishedAt = log.finishedAt || log.createdAt;
    if (!existing || finishedAt > existing.lastRecordedAt) {
      byUser.set(log.userId, {
        position: start,
        count: (existing?.count ?? 0) + 1,
        lastRecordedAt: finishedAt,
      });
    } else {
      byUser.set(log.userId, {
        ...existing,
        count: existing.count + 1,
      });
    }
  }

  return Array.from(byUser.entries()).map(([userId, v]) => ({
    userId,
    position: v.position,
    trainingCount: v.count,
    lastRecordedAt: v.lastRecordedAt,
  }));
}

/** 訓練ログからユーザーごとの運動能力（平均速度・平均所要時間）を算出。同意済みのみ。 */
export async function getUserMobilityProfiles(options: {
  from?: string;
  to?: string;
  scenarioId?: string;
  limit?: number;
}): Promise<UserMobilityProfile[]> {
  const logs = await getTrainingLogs({
    from: options.from,
    to: options.to,
    scenarioId: options.scenarioId,
    limit: options.limit ?? 5000,
  });
  const consentLogs = logs.filter((l) => l.consentToShareWithGovernment);
  const byUser = new Map<
    string,
    { totalMeters: number; totalSeconds: number; durations: number[]; count: number }
  >();

  for (const log of consentLogs) {
    const sec = log.route.durationSeconds;
    const m = log.route.distanceMeters;
    const speed = sec > 0 ? m / sec : 0;
    if (speed <= 0 || !Number.isFinite(speed)) continue;

    const existing = byUser.get(log.userId) ?? {
      totalMeters: 0,
      totalSeconds: 0,
      durations: [],
      count: 0,
    };
    byUser.set(log.userId, {
      totalMeters: existing.totalMeters + m,
      totalSeconds: existing.totalSeconds + sec,
      durations: [...existing.durations, sec],
      count: existing.count + 1,
    });
  }

  return Array.from(byUser.entries()).map(([userId, v]) => {
    const totalSec = v.totalSeconds || 1;
    const averageSpeedMps = v.totalMeters / totalSec;
    const averageDurationSeconds =
      v.durations.length > 0 ? v.durations.reduce((a, b) => a + b, 0) / v.durations.length : 0;
    return {
      userId,
      averageSpeedMps,
      averageDurationSeconds,
      trainingCount: v.count,
    };
  });
}

/** 期間・シナリオで訓練ログを集計し AggregatedStats を返す（行政ダッシュボード用） */
export async function getAggregatedStats(options: {
  from: string;
  to: string;
  scenarioId?: string;
}): Promise<AggregatedStats> {
  const logs = await getTrainingLogs({
    from: options.from,
    to: options.to,
    scenarioId: options.scenarioId,
    limit: 10000,
  });
  const consent = logs.filter((l) => l.consentToShareWithGovernment);
  const totalTrainings = consent.length;
  const uniqueUsers = new Set(consent.map((l) => l.userId)).size;
  const totalDuration = consent.reduce((a, l) => a + l.route.durationSeconds, 0);
  const successCount = consent.filter((l) => l.evacuatedInTime).length;

  return {
    period: { from: options.from, to: options.to },
    totalTrainings,
    uniqueUsers,
    averageDurationSeconds: totalTrainings > 0 ? Math.round(totalDuration / totalTrainings) : 0,
    evacuationSuccessRate: totalTrainings > 0 ? successCount / totalTrainings : 0,
  };
}
