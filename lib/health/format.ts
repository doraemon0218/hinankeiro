/**
 * 健康指標の表示用フォーマット
 * 歩数・距離を住民に分かりやすく表示する
 */

export function formatDistanceMeters(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDurationSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}分${s > 0 ? `${s}秒` : ''}`;
  return `${s}秒`;
}
