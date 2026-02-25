# ひなんけいろ

日本の沿岸部を対象とした**津波避難訓練アプリ**です。

- **平時に**、実在の建築物・地図を使った避難訓練シミュレーションを行う
- 住民の**運動ログ**を行政と共有し、科学的な防災設計に役立てる
- データ提供の**インセンティブ**と**健康効果**で、継続的な訓練参加を促す

## ドキュメント

| ファイル | 内容 |
|----------|------|
| [docs/SETUP.md](docs/SETUP.md) | **開発環境の構築手順**（初回セットアップ・トラブルシュート） |
| [docs/FIELD_INTEGRATION.md](docs/FIELD_INTEGRATION.md) | **現場統合メモ**（各 Agent との議論内容・現状サマリ・契約の確認） |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | ビジョン・機能・システム構成・データソース |
| [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) | 設計図（目的・機能・技術・各 Agent 役割の詳細） |
| [docs/TECH_STACK.md](docs/TECH_STACK.md) | 技術スタック・ディレクトリ構成・環境変数 |
| [docs/DATA_HAMAMATSU.md](docs/DATA_HAMAMATSU.md) | 浜松市向けデータ戦略（位置・標高・建築物高さ） |
| [AGENTS.md](AGENTS.md) | 複数 Cursor Agent の役割分担と並行開発ガイド |

- 建築物・標高データの取り込み: [scripts/README.md](scripts/README.md) / [data/README.md](data/README.md)

## 複数エージェントで並行開発する場合

1. **AGENTS.md** を開き、担当エージェント（A〜E）を決める
2. **shared/types.ts** を全員が参照。型の追加・変更はここに集約する
3. 設計の詳細は **docs/ARCHITECTURE.md** に従う
4. コンフリクトを減らすため、担当ディレクトリ外はなるべく触らない

## セットアップ

**詳しい手順・トラブルシュートは [docs/SETUP.md](docs/SETUP.md) を参照。**

```bash
npm install
cp .env.example .env.local   # DATABASE_URL を設定（SQLite なら file:./dev.db のままで可）
npx prisma db push
npm run dev
```

→ http://localhost:3000 で起動。

### GitHub Pages でデモを公開する

**見た目だけのデモ**を GitHub Pages で公開できます（API・DB は動きません）。手順は [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md) を参照。`npm run build:gh-pages` で静的ビルドし、`out/` をデプロイする。フルに動かす場合は Vercel を推奨。

### 訓練ログ API（Agent B）

- **POST /api/training-logs** … 訓練ログを保存（body: `TrainingLogCreate`）
- **GET /api/training-logs** … 取得（query: `userId`, `from`, `to`, `scenarioId`, `limit`）
- **GET /api/training-logs/export** … 行政向けエクスポート（query: `from`, `to`, `scenarioId?`, `format=csv|geojson`）。同意済みログのみ。

## ライセンス・データ利用

津波浸水想定・避難所データ等は国・自治体のオープンデータを利用します。利用条件は各データソースに従ってください。
