/**
 * 訓練インセンティブキャンペーン（行政による科学的デザイン）（Agent D）
 * 地域・年齢・性別・時間でターゲットを設定し、振興券等のインセンティブを付与可能にする
 */

import type {
  IncentiveCampaign,
  IncentiveCampaignCreate,
  IncentiveCampaignTargeting,
  RegionTarget,
  LatLng,
  UserDemographics,
  MobilityCapability,
} from '../../shared/types';
import { prisma } from '../db/client';
import { getLifeBasePoints } from '../analytics/aggregation';
import { getDemographicsByUserIds } from '../user/demographics';

function parseTargeting(json: string): IncentiveCampaignTargeting {
  return JSON.parse(json) as IncentiveCampaignTargeting;
}

function rowToCampaign(row: {
  id: string;
  name: string;
  description: string | null;
  targeting: string;
  reward: string;
  condition: string;
  budgetLimits?: string | null;
  createdAt: string;
  updatedAt: string;
}): IncentiveCampaign {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    targeting: parseTargeting(row.targeting),
    reward: JSON.parse(row.reward) as IncentiveCampaign['reward'],
    condition: JSON.parse(row.condition) as IncentiveCampaign['condition'],
    budgetLimits:
      row.budgetLimits != null && row.budgetLimits !== ''
        ? (JSON.parse(row.budgetLimits) as IncentiveCampaign['budgetLimits'])
        : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** ユーザー属性がキャンペーンターゲット（年齢・性別・移動能力）にマッチするか */
function matchesTargeting(
  demographics: UserDemographics | undefined,
  targeting: IncentiveCampaignTargeting
): boolean {
  if (targeting.ageRange && demographics?.age != null) {
    if (targeting.ageRange.minAge != null && demographics.age < targeting.ageRange.minAge)
      return false;
    if (targeting.ageRange.maxAge != null && demographics.age > targeting.ageRange.maxAge)
      return false;
  }
  if (targeting.gender && targeting.gender !== 'any' && demographics?.gender !== undefined) {
    if (demographics.gender !== targeting.gender) return false;
  }
  if (
    targeting.mobilityTypes &&
    targeting.mobilityTypes.length > 0 &&
    demographics?.mobilityCapability != null
  ) {
    if (!targeting.mobilityTypes.includes(demographics.mobilityCapability)) return false;
  }
  return true;
}

/** 座標が地域範囲内か */
export function isInRegion(position: LatLng, region: RegionTarget): boolean {
  return (
    position.lat >= region.south &&
    position.lat <= region.north &&
    position.lng >= region.west &&
    position.lng <= region.east
  );
}

/** キャンペーン一覧取得 */
export async function getCampaigns(options?: {
  limit?: number;
  validAt?: string; // ISO8601。指定時は validFrom <= validAt <= validTo のもののみ
}): Promise<IncentiveCampaign[]> {
  const rows = await prisma.incentiveCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: options?.limit ?? 100,
  });
  let list = rows.map(rowToCampaign);
  if (options?.validAt) {
    const t = options.validAt;
    list = list.filter(
      (c: IncentiveCampaign) => c.targeting.validFrom <= t && t <= c.targeting.validTo
    );
  }
  return list;
}

/** IDで1件取得 */
export async function getCampaignById(id: string): Promise<IncentiveCampaign | null> {
  const row = await prisma.incentiveCampaign.findUnique({ where: { id } });
  return row ? rowToCampaign(row) : null;
}

/** キャンペーン作成 */
export async function createCampaign(data: IncentiveCampaignCreate): Promise<IncentiveCampaign> {
  const now = new Date().toISOString();
  const row = await prisma.incentiveCampaign.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      targeting: JSON.stringify(data.targeting),
      reward: JSON.stringify(data.reward),
      condition: JSON.stringify(data.condition),
      budgetLimits: data.budgetLimits ? JSON.stringify(data.budgetLimits) : null,
      createdAt: now,
      updatedAt: now,
    },
  });
  return rowToCampaign(row);
}

/** キャンペーン更新 */
export async function updateCampaign(
  id: string,
  data: Partial<IncentiveCampaignCreate>
): Promise<IncentiveCampaign | null> {
  const existing = await prisma.incentiveCampaign.findUnique({ where: { id } });
  if (!existing) return null;
  const now = new Date().toISOString();
  const targeting = data.targeting
    ? JSON.stringify(data.targeting)
    : existing.targeting;
  const reward = data.reward ? JSON.stringify(data.reward) : existing.reward;
  const condition = data.condition
    ? JSON.stringify(data.condition)
    : existing.condition;
  const budgetLimits =
    data.budgetLimits !== undefined
      ? (data.budgetLimits ? JSON.stringify(data.budgetLimits) : null)
      : existing.budgetLimits;
  const row = await prisma.incentiveCampaign.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      targeting,
      reward,
      condition,
      budgetLimits,
      updatedAt: now,
    },
  });
  return rowToCampaign(row);
}

/** キャンペーン削除 */
export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    await prisma.incentiveCampaign.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

/**
 * 現在有効かつ、指定座標（生活拠点等）が地域内に含まれるキャンペーン一覧。
 * 住民アプリが「あなたに適用されるインセンティブ」を表示するために利用。
 */
export async function getCampaignsForUser(position?: LatLng): Promise<IncentiveCampaign[]> {
  const now = new Date().toISOString();
  const list = await getCampaigns({ validAt: now, limit: 50 });
  if (!position) return list;
  return list.filter((c) => {
    if (!c.targeting.region) return true;
    return isInRegion(position, c.targeting.region);
  });
}

/**
 * キャンペーンの想定対象者数。
 * 地域（生活拠点）＋年齢・性別・移動能力（UserDemographics）でフィルタ。属性未登録ユーザーは地域のみの場合は含める。
 */
export async function getCampaignTargetUserCount(
  campaignId: string,
  options?: { from?: string; to?: string }
): Promise<{ count: number; samplePeriod?: { from: string; to: string } }> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) return { count: 0 };
  const points = await getLifeBasePoints({
    from: options?.from,
    to: options?.to,
    limit: 5000,
  });
  let filtered = points;
  if (campaign.targeting.region) {
    filtered = filtered.filter((p) => isInRegion(p.position, campaign.targeting.region!));
  }
  const hasDemographicFilter =
    (campaign.targeting.ageRange &&
      (campaign.targeting.ageRange.minAge != null || campaign.targeting.ageRange.maxAge != null)) ||
    (campaign.targeting.gender && campaign.targeting.gender !== 'any') ||
    (campaign.targeting.mobilityTypes && campaign.targeting.mobilityTypes.length > 0);
  if (hasDemographicFilter && filtered.length > 0) {
    const userIds = [...new Set(filtered.map((p) => p.userId))];
    const demographicsMap = await getDemographicsByUserIds(userIds);
    filtered = filtered.filter((p) => {
      const d = demographicsMap.get(p.userId);
      return matchesTargeting(d, campaign.targeting);
    });
  }
  return {
    count: filtered.length,
    samplePeriod: options?.from && options?.to ? { from: options.from, to: options.to } : undefined,
  };
}
