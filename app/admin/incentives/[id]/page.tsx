'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { IncentiveCampaign } from '@/shared/types';

export default function EditIncentiveCampaignPage() {
  const params = useParams();
  const id = params?.id as string;
  const [campaign, setCampaign] = useState<IncentiveCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/campaigns/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Not found'))))
      .then(setCampaign)
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>読み込み中…</p>;
  if (!campaign) return <p style={{ color: '#c00' }}>キャンペーンが見つかりません。</p>;

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/admin/incentives" style={{ color: '#0d6efd', fontSize: '0.9rem' }}>← インセンティブ一覧</Link>
      </div>
      <h1 style={{ marginBottom: '0.5rem' }}>キャンペーン: {campaign.name}</h1>
      <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e0e0e0', borderRadius: 8, maxWidth: 560 }}>
        {campaign.description && <p style={{ color: '#444', marginBottom: '0.5rem' }}>{campaign.description}</p>}
        <p style={{ fontSize: '0.9rem' }}>
          有効期間: {campaign.targeting.validFrom.slice(0, 10)} ～ {campaign.targeting.validTo.slice(0, 10)}
        </p>
        {campaign.targeting.region && (
          <p style={{ fontSize: '0.9rem' }}>
            地域: 緯度 {campaign.targeting.region.south}～{campaign.targeting.region.north}, 経度 {campaign.targeting.region.west}～{campaign.targeting.region.east}
          </p>
        )}
        <p style={{ fontSize: '0.9rem' }}>
          報酬: {campaign.reward.name ?? campaign.reward.type}
          {campaign.reward.amountYen != null && ` ${campaign.reward.amountYen.toLocaleString()}円`}
        </p>
        {campaign.condition.minTrainingCount != null && (
          <p style={{ fontSize: '0.9rem' }}>付与条件: 訓練{campaign.condition.minTrainingCount}回以上</p>
        )}
      </div>
      <p style={{ fontSize: '0.85rem', color: '#666' }}>
        編集は API（PATCH /api/admin/campaigns/{id}）で行えます。今後 UI で編集フォームを追加できます。
      </p>
    </>
  );
}
