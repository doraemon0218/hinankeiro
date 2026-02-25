# GitHub Pages でデモを公開する

**結論**: **見た目デモは GitHub Pages で見られます。** ただし **API・DB は動きません**（静的ホスティングのため）。訓練ログの保存や行政ダッシュボードのデータ取得はできず、「画面の見た目」だけのデモになります。

フルに動かしたい場合は **Vercel** などの Node 対応ホスティングを推奨します。

---

## 制限（GitHub Pages の場合）

| できること | できないこと |
|------------|----------------|
| トップ・プロフィール・管理画面の**表示** | 訓練ログの保存（POST /api/...） |
| リンク・ナビゲーション | 集計・ログ一覧・エクスポート（API が 404） |
| UI の確認・デモ用途 | 行政ダッシュボードの実データ表示 |

---

## 手順（リポジトリが `username.github.io/hinankeiro` の場合）

リポジトリ名が `hinankeiro` で、`https://<username>.github.io/hinankeiro/` で公開する想定です。

### 1. 静的ビルドを実行

```bash
npm install
npx prisma generate   # 先に Prisma Client を生成（DB は使わないが型のためビルドに必要）
npm run build:gh-pages
```

- `GITHUB_PAGES=1` で静的エクスポート、`BASE_PATH=/hinankeiro` でサブパス対応。
- 出力は **`out/`** フォルダに生成される。
- **注意**: Prisma のバージョンや schema の書き方で `prisma generate` が失敗する場合は、まず通常の `npm run build` が通る状態にしてから `build:gh-pages` を実行してください。

### 2. リポジトリの設定

- GitHub のリポジトリ → **Settings** → **Pages**
- **Source**: Deploy from a branch
- **Branch**: `gh-pages`（または `main` の `/docs` や `/out` は使えないので、通常は **gh-pages** ブランチで `out` の中身を置く）

### 3. `out` を gh-pages ブランチにデプロイ

**方法 A: 手動で push**

```bash
# 初回のみ
git subtree split --prefix out -b gh-pages
git push origin gh-pages

# 2回目以降: 毎回 build 後に out の中身を gh-pages のルートに反映する必要がある
# 以下のようにスクリプトでやるか、方法 B の Actions を使う
```

**方法 B: GitHub Actions で自動デプロイ（推奨）**

`.github/workflows/deploy-gh-pages.yml` を追加し、`main`  push 時に `build:gh-pages` して `out` を `gh-pages` ブランチにデプロイするようにする（下記「Actions 例」を参照）。

### 4. 公開 URL

- `https://<username>.github.io/hinankeiro/` でトップが開く。
- プロフィールは `https://<username>.github.io/hinankeiro/profile`、管理は `https://<username>.github.io/hinankeiro/admin`。  
  ※ API は存在しないので、管理画面は「読み込み中」のままかエラー表示になります。

---

## リポジトリが `<username>.github.io` の場合（ルートで公開）

ルートで公開する場合は `BASE_PATH` を空にしてビルドする。

```bash
GITHUB_PAGES=1 next build
```

- `package.json` に `"build:gh-pages-root": "GITHUB_PAGES=1 next build"` を追加してもよい。
- その場合、`out/` をそのまま **main** のルート（または `gh-pages` のルート）にデプロイする。

---

## GitHub Actions 例（自動デプロイ）

リポジトリに次のワークフローを置くと、`main` に push するたびに静的ビルドして GitHub Pages にデプロイできます。

```yaml
# .github/workflows/deploy-gh-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency: group=pages
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build:gh-pages
        env:
          GITHUB_PAGES: '1'
          BASE_PATH: '/hinankeiro'
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

- リポジトリ **Settings** → **Pages** で Source を **GitHub Actions** にしておく。
- リポジトリ名が `hinankeiro` なら、URL は `https://<username>.github.io/hinankeiro/`。

---

## フルに動くデモが欲しい場合（Vercel）

- [Vercel](https://vercel.com) に GitHub リポジトリを連携する。
- デプロイすると **API と DB（Vercel の Postgres や SQLite 等）も動く** ため、訓練ログ保存や管理画面の集計まで試せる。
- 無料枠でデモ用には十分なことが多い。

GitHub Pages は「見た目だけのデモ」、Vercel は「動くデモ」と使い分けるとよいです。
