/**
 * ランク定義（ひなんけいろ）
 * 段階的なランクで継続意欲を促す
 * docs/DESIGN_RESIDENT_UX.md 参照
 */

export const RANK_DEFINITIONS = [
  { id: 'beginner', name: 'はじめて', minTrainings: 0, message: '避難訓練を始めよう' },
  { id: 'getting_started', name: 'なれてきた', minTrainings: 3, message: 'だんだん慣れてきたね' },
  { id: 'regular', name: 'つづけてる', minTrainings: 10, message: '続ける力がある' },
  { id: 'guardian', name: 'まもりびと', minTrainings: 30, message: '地域の備えを支えてる' },
] as const;

export type RankId = (typeof RANK_DEFINITIONS)[number]['id'];

export function getRankForTrainings(totalTrainings: number): (typeof RANK_DEFINITIONS)[number] {
  let current = RANK_DEFINITIONS[0];
  for (const rank of RANK_DEFINITIONS) {
    if (totalTrainings >= rank.minTrainings) current = rank;
  }
  return current;
}
