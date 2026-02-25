# 技術スタック（ひなんけいろ）

## 方針

- **モノレポ**: Next.js 1本でフロント + API Routes、行政ダッシュボードは `/admin` または別アプリ化も可
- **共通型**: `shared/types.ts` を全エージェントで参照
- **地図**: 国土地理院タイル + Leaflet または Mapbox GL JS（要選定）
- **データ**: 津波浸水想定・避難所は GeoJSON を静的配置 or CDN、建築物は必要に応じて API 化
- **デプロイ**: 想定なし。**GitHub 上で公開・共有できればOK**（本番デプロイは行わない想定）

## 推奨ライブラリ（候補）

| 用途 | 候補 | 備考 |
|------|------|------|
| 地図 | react-leaflet, Leaflet | 国土地理院タイル対応が容易 |
| 地図（高機能） | Mapbox GL JS | 3D・大量ポリゴン向き |
| ルーティング | OSRM (self-host or 公開API) / 国交省のAPI | 歩行者ルート |
| DB | SQLite / PostgreSQL + Prisma | ログ保存 |
| 認証 | NextAuth.js / 匿名ID only | 行政は別認証 |
| デプロイ | なし（GitHub 公開のみ） | 必要なら Vercel / GitHub Pages 等を検討可 |

## ディレクトリ構成（案）

```
hinankeiro/
├── shared/           # 共通型・定数
│   └── types.ts
├── lib/              # フロント/API 共通ロジック
│   ├── map/          # Agent A: 地図・シミュレーション
│   ├── db/           # Agent B: DB・ログ
│   ├── gamification/ # Agent C: バッジ・ランク
│   └── analytics/    # Agent D: 集計
├── app/              # Next.js App Router (または pages/)
│   ├── api/          # API Routes
│   ├── admin/        # 行政ダッシュボード
│   └── (住民向けページ)
├── data/             # 静的な GeoJSON 等（Agent E が生成）
├── scripts/          # データ取り込み・ビルド（Agent E）
├── docs/
└── AGENTS.md
```

## 環境変数（.env.example に記載すること）

- `DATABASE_URL` … DB 接続（Prisma 等使用時）
- `MAP_TILE_URL` … 地図タイル（国土地理院等）
- `NEXTAUTH_SECRET` … 認証利用時
- 行政ダッシュボード用の API キー or 認証（要設計）
