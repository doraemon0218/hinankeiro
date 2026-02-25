/**
 * 平時の励ましメッセージ
 * 訓練後・久しぶりログイン・継続時などに表示
 * docs/DESIGN_RESIDENT_UX.md 参照
 */

/** 訓練直後に表示するメッセージ（時間内避難可否で分岐可能） */
export function getPostTrainingMessage(options: {
  evacuatedInTime: boolean;
  consecutiveDays?: number;
}): string {
  if (options.evacuatedInTime) {
    const messages = [
      '時間内に避難できたね。いざというときも、落ち着いて同じ動きを。',
      '今日も一歩、備えが進んだね。',
    ];
    if (options.consecutiveDays && options.consecutiveDays >= 3) {
      return `${options.consecutiveDays}日連続、すごい！${messages[0]}`;
    }
    return messages[Math.floor(Math.random() * messages.length)];
  }
  return 'もう少し早く出られると安心。また同じ経路を練習してみよう。';
}

/** 久しぶりログイン時のメッセージ */
export function getWelcomeBackMessage(daysSinceLastTraining?: number): string {
  if (daysSinceLastTraining === undefined || daysSinceLastTraining <= 0) {
    return 'また一緒に備えを始めよう。';
  }
  if (daysSinceLastTraining <= 7) {
    return 'おかえり。また訓練してみる？';
  }
  return '久しぶり！今日は「はじめての避難」の気持ちで、もう一度経路を確認してみよう。';
}

/** ホーム用の一言（次にやること・目標まで） */
export function getHomeEncouragement(options: {
  weeklyCount?: number;
  weeklyGoal?: number;
  monthlyCount?: number;
  monthlyGoal?: number;
}): string {
  const { weeklyCount = 0, weeklyGoal, monthlyCount = 0, monthlyGoal } = options;
  if (weeklyGoal != null && weeklyCount < weeklyGoal) {
    const rest = weeklyGoal - weeklyCount;
    return `今週あと${rest}回で目標達成。今日は訓練する？`;
  }
  if (monthlyGoal != null && monthlyCount < monthlyGoal) {
    const rest = monthlyGoal - monthlyCount;
    return `今月あと${rest}回で目標達成。`;
  }
  if (weeklyCount > 0 || monthlyCount > 0) {
    return '今日も備えを続けよう。';
  }
  return '今日は訓練してみる？ 同じ経路を繰り返すと、いざというとき体が覚えてる。';
}
