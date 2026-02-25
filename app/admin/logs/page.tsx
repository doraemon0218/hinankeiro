'use client';

import { useEffect, useState } from 'react';
import type { TrainingLog } from '@/shared/types';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [scenarioId, setScenarioId] = useState('');

  function load() {
    setLoading(true);
    const params = new URLSearchParams({ from, to, limit: '200' });
    if (scenarioId) params.set('scenarioId', scenarioId);
    fetch(`/api/training-logs?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data: TrainingLog[]) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <h1 style={{ marginBottom: '0.5rem' }}>訓練ログ 中央監視</h1>
      <p style={{ color: '#444', marginBottom: '1rem', fontSize: '0.95rem' }}>
        期間・シナリオで訓練ログを一覧表示します。住民の訓練状況をモニタリングするために利用できます。
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
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
        <label>
          <span style={{ marginRight: '0.5rem' }}>シナリオID</span>
          <input
            type="text"
            placeholder="任意"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', width: 140, marginRight: '1rem' }}
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

      <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
        件数: {logs.length} 件（最大200件）
      </p>
      <div style={{ overflowX: 'auto', border: '1px solid #e0e0e0', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                日時
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                ユーザーID
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                シナリオ
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>
                所要時間(秒)
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'right', borderBottom: '1px solid #e0e0e0' }}>
                距離(m)
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                間に合った
              </th>
              <th style={{ padding: '0.5rem', textAlign: 'left', borderBottom: '1px solid #e0e0e0' }}>
                行政共有同意
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{log.createdAt.slice(0, 19)}</td>
                <td style={{ padding: '0.5rem' }}>{log.userId.slice(0, 12)}…</td>
                <td style={{ padding: '0.5rem' }}>{log.scenarioId}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{log.route.durationSeconds}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>{log.route.distanceMeters}</td>
                <td style={{ padding: '0.5rem' }}>{log.evacuatedInTime ? 'はい' : 'いいえ'}</td>
                <td style={{ padding: '0.5rem' }}>{log.consentToShareWithGovernment ? '同意' : '未同意'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.length === 0 && !loading && (
        <p style={{ color: '#666', marginTop: '1rem' }}>該当する訓練ログがありません。</p>
      )}
    </>
  );
}
