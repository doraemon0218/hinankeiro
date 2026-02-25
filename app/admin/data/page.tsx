'use client';

import { useEffect, useState } from 'react';
import type { LifeBasePoint, UserMobilityProfile } from '@/shared/types';

export default function AdminDataPage() {
  const [lifeBases, setLifeBases] = useState<LifeBasePoint[]>([]);
  const [mobility, setMobility] = useState<UserMobilityProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  function load() {
    setLoading(true);
    const base = `/api/admin/life-bases?from=${from}&to=${to}`;
    const mob = `/api/admin/mobility?from=${from}&to=${to}`;
    Promise.all([fetch(base).then((r) => r.json()), fetch(mob).then((r) => r.json())])
      .then(([lb, m]: [LifeBasePoint[], UserMobilityProfile[]]) => {
        setLifeBases(lb);
        setMobility(m);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>生活拠点・運動能力（蓄積データ）</h1>
      <p style={{ color: '#444', marginBottom: '1rem', fontSize: '0.95rem' }}>
        訓練ログから算出した「生活拠点」（経路の起点）と「運動能力」（平均歩行速度）です。避難塔シミュレーションで「どこに作ると何人救えるか」の元データとして利用されます。
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        <label>
          <span style={{ marginRight: '0.5rem' }}>から</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', marginRight: '1rem' }}
          />
        </label>
        <label>
          <span style={{ marginRight: '0.5rem' }}>まで</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', marginRight: '1rem' }}
          />
        </label>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            background: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '取得中…' : '再取得'}
        </button>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>生活拠点（{lifeBases.length} 件）</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
          匿名ユーザーごとの代表位置（直近の経路起点）
        </p>
        <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>ユーザーID</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>緯度</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>経度</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>訓練回数</th>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>最終記録</th>
              </tr>
            </thead>
            <tbody>
              {lifeBases.slice(0, 100).map((lb) => (
                <tr key={lb.userId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{lb.userId.slice(0, 12)}…</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{lb.position.lat.toFixed(5)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{lb.position.lng.toFixed(5)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{lb.trainingCount}</td>
                  <td style={{ padding: '0.5rem' }}>{lb.lastRecordedAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lifeBases.length > 100 && (
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            先頭100件のみ表示。全件はAPIで取得できます。
          </p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>運動能力（{mobility.length} 件）</h2>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
          匿名ユーザーごとの平均歩行速度・平均所要時間
        </p>
        <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>ユーザーID</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>平均速度(m/s)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>平均所要時間(秒)</th>
                <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>訓練回数</th>
              </tr>
            </thead>
            <tbody>
              {mobility.slice(0, 100).map((m) => (
                <tr key={m.userId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{m.userId.slice(0, 12)}…</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{m.averageSpeedMps.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{Math.round(m.averageDurationSeconds)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{m.trainingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mobility.length > 100 && (
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            先頭100件のみ表示。
          </p>
        )}
      </section>
    </>
  );
}
