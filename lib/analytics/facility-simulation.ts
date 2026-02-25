/**
 * 避難施設シミュレーション: 候補地に避難塔を設置した場合の想定避難人数・キャパシティ・費用（Agent D）
 */

import type {
  EvacuationFacilitySimulationInput,
  EvacuationFacilitySimulationResult,
  LatLng,
} from '../../shared/types';
import { getLifeBasePoints } from './aggregation';
import { getUserMobilityProfiles } from './aggregation';
import { distanceMeters } from './aggregation';

/** 余裕係数: 推奨キャパシティ = 想定避難人数 × この値 */
const CAPACITY_BUFFER_FACTOR = 1.2;

/**
 * 「この場所に避難施設を置いた場合、何人が間に合うか」をシミュレーション。
 * 生活拠点＋運動能力から、直線距離と歩行速度で到達時間を算出し、津波到達前に届く人数を集計する。
 */
export async function runEvacuationFacilitySimulation(
  input: EvacuationFacilitySimulationInput,
  options?: { costPerPerson?: number }
): Promise<EvacuationFacilitySimulationResult> {
  const period = input.period;
  const [lifeBases, mobilities] = await Promise.all([
    getLifeBasePoints({
      from: period?.from,
      to: period?.to,
      scenarioId: input.scenarioId,
      limit: 5000,
    }),
    getUserMobilityProfiles({
      from: period?.from,
      to: period?.to,
      scenarioId: input.scenarioId,
      limit: 5000,
    }),
  ]);

  const mobilityByUser = new Map(mobilities.map((m) => [m.userId, m]));
  const tsunamiSeconds = input.tsunamiArrivalSeconds ?? 600; // 未指定時は10分

  let expectedEvacuees = 0;
  for (const lb of lifeBases) {
    const mob = mobilityByUser.get(lb.userId);
    if (!mob || mob.averageSpeedMps <= 0) continue;
    const dist = distanceMeters(lb.position, input.location);
    const timeToReachSeconds = dist / mob.averageSpeedMps;
    if (timeToReachSeconds <= tsunamiSeconds) expectedEvacuees += 1;
  }

  const suggestedCapacity = Math.max(1, Math.ceil(expectedEvacuees * CAPACITY_BUFFER_FACTOR));
  const costPerPerson = options?.costPerPerson ?? undefined;
  const estimatedTotalCost =
    costPerPerson !== undefined ? Math.ceil(suggestedCapacity * costPerPerson) : undefined;

  return {
    expectedEvacuees,
    suggestedCapacity,
    costPerPerson,
    estimatedTotalCost,
    sampleSize: lifeBases.length,
  };
}
