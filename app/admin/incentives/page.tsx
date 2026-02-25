'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IncentiveCampaign } from '@/shared/types';

export default function AdminIncentivesPage() {
  const [campaigns, setCampaigns] = useState<IncentiveCampaign[]>([]);
  const [targetCounts, setTargetCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/campaigns')
      .then((r) => r.json())
      .then((list: IncentiveCampaign[]) => {
        setCampaigns(list);
        return list;
      })
      .then((list) => {
        const now = new Date();
        const to = now.toISOString().slice(0, 10);
        const from = new Date(now);
        from.setDate(from.getDate() - 365);
        const fromStr = from.toISOString().slice(0, 10);
        Promise.all(
          list.map((c) =>
            fetch(`/api/admin/campaigns/target-count?id=${encodeURIComponent(c.id)}&from=${fromStr}&to=${to}`)
              .then((r) => r.json())
              .then((data: { count: number }) => ({ id: c.id, count: data.count }))
          )
        ).then((counts) => {
          const map: Record<string, number> = {};
          counts.forEach(({ id, count }) => (map[id] = count));
          setTargetCounts(map);
        });
      })
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date().toISOString();
  const isValid = (c: IncentiveCampaign) =>
    c.targeting.validFrom <= now && now <= c.targeting.validTo;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>訓練インセンティブ</h1>
        <Link
          href="/admin/incentives/new"
          style={{
            padding: '0.5rem 1rem',
            background: '#0d6efd',
            color: '#fff',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          新規キャンペーン作成
        </Link>
      </div>
      <p style={{ color: '#444', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        地域・年齢層・性別・期間を設定し、訓練に応じて振興券などでインセンティブを付与できます。街を科学的にデザインするための施策として活用してください。
      </p>

      {loading ? (
        <p>読み込み中…</p>
      ) : campaigns.length === 0 ? (
        <p style={{ color: '#666' }}>キャンペーンはまだありません。新規作成から追加してください。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                padding: '1rem',
                background: isValid(c) ? '#fff' : '#f9f9f9',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.name}</h2>
                  {c.description && (
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      {c.description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    有効期間: {c.targeting.validFrom.slice(0, 10)} ～ {c.targeting.validTo.slice(0, 10)}
                    {c.targeting.region && (
                      <> ・ 地域: 緯度 {c.targeting.region.south}～{c.targeting.region.north}, 経度 {c.targeting.region.west}～{c.targeting.region.east}</>
                    )}
                    {!c.targeting.region && ' ・ 全地域'}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                    報酬: {c.reward.type === 'voucher' && c.reward.amountYen != null
                      ? `${c.reward.name ?? '振興券'} ${c.reward.amountYen.toLocaleString()}円`
                      : c.reward.name ?? c.reward.type}
                    {c.condition.minTrainingCount != null && (
                      <> ・ 条件: 訓練{c.condition.minTrainingCount}回以上で付与</>
                    )}
                    {c.budgetLimits && (
                      <> ・ 当選確率: {(c.budgetLimits.selectionRate * 100).toFixed(0)}%
                        {c.budgetLimits.maxRecipients != null && (
                          <> ・ 上限: {c.budgetLimits.maxRecipients}人</>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    想定対象者: {targetCounts[c.id] ?? '—'} 人
                  </div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      color: isValid(c) ? '#0a0' : '#999',
                      marginTop: '0.25rem',
                      display: 'block',
                    }}
                  >
                    {isValid(c) ? '有効' : '期間外'}
                  </span>
                  <Link
                    href={`/admin/incentives/${c.id}`}
                    style={{ fontSize: '0.85rem', color: '#0d6efd', marginTop: '0.25rem', display: 'inline-block' }}
                  >
                    編集
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
