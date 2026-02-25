import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
            ひなんけいろ
          </Link>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>行政ダッシュボード</span>
          <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <Link href="/" style={{ color: '#666', fontSize: '0.9rem' }}>トップへ</Link>
            <Link href="/admin" style={{ color: '#0d6efd' }}>概要</Link>
            <Link href="/admin/logs" style={{ color: '#333' }}>訓練ログ監視</Link>
            <Link href="/admin/data" style={{ color: '#333' }}>生活拠点・運動能力</Link>
            <Link href="/admin/simulate" style={{ color: '#333' }}>施設シミュレーション</Link>
            <Link href="/admin/incentives" style={{ color: '#333' }}>インセンティブ</Link>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
