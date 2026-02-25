import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ひなんけいろ - 津波避難訓練',
  description: '沿岸部の津波避難訓練シミュレーション。実地図で訓練し、行政とデータを共有して防災設計に役立てよう。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
