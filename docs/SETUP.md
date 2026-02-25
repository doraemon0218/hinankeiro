# ひなんけいろ - 開発環境の構築

現場で開発するために、**環境を一から作る手順**をまとめる。初回セットアップ・新規メンバー用。

---

## 前提

- **Node.js**: v18 以上を推奨（`node -v` で確認）。
- **npm**: 通常は Node に同梱（`npm -v` で確認）。
- リポジトリはクローン済み、またはワークスペースで `hinankeiro` を開いていること。

---

## 1. リポジトリの準備

```bash
cd /path/to/hinankeiro   # プロジェクトルートへ
```

（既にこのディレクトリで作業している場合は省略。）

---

## 2. 依存関係のインストール

```bash
npm install
```

- `package.json` の依存（Next.js, React, Prisma 等）がインストールされる。
- `postinstall` で `prisma generate` が走り、Prisma Client が生成される。
- 失敗する場合は `npm ci` を試す（`package-lock.json` が存在する場合）。

---

## 3. 環境変数の設定

```bash
cp .env.example .env.local
```

- **必須**: `DATABASE_URL` だけ設定すれば開発は始められる。
- **SQLite（開発用）** のまま使う場合:
  - `.env.local` の `DATABASE_URL` を次のようにする（先頭の `#` を外す）:
    ```env
    DATABASE_URL="file:./dev.db"
    ```
  - このとき DB ファイルは **`prisma/dev.db`** に作成される（パスは `prisma/schema.prisma` からの相対）。
- **PostgreSQL** を使う場合:
  - 例: `DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hinankeiro"`
  - 事前に DB を作成しておく（`createdb hinankeiro` 等）。

その他の変数（`MAP_TILE_URL`, `NEXTAUTH_*`, `ADMIN_API_KEY`）は、該当機能を触るときに設定すればよい。

---

## 4. データベースの初期化

```bash
npx prisma db push
```

- スキーマ（`prisma/schema.prisma`）を DB に反映する。テーブルが無ければ作成、既存なら差分を適用。
- マイグレーション履歴を使う場合は `npx prisma migrate dev` を利用（プロジェクトで migrate を採用している場合）。
- **初回のみ**でよい。スキーマを変更したあとにもう一度 `npx prisma db push` する。

（オプション）DB の中身を確認したい場合:

```bash
npx prisma studio
```

- ブラウザで Prisma Studio が開く。訓練ログ・UserDemographics・IncentiveCampaign を閲覧・編集できる。

---

## 5. 開発サーバーの起動

```bash
npm run dev
```

- ブラウザで **http://localhost:3000** を開く。
- 住民向けトップ: `/`
- プロフィール例: `/profile`
- 行政ダッシュボード: `/admin`（インセンティブ、ログ、データ、シミュレーション等）

---

## 6. よく使うコマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー起動（ホットリロード） |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番ビルド後の起動（`build` のあと） |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript の型チェック（`tsc --noEmit`） |
| `npx prisma generate` | Prisma Client の再生成（schema 変更後） |
| `npx prisma db push` | スキーマを DB に反映 |
| `npx prisma studio` | DB の GUI 閲覧 |

---

## 7. トラブルシュート

### `prisma generate` でエラーになる

- `prisma/schema.prisma` の文法エラーがないか確認。
- Node のバージョンが古い場合は v18 以上に上げる。

### `db push` で「DATABASE_URL が設定されていない」

- `.env.local` に `DATABASE_URL` が書かれているか確認。Next.js は `.env.local` を読むが、Prisma CLI は**カレントディレクトリの `.env` または `.env.local`** を参照する。ルートに `.env.local` があれば通常は読まれる。
- 明示的に渡す例: `DATABASE_URL="file:./dev.db" npx prisma db push`

### ポート 3000 が使われている

- 別の Next プロセスが動いていないか確認（`lsof -i :3000` 等）。
- 別ポートで起動: `npm run dev -- -p 3001`

### 型エラーが多発する

- `npx prisma generate` を再実行。
- `shared/types.ts` を変更した場合は、他ファイルの import が正しいか確認。`npm run typecheck` で一括確認。

### データ（建築物・浸水想定）がない

- 地図やシミュレーション用の GeoJSON は `data/hamamatsu/` に配置する想定。取得手順は `scripts/README.md` と `data/README.md` を参照。標高は `scripts/fetch-elevation.js` で国土地理院 API を呼べる。

---

## 8. 参照ドキュメント

- **設計・役割**: `docs/PROJECT_PLAN.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`
- **現場の議論統合**: `docs/FIELD_INTEGRATION.md`
- **タスク一覧**: `docs/TODO.md`
- **データ・スクリプト**: `data/README.md`, `scripts/README.md`

ここまでで「環境を作りたい」が一通り満たせる。不明点は上記ドキュメントか、統括に確認する。
