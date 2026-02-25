/**
 * バッジ定義（ひなんけいろ）
 * 楽しくなるインセンティブ・「体で覚える」促進用
 * docs/DESIGN_RESIDENT_UX.md 参照
 */

import type { Badge } from '../../shared/types';

/** バッジIDと取得条件の定義（取得判定は API/ロジック側で実施） */
export const BADGE_DEFINITIONS = [
  {
    id: 'first_evacuation',
    name: 'はじめての避難',
    description: '初めて訓練を完了した',
  },
  {
    id: 'streak_3',
    name: 'つづけてる',
    description: '3日連続で訓練を完了した',
  },
  {
    id: 'streak_7',
    name: 'まもりびと',
    description: '7日連続で訓練を完了した',
  },
  {
    id: 'month_5km',
    name: '歩く力',
    description: '1ヶ月で5km以上歩いた',
  },
  {
    id: 'same_route_5',
    name: 'いつもの道',
    description: '同じ経路を5回歩いた（体で覚える）',
  },
  {
    id: 'in_time_10',
    name: '時間内に避難',
    description: '津波到達前に避難完了を10回達成',
  },
  {
    id: 'night_training',
    name: '夜も備え',
    description: '夜間の訓練を完了した',
  },
  {
    id: 'monthly_goal',
    name: '今月の目標',
    description: '月間目標の訓練回数を達成した',
  },
] as const;

export type BadgeId = (typeof BADGE_DEFINITIONS)[number]['id'];

/** 新規獲得バッジ用の励ましメッセージ */
export function getBadgeEncouragement(badge: Badge): string {
  const def = BADGE_DEFINITIONS.find((d) => d.id === badge.id);
  if (!def) return 'バッジを獲得しました！';
  const messages: Partial<Record<BadgeId, string>> = {
    first_evacuation: '初めての避難、おつかれさま！これからも続けよう。',
    streak_3: '3日連続、すごい！備えが習慣になってきてるね。',
    streak_7: '7日連続は立派だね。まもりびとだ！',
    same_route_5: '同じ道を5回歩いたね。いざというとき、体が覚えてる。',
    in_time_10: '時間内に避難を10回達成。冷静に動ける力がついてる。',
    monthly_goal: '今月の目標達成、おめでとう！',
  };
  return messages[badge.id as BadgeId] ?? `${def.name}を獲得したよ！`;
}
