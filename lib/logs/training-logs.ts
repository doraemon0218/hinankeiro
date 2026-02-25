/**
 * 訓練ログの保存・取得・エクスポート（Agent B）
 * shared/types.ts の TrainingLog, TrainingLogCreate, ExportOptions に準拠
 */

import type { TrainingLog, TrainingLogCreate, ExportOptions, RouteResult, TrajectoryPoint } from '../../shared/types';
import { prisma } from '../db/client';
import type { Prisma } from '@prisma/client';

/** Prisma の 1 行 → TrainingLog */
function rowToTrainingLog(row: {
  id: string;
  userId: string;
  scenarioId: string;
  routeCoordinates: string;
  routeDurationSeconds: number;
  routeDistanceMeters: number;
  startedAt: string;
  finishedAt: string;
  evacuatedInTime: boolean;
  consentToShareWithGovernment: boolean;
  transportMode: string;
  actualTrajectory: string;
  actualDistanceMeters: number;
  actualDurationSeconds: number;
  createdAt: string;
}): TrainingLog {
  const coordinates = JSON.parse(row.routeCoordinates) as RouteResult['coordinates'];
  const actualTrajectory = JSON.parse(row.actualTrajectory) as TrajectoryPoint[];
  return {
    id: row.id,
    userId: row.userId,
    scenarioId: row.scenarioId,
    route: {
      coordinates,
      durationSeconds: row.routeDurationSeconds,
      distanceMeters: row.routeDistanceMeters,
    },
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    evacuatedInTime: row.evacuatedInTime,
    consentToShareWithGovernment: row.consentToShareWithGovernment,
    transportMode: row.transportMode as TrainingLog['transportMode'],
    actualTrajectory,
    actualDistanceMeters: row.actualDistanceMeters,
    actualDurationSeconds: row.actualDurationSeconds,
    createdAt: row.createdAt,
  };
}

/** 訓練ログを 1 件保存 */
export async function createTrainingLog(data: TrainingLogCreate): Promise<TrainingLog> {
  const createdAt = new Date().toISOString();
  const row = await prisma.trainingLog.create({
    data: {
      userId: data.userId,
      scenarioId: data.scenarioId,
      routeCoordinates: JSON.stringify(data.route.coordinates),
      routeDurationSeconds: data.route.durationSeconds,
      routeDistanceMeters: data.route.distanceMeters,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      evacuatedInTime: data.evacuatedInTime,
      consentToShareWithGovernment: data.consentToShareWithGovernment,
      transportMode: data.transportMode,
      actualTrajectory: JSON.stringify(data.actualTrajectory),
      actualDistanceMeters: data.actualDistanceMeters,
      actualDurationSeconds: data.actualDurationSeconds,
      createdAt,
    },
  });
  return rowToTrainingLog(row);
}

/** 訓練ログを取得（住民: userId 指定、行政: 全件または期間・シナリオでフィルタ） */
export async function getTrainingLogs(options: {
  userId?: string;
  from?: string;
  to?: string;
  scenarioId?: string;
  limit?: number;
}): Promise<TrainingLog[]> {
  const where: Prisma.TrainingLogWhereInput = {};

  if (options.userId) where.userId = options.userId;
  if (options.scenarioId) where.scenarioId = options.scenarioId;
  if (options.from ?? options.to) {
    where.createdAt = {
      ...(options.from && { gte: options.from }),
      ...(options.to && { lte: options.to }),
    };
  }

  const rows = await prisma.trainingLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 100,
  });
  return rows.map(rowToTrainingLog);
}

/** エクスポート用: 行政向けは同意済みのみ・匿名化済みのデータを返す */
export async function getTrainingLogsForExport(opts: ExportOptions): Promise<TrainingLog[]> {
  return getTrainingLogs({
    from: opts.from,
    to: opts.to,
    scenarioId: opts.scenarioId,
    limit: 10000,
  }).then((logs) => logs.filter((l) => l.consentToShareWithGovernment));
}

/** エクスポート: CSV 文字列を生成 */
export function trainingLogsToCsv(logs: TrainingLog[]): string {
  const header = 'id,userId,scenarioId,durationSeconds,distanceMeters,startedAt,finishedAt,evacuatedInTime,createdAt';
  const rows = logs.map(
    (l) =>
      [
        l.id,
        l.userId,
        l.scenarioId,
        l.route.durationSeconds,
        l.route.distanceMeters,
        l.startedAt,
        l.finishedAt,
        l.evacuatedInTime,
        l.createdAt,
      ].join(',')
  );
  return [header, ...rows].join('\n');
}

/** エクスポート: GeoJSON FeatureCollection（経路を LineString で） */
export function trainingLogsToGeoJSON(logs: TrainingLog[]): string {
  const features = logs.map((l) => ({
    type: 'Feature' as const,
    properties: {
      id: l.id,
      userId: l.userId,
      scenarioId: l.scenarioId,
      durationSeconds: l.route.durationSeconds,
      distanceMeters: l.route.distanceMeters,
      startedAt: l.startedAt,
      finishedAt: l.finishedAt,
      evacuatedInTime: l.evacuatedInTime,
      createdAt: l.createdAt,
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: l.route.coordinates.map((c) => [c.lng, c.lat]),
    },
  }));
  const fc = { type: 'FeatureCollection' as const, features };
  return JSON.stringify(fc);
}
