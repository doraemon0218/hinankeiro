import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1>ひなんけいろ</h1>
      <p style={{ marginTop: '1rem', color: '#444' }}>
        沿岸部の津波避難訓練シミュレーション。実地図で訓練し、運動ログを行政と共有して科学的な防災設計に役立てます。
      </p>
      <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
        開発中です。複数エージェントで並行開発する場合は <code>AGENTS.md</code> を参照してください。
      </p>
      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/profile" style={{ color: '#0d6efd', fontWeight: 600 }}>
          あなたの情報を登録（年齢・性別・移動の状況）
        </Link>
        … 訓練インセンティブの対象判定に利用します。
      </p>
    </main>
  );
}
