'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  IncentiveCampaignCreate,
  RegionTarget,
  IncentiveRewardType,
  MobilityCapability,
} from '@/shared/types';

const defaultRegion: RegionTarget = {
  north: 34.8,
  south: 34.6,
  east: 138.0,
  west: 137.5,
};

const MOBILITY_OPTIONS: { value: MobilityCapability; label: string }[] = [
  { value: 'walk', label: '自力で歩ける' },
  { value: 'run', label: '走れる' },
  { value: 'bicycle', label: '自転車乗れる' },
  { value: 'car', label: '車運転できる' },
  { value: 'cane', label: '杖' },
  { value: 'wheelchair', label: '車椅子' },
  { value: 'bedridden', label: '寝たきり' },
];

export default function NewIncentiveCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [useRegion, setUseRegion] = useState(false);
  const [region, setRegion] = useState(defaultRegion);
  const [minAge, setMinAge] = useState<number | ''>('');
  const [maxAge, setMaxAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
  const [mobilityTypes, setMobilityTypes] = useState<MobilityCapability[]>([]);
  const [selectionRate, setSelectionRate] = useState<number | ''>(100);
  const [maxRecipients, setMaxRecipients] = useState<number | ''>('');
  const [rewardType, setRewardType] = useState<IncentiveRewardType>('voucher');
  const [rewardName, setRewardName] = useState('地域振興券');
  const [rewardDescription, setRewardDescription] = useState('訓練参加で地域の店舗で使える振興券を付与します');
  const [amountYen, setAmountYen] = useState<number | ''>(500);
  const [minTrainingCount, setMinTrainingCount] = useState<number | ''>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleMobility(v: MobilityCapability) {
    setMobilityTypes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function buildBody(): IncentiveCampaignCreate {
    const targeting: IncentiveCampaignCreate['targeting'] = {
      validFrom: validFrom || new Date().toISOString().slice(0, 10),
      validTo: validTo || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      ...(useRegion && { region }),
      ...(minAge !== '' || maxAge !== '' ? { ageRange: { minAge: minAge === '' ? undefined : minAge, maxAge: maxAge === '' ? undefined : maxAge } } : {}),
      ...(gender !== 'any' && { gender }),
      ...(mobilityTypes.length > 0 && { mobilityTypes }),
    };
    const reward: IncentiveCampaignCreate['reward'] = {
      type: rewardType,
      name: rewardName || undefined,
      description: rewardDescription || undefined,
      ...(amountYen !== '' && { amountYen: Number(amountYen) }),
    };
    const condition: IncentiveCampaignCreate['condition'] = {
      ...(minTrainingCount !== '' && { minTrainingCount: Number(minTrainingCount) }),
    };
    const budgetLimits: IncentiveCampaignCreate['budgetLimits'] =
      selectionRate !== '' && Number(selectionRate) >= 0 && Number(selectionRate) <= 100
        ? {
            selectionRate: Number(selectionRate) / 100,
            ...(maxRecipients !== '' && Number(maxRecipients) > 0 && { maxRecipients: Number(maxRecipients) }),
          }
        : undefined;
    return { name, description: description || undefined, targeting, reward, condition, budgetLimits };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('キャンペーン名を入力してください');
      return;
    }
    setSubmitting(true);
    fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody()),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => { throw new Error(d.error ?? res.statusText); });
        return res.json();
      })
      .then(() => router.push('/admin/incentives'))
      .catch((err) => setError(err.message))
      .finally(() => setSubmitting(false));
  }

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <a href="/admin/incentives" style={{ color: '#0d6efd', fontSize: '0.9rem' }}>← インセンティブ一覧</a>
      </div>
      <h1 style={{ marginBottom: '0.5rem' }}>新規キャンペーン作成</h1>
      <p style={{ color: '#444', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        特定の地域・年齢層・性別・期間を設定し、訓練インセンティブ（振興券など）を付与するキャンペーンを作成します。
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && <p style={{ color: '#c00' }}>{error}</p>}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>キャンペーン名 <strong>*</strong></span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 〇〇地区 防災訓練振興券"
            style={{ padding: '0.5rem' }}
            required
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>説明（住民に表示）</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このキャンペーンの説明"
            rows={2}
            style={{ padding: '0.5rem' }}
          />
        </label>

        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem' }}>
          <legend>有効期間</legend>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label>
              <span style={{ marginRight: '0.5rem' }}>開始日</span>
              <input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} style={{ padding: '0.35rem' }} />
            </label>
            <label>
              <span style={{ marginRight: '0.5rem' }}>終了日</span>
              <input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} style={{ padding: '0.35rem' }} />
            </label>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem' }}>
          <legend>ターゲット条件</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input type="checkbox" checked={useRegion} onChange={(e) => setUseRegion(e.target.checked)} />
            地域を限定する（緯度・経度の範囲）
          </label>
          {useRegion && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input type="number" step="any" placeholder="北端 緯度" value={region.north} onChange={(e) => setRegion((r) => ({ ...r, north: Number(e.target.value) }))} style={{ padding: '0.35rem' }} />
              <input type="number" step="any" placeholder="南端 緯度" value={region.south} onChange={(e) => setRegion((r) => ({ ...r, south: Number(e.target.value) }))} style={{ padding: '0.35rem' }} />
              <input type="number" step="any" placeholder="東端 経度" value={region.east} onChange={(e) => setRegion((r) => ({ ...r, east: Number(e.target.value) }))} style={{ padding: '0.35rem' }} />
              <input type="number" step="any" placeholder="西端 経度" value={region.west} onChange={(e) => setRegion((r) => ({ ...r, west: Number(e.target.value) }))} style={{ padding: '0.35rem' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <label>
              <span style={{ marginRight: '0.5rem' }}>年齢（最小）</span>
              <input type="number" min={0} max={120} value={minAge === '' ? '' : minAge} onChange={(e) => setMinAge(e.target.value === '' ? '' : Number(e.target.value))} style={{ padding: '0.35rem', width: 70 }} />
            </label>
            <label>
              <span style={{ marginRight: '0.5rem' }}>年齢（最大）</span>
              <input type="number" min={0} max={120} value={maxAge === '' ? '' : maxAge} onChange={(e) => setMaxAge(e.target.value === '' ? '' : Number(e.target.value))} style={{ padding: '0.35rem', width: 70 }} />
            </label>
          </div>
          <label>
            <span style={{ marginRight: '0.5rem' }}>性別</span>
            <select value={gender} onChange={(e) => setGender(e.target.value as 'any' | 'male' | 'female')} style={{ padding: '0.35rem' }}>
              <option value="any">指定なし（全員）</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
            </select>
          </label>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{ display: 'block', marginBottom: '0.35rem' }}>対象とする移動能力（複数可。未選択＝全員）</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {MOBILITY_OPTIONS.map((opt) => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <input
                    type="checkbox"
                    checked={mobilityTypes.includes(opt.value)}
                    onChange={() => toggleMobility(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem' }}>
          <legend>予算・当選確率（振興券の付与数を制限）</legend>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
            条件を満たすユーザー全員に付与すると予算を超える場合、当選確率や付与上限でコントロールできます。
          </p>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
            <span>当選確率（%）</span>
            <input
              type="number"
              min={0}
              max={100}
              value={selectionRate === '' ? '' : selectionRate}
              onChange={(e) => setSelectionRate(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.5rem', width: 120 }}
              placeholder="100"
            />
            <span style={{ fontSize: '0.8rem', color: '#666' }}>100＝全員に付与。30＝条件を満たす人の30%に抽選で付与。</span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>付与数の上限（任意）</span>
            <input
              type="number"
              min={1}
              value={maxRecipients === '' ? '' : maxRecipients}
              onChange={(e) => setMaxRecipients(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ padding: '0.5rem', width: 120 }}
              placeholder="上限なし"
            />
          </label>
        </fieldset>

        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem' }}>
          <legend>報酬（振興券など）</legend>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }}>
            <span>報酬の種類</span>
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value as IncentiveRewardType)} style={{ padding: '0.5rem' }}>
              <option value="voucher">振興券（地域で使える券）</option>
              <option value="points">ポイント</option>
              <option value="other">その他</option>
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <span>報酬名（例: 浜松市防災訓練振興券）</span>
            <input type="text" value={rewardName} onChange={(e) => setRewardName(e.target.value)} style={{ padding: '0.5rem' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
            <span>説明（地域で使える条件など）</span>
            <textarea value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} rows={2} style={{ padding: '0.5rem' }} />
          </label>
          {rewardType === 'voucher' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>金額（円）</span>
              <input type="number" min={0} value={amountYen === '' ? '' : amountYen} onChange={(e) => setAmountYen(e.target.value === '' ? '' : Number(e.target.value))} style={{ padding: '0.5rem' }} placeholder="500" />
            </label>
          )}
        </fieldset>

        <fieldset style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: '1rem' }}>
          <legend>付与条件</legend>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>訓練回数（この回数以上で付与）</span>
            <input type="number" min={1} value={minTrainingCount === '' ? '' : minTrainingCount} onChange={(e) => setMinTrainingCount(e.target.value === '' ? '' : Number(e.target.value))} style={{ padding: '0.5rem' }} placeholder="1" />
          </label>
        </fieldset>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '作成中…' : 'キャンペーンを作成'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/incentives')}
            style={{
              padding: '0.6rem 1.25rem',
              background: '#e9ecef',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            キャンセル
          </button>
        </div>
      </form>
    </>
  );
}
