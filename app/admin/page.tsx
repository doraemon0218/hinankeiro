'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AggregatedStats } from '@/shared/types';

function formatDate(s: string) {
  return s.slice(0, 10);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);

    fetch(`/api/admin/stats?from=${fromStr}&to=${toStr}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: AggregatedStats) => setStats(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>集計を取得しています…</p>;
  if (error) return <p style={{ color: '#c00' }}>エラー: {error}</p>;
  if (!stats) return null;

  return (
    <>
      <h1 style={{ marginBottom: '1rem' }}>概要</h1>
      <p style={{ color: '#444', marginBottom: '1.5rem' }}>
        直近30日間の集計（同意済み訓練ログのみ）。訓練ログの中央監視や避難施設シミュレーションはメニューから利用できます。
      </p>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>集計期間</div>
          <div style={{ fontWeight: 600 }}>
            {formatDate(stats.period.from)} ～ {formatDate(stats.period.to)}
          </div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>訓練回数</div>
          <div style={{ fontWeight: 600 }}>{stats.totalTrainings} 回</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>参加者数（延べユーザー）</div>
          <div style={{ fontWeight: 600 }}>{stats.uniqueUsers} 人</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>平均所要時間</div>
          <div style={{ fontWeight: 600 }}>{stats.averageDurationSeconds} 秒</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>避難成功率</div>
          <div style={{ fontWeight: 600 }}>
            {(stats.evacuationSuccessRate * 100).toFixed(1)} %
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>メニュー</h2>
        <ul style={{ listStyle: 'none' }}>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/admin/logs" style={{ color: '#0d6efd' }}>
              訓練ログ監視
            </Link>
            … 期間・シナリオで訓練ログを一覧表示・中央でモニタリング
          </li>
          <li style={{ marginBottom: '0.5rem' }}>
            <Link href="/admin/data" style={{ color: '#0d6efd' }}>
              生活拠点・運動能力
            </Link>
            … 蓄積データの確認（避難塔シミュレーションの元データ）
          </li>
          <li>
            <Link href="/admin/simulate" style={{ color: '#0d6efd' }}>
              施設シミュレーション
            </Link>
            … 候補地に避難塔を設置した場合の想定避難人数・キャパシティ・費用
          </li>
        </ul>
      </section>
    </>
  );
}
