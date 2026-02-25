# 現場統合メモ（各 Agent との議論内容）

現場で各 Agent と議論した内容を統合し、**現時点のコードベースと設計の対応**を固定する。新規参加者や別セッションの Agent が「今何ができていて、何に合意しているか」を把握するためのドキュメント。

---

## 1. 現状サマリ

| 領域 | 担当 | 実装状況 | 主なファイル・API |
|------|------|----------|-------------------|
| **共通型** | 全員参照 | ✅ 確定 | `shared/types.ts`（TrainingLog, EvacuationOptionForChoice, IncentiveCampaign 等） |
| **DB・訓練ログ API** | Agent B | ✅ 実装済 | Prisma（TrainingLog, UserDemographics, IncentiveCampaign）、`lib/db/client.ts`、POST/GET `/api/training-logs`、export API |
| **住民 UI・ゲーミフィケーション** | Agent C | ✅ 一部実装 | `lib/gamification/`（badges, ranks, encouragement）、`lib/health/`、`app/profile/`、`app/components/ResidentButton.tsx` |
| **行政ダッシュボード** | Agent D | ✅ 一部実装 | `app/admin/`（incentives, logs, data, simulate, stats）、`lib/analytics/`、`lib/admin/campaigns.ts`、各種 admin API |
| **地図・シミュレーション** | Agent A | ⏳ 要実装 | `lib/map/` は未実装。設計は `docs/DESIGN_MAP_SIMULATION.md` |
| **データ取り込み** | Agent E | ✅ 骨格のみ | `scripts/fetch-elevation.js`、`scripts/README.md`、`data/README.md`。PLATEAU 変換は未実装 |

---

## 2. 各 Agent との議論で固まったこと

### Agent A（地図・シミュレーション）

- **型**: `SimulationState`, `RouteResult`, `EvacuationOptionForChoice`, `TrainingEndValidation`, `DEFAULT_GOAL_VALIDATION_THRESHOLD_METERS`, `BuildingFeatureProperties`, `EvacuationHeightCandidate` を `shared/types.ts` で共有。
- **画面フロー**: 準備 → ワンクリック開始 → 訓練中（タイマー実時刻ベース、ゴール至近でのみ終了ボタン、中断＝ログ残さない）→ 終了時 50m 閾値で位置検証。詳細は `docs/DESIGN_MAP_SIMULATION.md`。
- **データ**: 標高は国土地理院 API、建築物は PLATEAU 浜松市を GeoJSON 化（Agent E が配置）。`docs/DATA_HAMAMATSU.md` 参照。
- **未実装**: 地図コンポーネント・経路描画・避難先候補算出。次の着手候補は `docs/TODO.md` の T1-1〜T1-9。

### Agent B（訓練ログ・API）

- **スキーマ**: `TrainingLog`（経路・軌跡・所要時間・同意フラグ・transportMode）、`UserDemographics`（年齢・性別・移動能力）、`IncentiveCampaign`（ターゲット・報酬・条件・予算を JSON で保存）。SQLite 想定、`DATABASE_URL` で切り替え可。
- **API**: POST `/api/training-logs`（body: `TrainingLogCreate`）、GET `/api/training-logs`（userId, from, to, scenarioId, limit）、GET `/api/training-logs/export`（行政向け、同意済みのみ）。
- **拡張**: 住民の属性は `UserDemographics`、インセンティブは `IncentiveCampaign` で行政が設定。運動能力はログから算出（`UserMobilityProfile`, `EmergencyGuideProfile`）。生活拠点・避難施設シミュレーション用 API（`/api/admin/life-bases`, `/api/admin/simulate-facility` 等）あり。
- **クライアント**: `lib/db/client.ts` で Prisma シングルトン。`lib/logs/training-logs.ts` でログの CRUD をラップ。

### Agent C（住民 UI・インセンティブ）

