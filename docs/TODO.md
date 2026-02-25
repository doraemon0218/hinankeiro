# ひなんけいろ - タスク一覧（TODO）

統括Agent が開発タスクを最小単位に分解した一覧。**今日まず着手するタスク**と、他 Agent（または新しいセッション）に渡す**指示文**を下部に記載する。

---

## 1. タスク分解（最小単位）

### 基盤・共有

- [ ] **T0-1** `shared/types.ts` の見直し: 既存の型が `docs/PROJECT_PLAN.md` および `docs/DESIGN_MAP_SIMULATION.md` の仕様と齟齬がないか確認し、不足型（例: `EvacuationOptionForChoice`, `UserMobilityProfile`, `UserContributionSummary` 等）を追加する。
- [ ] **T0-2** 環境: `.env.example` に `DATABASE_URL` 等が含まれているか確認。Prisma 利用時は `prisma/schema.prisma` を追加する方針を記載。

### Agent A: 地図・シミュレーション

- [ ] **T1-1** 地図の土台: 国土地理院タイルを表示する地図コンポーネントを 1 つ作成する（`lib/map/` または `app/` 配下）。Leaflet または Mapbox のいずれかを選び、`next.config.js` でドメイン許可が必要なら設定する。
- [ ] **T1-2** 現在地（GPS）の取得とマーカー表示。準備画面で「スタート位置」として使う。
- [ ] **T1-3** 津波浸水想定レイヤー: GeoJSON をオーバーレイ表示（`data/` にサンプル or 静岡県の想定データを配置するのは Agent E と調整）。
- [ ] **T1-4** 避難所・避難先候補のピン表示。候補リストは仮データでよい。
- [ ] **T1-5** 経路描画: 2 点間のルートを API（OSRM 等）またはクライアント側で計算し、地図上にポリライン表示。
- [ ] **T1-6** 制限時間内の到達可能範囲の計算と、有効避難高さが高い候補の算出（標高・建築物高さは Agent E のデータ or 国土地理院標高 API と連携）。
- [ ] **T1-7** 準備画面 UI: スタート・候補選択・ワンクリック開始（`docs/DESIGN_MAP_SIMULATION.md` のレイアウトに沿う）。
- [ ] **T1-8** 訓練中画面: タイマー（実時刻ベース）、終了ボタン（ゴール至近でのみ有効）、中断ボタン。
- [ ] **T1-9** 終了時の位置検証: ゴールから 50m 以内か判定し、訓練認定の有無を返す。

### Agent B: 訓練ログ・API

- [ ] **T2-1** 訓練ログ用 DB スキーマ: Prisma で `TrainingLog` に相当するモデルを定義（経路は JSON または Text で保存）。`shared/types.ts` の `TrainingLogCreate` と整合させる。
- [ ] **T2-2** POST /api/training-logs: body を `TrainingLogCreate` として受け取り、DB に保存。バリデーションとエラーレスポンスを返す。
- [ ] **T2-3** GET /api/training-logs: query で `userId`, `from`, `to`, `scenarioId`, `limit` を受け取り、同意済み含めユーザー自身のログを返す（行政向けは別で集計・匿名化）。
- [ ] **T2-4** GET /api/training-logs/export: 行政向け。同意済みログのみ、期間・format でフィルタし CSV または GeoJSON を返す。認証は簡易（API キー or 未実装で固定トークン）でよい。
- [ ] **T2-5** （任意）運動能力プロファイル: ログから歩行速度等を算出する関数。型は `UserMobilityProfile` 等を `shared/types.ts` に定義してから実装。

### Agent C: 住民向け UI・インセンティブ

- [ ] **T3-1** 住民向けトップ画面: 説明文・「訓練を始める」ボタン・（あれば）簡単なステータス表示。`docs/DESIGN_RESIDENT_UX.md` の大きなタップ領域・フォントを意識。
- [ ] **T3-2** 訓練開始フロー: トップ → 準備画面（Agent A と連携）→ 訓練中 → 結果画面へのルーティング。
- [ ] **T3-3** 結果画面: 所要時間・距離・「時間内に避難完了したか」を表示。行政共有同意の確認（同意済みならログ送信）。
- [ ] **T3-4** 行政へのデータ提供同意フロー: 説明文・同意/拒否選択。同意時のみ `consentToShareWithGovernment: true` で保存。
- [ ] **T3-5** 履歴一覧: 過去の訓練ログを一覧表示（GET /api/training-logs を呼ぶ）。
- [ ] **T3-6** ゲーミフィケーション: バッジ・ランクの定義（データ構造）と、獲得時の表示（簡易でよい）。
- [ ] **T3-7** 貢献の見える化: 「過去○回活用されています」「あと○回でご褒美」の表示（バックエンドの API が用意されれば連携）。

