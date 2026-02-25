/**
 * ユーザー属性（年齢・性別・移動能力）の保存・取得
 * 住民が最初に入力し、インセンティブの対象判定と行政集計に利用（Agent C 収集 / Agent D 参照）
 */

import type { UserDemographics, MobilityCapability } from '../../shared/types';
import { prisma } from '../db/client';

function rowToDemographics(row: {
  userId: string;
  age: number | null;
  gender: string | null;
  mobilityCapability: string | null;
  updatedAt: string;
}): UserDemographics {
  return {
    userId: row.userId,
    age: row.age ?? undefined,
    gender: (row.gender as UserDemographics['gender']) ?? undefined,
    mobilityCapability: (row.mobilityCapability as MobilityCapability) ?? undefined,
    updatedAt: row.updatedAt,
  };
}

export async function getDemographics(userId: string): Promise<UserDemographics | null> {
  const row = await prisma.userDemographics.findUnique({
    where: { userId },
  });
  return row ? rowToDemographics(row) : null;
}

/** 複数ユーザーの属性を一括取得（key: userId） */
export async function getDemographicsByUserIds(
  userIds: string[]
): Promise<Map<string, UserDemographics>> {
  if (userIds.length === 0) return new Map();
  const rows = await prisma.userDemographics.findMany({
    where: { userId: { in: userIds } },
  });
  const map = new Map<string, UserDemographics>();
  for (const row of rows) {
    map.set(row.userId, rowToDemographics(row));
  }
  return map;
}

export async function upsertDemographics(
  userId: string,
  data: { age?: number; gender?: UserDemographics['gender']; mobilityCapability?: MobilityCapability }
): Promise<UserDemographics> {
  const now = new Date().toISOString();
  const row = await prisma.userDemographics.upsert({
    where: { userId },
    create: {
      userId,
      age: data.age ?? null,
      gender: data.gender ?? null,
      mobilityCapability: data.mobilityCapability ?? null,
      updatedAt: now,
    },
    update: {
      ...(data.age !== undefined && { age: data.age }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.mobilityCapability !== undefined && { mobilityCapability: data.mobilityCapability }),
      updatedAt: now,
    },
  });
  return rowToDemographics(row);
}