- **方針**: 高齢者でも操作しやすい大きなタップ領域・フォント。貢献の見える化（回数・あと何回でご褒美・行政の感謝）。同意フローは訓練前で、拒否しても訓練は可能。`docs/DESIGN_RESIDENT_UX.md` に詳細。
- **型**: `UserProfile`, `Badge`, `UserContributionSummary`, `RewardProgress`, `ConsentStatus`, `AppMode`（平時/有事）。
- **実装**: `lib/gamification/`（badges, ranks, encouragement）、`lib/health/`（距離・歩数フォーマット）。`app/profile/`、住民向けボタンコンポーネント。インセンティブ取得 API（`/api/incentives`）、属性登録（`/api/user/demographics`）あり。
- **未実装**: 訓練開始〜結果までの一連画面（準備画面・訓練中・結果は Agent A と連携が必要）。

### Agent D（行政ダッシュボード）

- **機能**: インセンティブキャンペーン CRUD（`/admin/incentives`、`/api/admin/campaigns`）、ログ一覧・エクスポート（`/admin/logs`）、集計・データ（`/admin/data`）、避難施設シミュレーション（`/admin/simulate`）、統計・モビリティ API（`/api/admin/stats`, `/api/admin/mobility`）。
- **型**: `AggregatedStats`, `LifeBasePoint`, `UserMobilityProfile`, `EvacuationFacilitySimulationInput/Result`, `IncentiveCampaign` 関連（Targeting, Reward, Condition, BudgetLimits）。
- **実装**: `lib/admin/campaigns.ts`、`lib/analytics/aggregation.ts`、`lib/analytics/facility-simulation.ts`。認証は簡易 or 未実装のため、本番では要検討。

### Agent E（インフラ・データ）

- **データ配置**: `data/hamamatsu/` に buildings / inundation / shelters の GeoJSON を配置する想定。`data/README.md` に出典・利用条件を記載。
- **スクリプト**: 標高は `scripts/fetch-elevation.js`（国土地理院 API サンプル）。PLATEAU → GeoJSON 変換は手順のみ `scripts/README.md` に記載、スクリプトは未実装。
- **環境**: `.env.example` に `DATABASE_URL` 等。CI・デプロイは「GitHub で公開できればOK」方針（`docs/TECH_STACK.md`）。

---

## 3. 契約（インターフェース）の確認

- **訓練ログ保存**: フロント／地図側は `TrainingLogCreate` を POST `/api/training-logs` に送る。`route`（RouteResult）、`actualTrajectory`（TrajectoryPoint[]）、`transportMode`、`actualDistanceMeters`、`actualDurationSeconds` を欠かさず送ること。
- **共通型の変更**: 追加・変更は `shared/types.ts` にのみ行い、他 Agent に影響がある場合は `docs/ARCHITECTURE.md` または本ファイルに追記する。
- **行政向けエクスポート**: 同意済み（`consentToShareWithGovernment === true`）のログのみ。期間・format（csv / geojson）はクエリで指定。

---

## 4. 環境を作る手順

**開発環境の作り方は `docs/SETUP.md` に記載する。** 最小限は以下。

1. リポジトリをクローン／開く。
2. `npm install`
3. `.env.example` をコピーして `.env.local` にし、`DATABASE_URL` を設定（SQLite なら `file:./dev.db` で可。パスは `prisma/` からの相対）。
4. `npx prisma generate` および `npx prisma db push`
5. `npm run dev` で http://localhost:3000 を起動。

詳細・トラブルシュートは **`docs/SETUP.md`** を参照。

---

## 5. 今後の更新ルール

- 現場で「〇〇にした」と合意したら、このファイルの該当 Agent の節に**簡潔に追記**する。
- 新規 API や型を追加したら、上記「現状サマリ」「契約」を更新する。
- 統括が検品した結果、設計と実装の齟齬があればここに「要修正」としてメモし、`docs/TODO.md` にタスクを立てる。

これで「現場で議論した内容」と「今のコードベース」が一箇所で追える状態になる。
