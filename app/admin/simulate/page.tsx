'use client';

import { useState } from 'react';
import type { EvacuationFacilitySimulationResult } from '@/shared/types';

export default function AdminSimulatePage() {
  const [lat, setLat] = useState('34.7');
  const [lng, setLng] = useState('137.7');
  const [scenarioId, setScenarioId] = useState('default');
  const [tsunamiSeconds, setTsunamiSeconds] = useState(600);
  const [costPerPerson, setCostPerPerson] = useState<number | ''>(50000);
  const [result, setResult] = useState<EvacuationFacilitySimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    setResult(null);
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setError('緯度・経度は数値で入力してください');
      return;
    }
    setLoading(true);
    const body: Record<string, unknown> = {
      location: { lat: latNum, lng: lngNum },
      scenarioId: scenarioId || 'default',
      tsunamiArrivalSeconds: tsunamiSeconds,
    };
    if (costPerPerson !== '' && Number(costPerPerson) >= 0) {
      body.costPerPerson = Number(costPerPerson);
    }
    fetch('/api/admin/simulate-facility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: EvacuationFacilitySimulationResult) => setResult(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>避難施設 シミュレーション</h1>
      <p style={{ color: '#444', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        候補地に避難塔を設置した場合の「想定避難人数」「推奨キャパシティ」「概算費用」を算出します。生活拠点と運動能力の蓄積データから、津波到達前にその施設に間に合う人数を推定します。
      </p>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          maxWidth: 400,
          marginBottom: '1.5rem',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>施設候補地 緯度</span>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="34.7"
            style={{ padding: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>施設候補地 経度</span>
          <input
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="137.7"
            style={{ padding: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>シナリオID</span>
          <input
            type="text"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            style={{ padding: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>津波到達までの時間（秒）</span>
          <input
            type="number"
            value={tsunamiSeconds}
            onChange={(e) => setTsunamiSeconds(Number(e.target.value))}
            min={60}
            style={{ padding: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>1人あたりの費用（円）※任意</span>
          <input
            type="number"
            value={costPerPerson === '' ? '' : costPerPerson}
            onChange={(e) => setCostPerPerson(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="50000"
            min={0}
            style={{ padding: '0.5rem' }}
          />
        </label>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          style={{
            padding: '0.75rem 1rem',
            background: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'シミュレーション中…' : 'シミュレーション実行'}
        </button>
      </div>

      {error && <p style={{ color: '#c00', marginBottom: '1rem' }}>{error}</p>}

      {result && (
        <section
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: '1.25rem',
            background: '#fafafa',
          }}
        >
          <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>結果</h2>
          <ul style={{ listStyle: 'none' }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>想定避難人数</strong>: {result.expectedEvacuees} 人（津波到達前にこの施設に到達可能と推定）
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong>推奨キャパシティ</strong>: {result.suggestedCapacity} 人（余裕係数1.2を考慮）
            </li>
            {result.costPerPerson != null && (
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>1人あたり費用</strong>: {result.costPerPerson.toLocaleString()} 円
              </li>
            )}
            {result.estimatedTotalCost != null && (
              <li style={{ marginBottom: '0.75rem' }}>
                <strong>概算総費用</strong>: {result.estimatedTotalCost.toLocaleString()} 円
              </li>
            )}
            <li style={{ fontSize: '0.9rem', color: '#666' }}>
              シミュレーションに使用したサンプル数: {result.sampleSize} 人（生活拠点が有効なユーザー）
            </li>
          </ul>
        </section>
      )}
    </>
  );
}
