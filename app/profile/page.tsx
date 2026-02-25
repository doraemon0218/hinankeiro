'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { UserDemographics, MobilityCapability } from '@/shared/types';

const MOBILITY_OPTIONS: { value: MobilityCapability; label: string }[] = [
  { value: 'walk', label: '自力で歩ける' },
  { value: 'run', label: '走れる' },
  { value: 'bicycle', label: '自転車乗れる' },
  { value: 'car', label: '車運転できる' },
  { value: 'cane', label: '杖' },
  { value: 'wheelchair', label: '車椅子' },
  { value: 'bedridden', label: '寝たきり' },
];

const USER_ID_KEY = 'hinankeiro_user_id';

function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'anon_' + Math.random().toString(36).slice(2, 14) + '_' + Date.now().toString(36);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export default function ProfilePage() {
  const [userId, setUserId] = useState('');
  const [demographics, setDemographics] = useState<UserDemographics | null>(null);
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [mobilityCapability, setMobilityCapability] = useState<MobilityCapability>('walk');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const id = getOrCreateUserId();
    setUserId(id);
    fetch(`/api/user/demographics?userId=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UserDemographics | null) => {
        if (d) {
          setDemographics(d);
          setAge(d.age ?? '');
          setGender(d.gender ?? 'male');
          setMobilityCapability(d.mobilityCapability ?? 'walk');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    fetch('/api/user/demographics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        age: age === '' ? undefined : age,
        gender,
        mobilityCapability,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('保存に失敗しました');
        return r.json();
      })
      .then(() => setSaved(true))
      .catch(() => setSaved(false))
      .finally(() => setSaving(false));
  }

  if (loading) return <p style={{ padding: '2rem' }}>読み込み中…</p>;

  return (
    <main style={{ padding: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
      <p style={{ marginBottom: '1rem' }}>
        <Link href="/" style={{ color: '#0d6efd' }}>← トップへ</Link>
      </p>
      <h1 style={{ marginBottom: '0.5rem' }}>あなたの情報（初回入力）</h1>
      <p style={{ color: '#444', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        年齢・性別・移動の状況を教えてください。地域の訓練インセンティブ（振興券など）の対象判定に利用し、行政の防災計画にも役立てます。任意入力です。
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>年齢（歳）</span>
          <input
            type="number"
            min={0}
            max={120}
            value={age === '' ? '' : age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            style={{ padding: '0.5rem' }}
            placeholder="任意"
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>性別</span>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            style={{ padding: '0.5rem' }}
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span>移動の状況（普段どのように移動されますか？）</span>
          <select
            value={mobilityCapability}
            onChange={(e) => setMobilityCapability(e.target.value as MobilityCapability)}
            style={{ padding: '0.5rem' }}
          >
            {MOBILITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '0.75rem 1rem',
            background: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? '保存中…' : '保存する'}
        </button>
        {saved && <p style={{ color: '#0a0' }}>保存しました。</p>}
      </form>
    </main>
  );
}