### Agent D: 行政ダッシュボード

- [ ] **T4-1** 行政用ログイン or API キーによるエクスポートのみの設計。まずはエクスポート API の呼び出しだけでも可。
- [ ] **T4-2** 集計ダッシュボード: 期間指定で訓練回数・平均所要時間・避難成功率を表示（GET /api/training-logs/export または集計用 API を新設）。
- [ ] **T4-3** 経路ヒートマップ: 同意済みログの経路を地図上に重ねて表示（オプション）。
- [ ] **T4-4** エクスポート画面: CSV/GeoJSON ダウンロードボタン。

### Agent E: インフラ・データ

- [ ] **T5-1** `data/README.md`: データの出典・利用条件・配置フォルダの説明。
- [ ] **T5-2** 津波浸水想定または避難所のサンプル GeoJSON を 1 つ `data/hamamatsu/` に配置（取得スクリプトがなくても手動で配置可）。
- [ ] **T5-3** PLATEAU 浜松市の建築物データ取得・変換スクリプト（GeoJSON + 高さ）。時間がかかるため後回しでも可。
- [ ] **T5-4** CI: `.github/workflows` で lint / build を実行（オプション）。

---

## 2. 今日まず着手するタスク

**選定**: **T2-1** と **T2-2**（訓練ログ用 DB スキーマの定義と POST /api/training-logs の実装）。  
他 Agent が「ログを保存する」という契約に依存するため、先にデータ契約と API の骨組みを用意する。

---

## 3. 他 Agent に渡す指示文（コピペ用）

以下を、**Agent B（訓練ログ・API 担当）** として動く別の Cursor Agent または新しいセッションにそのまま渡してください。

---

### 指示文（Prompt）開始 ———

**役割**: 君は「ひなんけいろ」プロジェクトの **Agent B（訓練ログ・API・バックエンド担当）** として動いてください。

**参照すること**:
- 設計: `docs/PROJECT_PLAN.md` の「Agent B」の節、`docs/ARCHITECTURE.md`
- 型定義: `shared/types.ts` の `TrainingLog`, `TrainingLogCreate`, `ExportOptions` 等
- タスク: `docs/TODO.md` の **T2-1** と **T2-2**

**やること**:

1. **T2-1** 訓練ログ用 DB スキーマを定義する。
   - Prisma を導入する（未導入なら `prisma init` と `schema.prisma` を作成し、`package.json` に `prisma` と `@prisma/client` を追加する）。
   - `TrainingLog` に相当するモデルを定義する。フィールドは `shared/types.ts` の `TrainingLogCreate` および `TrainingLog` に合わせる（id, userId, scenarioId, 経路の座標・所要時間・距離、startedAt, finishedAt, evacuatedInTime, consentToShareWithGovernment, createdAt）。経路は JSON 型または Text で保存してよい。
   - SQLite または PostgreSQL のいずれかでよい。`.env.example` に `DATABASE_URL` の例を記載する。
   - `npx prisma db push` または `prisma migrate dev` でスキーマを適用できる状態にする。

2. **T2-2** POST /api/training-logs を実装する。
   - Next.js の App Router で `app/api/training-logs/route.ts` を作成する。
   - リクエスト body を `TrainingLogCreate` の形で受け取る（型は `shared/types.ts` から import）。
   - バリデーション（必須項目・日時形式・座標の有無など）を行い、不正なら 400 とエラーメッセージを返す。
   - 正常時は DB に保存し、保存したレコード（id, createdAt 含む）を 201 で返す。
   - `shared/types.ts` の型を変更しないこと。不足している型があれば、`shared/types.ts` に**追加提案**する形でコメントに書く。

**制約**:
- 既存の `shared/types.ts` の型定義は変更しない。利用するだけにする。
- 住民認証は今回は考慮しない（userId はそのまま body で受け取り、保存するだけでよい）。
- 日本語でコメント・README を書いてよい。変数名・関数名は英語で書く。

**成果物**:
- `prisma/schema.prisma`（訓練ログモデル）
- `app/api/training-logs/route.ts`（POST のみでよい）
- 必要なら `lib/db/prisma.ts` など Prisma クライアントのシングルトン
- `.env.example` に `DATABASE_URL` が含まれていることの確認

完了したら、どのファイルを追加・変更したかを簡潔にまとめて返してください。

——— 指示文（Prompt）終了 ———

---

上記をコピーして、Agent B 役の別セッションまたは別 Agent に渡すと、訓練ログの保存基盤が実装されます。実装後、統括Agent が検品・統合を行います。
