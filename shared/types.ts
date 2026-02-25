/**
 * ひなんけいろ - 共通型定義
 * 複数エージェントで参照するため、ここに集約する。
 * 変更時は AGENTS.md / docs/ARCHITECTURE.md と整合を取ること。
 */

// --- 地図・シミュレーション (Agent A が実装) ---

export interface LatLng {
  lat: number;
  lng: number;
}

export interface EvacuationScenario {
  id: string;
  name: string;
  /** 津波到達までの想定時間（秒） */
  tsunamiArrivalSeconds: number;
  /** 浸水想定 GeoJSON FeatureCollection の URL または ID */
  inundationLayerId?: string;
}

export interface RouteResult {
  /** 経路の座標列（計画経路。実際の移動は actualTrajectory で記録） */
  coordinates: LatLng[];
  /** 所要時間（秒） */
  durationSeconds: number;
  /** 距離（メートル） */
  distanceMeters: number;
}

/** 訓練時の移動手段。移動手段ごとにログから速度を更新する */
export type TransportMode = 'walk' | 'wheelchair' | 'crutch' | 'other';

/** 軌跡の1点（振り返り・実距離算出に必須） */
export interface TrajectoryPoint {
  position: LatLng;
  /** 取得時刻 ISO8601 */
  timestamp: string;
}

/** 訓練の進行状態。abandoned の場合は避難ログを残さない */
export type SimulationStatus = 'running' | 'completed' | 'abandoned';

export interface SimulationState {
  scenario: EvacuationScenario;
  startPosition: LatLng;
  evacuationTarget: LatLng;
  route: RouteResult | null;
  /** 訓練開始からの経過秒（実時刻ベースで算出し、バックグラウンドでも正確に） */
  elapsedSeconds: number;
  /** 訓練の状態。completed = ゴールで終了ボタン押下、abandoned = 中断 */
  status: SimulationStatus;
  /** 避難完了したか（status === 'completed' と等価。互換用） */
  completed: boolean;
}

/**
 * ゴールで「終了」押下時の位置検証結果。無効の場合は避難ログを残さず、運動能力更新には利用可。
 * 終了ボタンはゴール至近（閾値以内）でのみ押せる仕様。閾値はデフォルト 50m、変更可能にしておく。
 */
export interface TrainingEndValidation {
  /** ゴール付近にいたか（有効なら訓練として認定しログ保存可） */
  valid: boolean;
  /** 終了時取得した実際の位置 */
  actualEndPosition?: LatLng;
  /** 無効時の理由（例: "ゴールから 100m 以上離れています"） */
  reason?: string;
}

/** ゴール有効判定の閾値（m）。デフォルト 50。設定で変更可能にすること */
export const DEFAULT_GOAL_VALIDATION_THRESHOLD_METERS = 50;

/**
 * 建築物（高さ付き）: 位置・標高・建築物高さの利活用用（浜松市 PLATEAU 等）
 * GeoJSON Feature の properties に載せる想定。Agent E がデータ取り込み、Agent A が表示・シミュレーションに利用。
 * @see docs/DATA_HAMAMATSU.md
 */
export interface BuildingFeatureProperties {
  /** 建物の高さ（m） */
  height: number;
  /** オプション: 建物ID（PLATEAU 等の識別子） */
  id?: string;
  /** オプション: 地面の標高（m）。未設定時は標高APIで補完 */
  groundElevationM?: number;
}

/**
 * 有効避難高さの候補: 制限時間内に到達可能な「最も高い場所」の候補
 * 有効避難高さ = 津波から身を守れる高さ（平地は標高、建物は 標高 + 建築物高さ）
 */
export interface EvacuationHeightCandidate {
  /** 候補地点の座標（建物の場合は屋上等の代表点） */
  position: LatLng;
  /** 有効避難高さ（m） */
  effectiveHeightM: number;
  /** 種別: 平地（地形のみ） or 建物上 */
  source: 'ground' | 'building';
  /** 建物の場合の建物高さ（m）。source === 'building' のときのみ */
  buildingHeightM?: number;
}

/**
 * 訓練時にユーザーに提示する「避難先の選択肢」1件
 * 標高・建築物の高さから算出した「高い」場所のうち、ユーザーの運動能力で制限時間内に到達可能なものを複数提示し、ユーザーが自ら1つ選ぶ。
 */
export interface EvacuationOptionForChoice {
  /** 候補地点の座標（EvacuationHeightCandidate と同様） */
  position: LatLng;
  /** 有効避難高さ（m） */
  effectiveHeightM: number;
  /** 種別: 平地 or 建物上 */
  source: 'ground' | 'building';
  /** 建物の場合の建物高さ（m） */
  buildingHeightM?: number;
  /** 現在地からこの候補までの推定所要時間（秒）。ユーザー運動能力ベース */
  estimatedDurationSeconds: number;
  /** 現在地からこの候補までの推定距離（m） */
  distanceMeters: number;
  /** 表示用ラベル（例: "A: 〇〇ビル屋上 15m"）。省略時は座標や番号で表示 */
  label?: string;
}

// --- 訓練ログ・API (Agent B が実装) ---

export interface TrainingLogCreate {
  /** 匿名ユーザーID or 認証済みユーザーID */
  userId: string;
  scenarioId: string;
  /** 計画経路（表示・振り返り用）。実際の移動は actualTrajectory で記録 */
  route: RouteResult;
  /** 訓練開始日時 ISO8601 */
  startedAt: string;
  /** 訓練終了日時 ISO8601 */
  finishedAt: string;
  /** 津波到達前に避難完了したか */
  evacuatedInTime: boolean;
  /** 行政共有の同意有無 */
  consentToShareWithGovernment: boolean;
  /** 訓練時に選択した移動手段。移動手段ごとに速度を更新する */
  transportMode: TransportMode;
  /** 実際の移動軌跡（GPS 時系列）。振り返り・実距離算出に必須 */
  actualTrajectory: TrajectoryPoint[];
  /** 軌跡から算出した実際の移動距離（m） */
  actualDistanceMeters: number;
  /** 軌跡から算出した実際の所要時間（秒） */
  actualDurationSeconds: number;
}

export interface TrainingLog extends TrainingLogCreate {
  id: string;
  createdAt: string;
}

export interface ExportOptions {
  from: string;
  to: string;
  scenarioId?: string;
  format: 'csv' | 'geojson';
}

// --- 住民UI・インセンティブ (Agent C が実装) ---

export interface UserProfile {
  id: string;
  displayName?: string;
  totalTrainings: number;
  totalDistanceMeters: number;
  badges: Badge[];
  rank: string;
  /** 累計ポイント（ゲーミフィケーション用） */
  totalPoints?: number;
  /** 週間・月間目標（任意） */
  weeklyGoalCount?: number;
  monthlyGoalCount?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
}

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

/** 行政への貢献の見える化用（回数・ご褒美まで・行政の感謝） */
export interface UserContributionSummary {
  /** ユーザーの訓練参加回数（共有同意済み分） */
  sharedTrainingCount: number;
  /** 直近の集計期間内の地域全体の参加者数（匿名） */
  regionParticipantCount?: number;
  /** メッセージ例: "あなたの○回の訓練が防災計画に活用されています" */
  message?: string;
  /** ご褒美（地域ポイント等）までの進捗。あと何回で付与されるか */
  rewardsProgress?: RewardProgress;
  /** 行政からの感謝の気持ち（例: 浜松市からのお礼メッセージ） */
  governmentThankYouMessage?: string;
}

/** ご褒美までの残り回数（地域事業者スポンサー・浜松市ローカルポイント等） */
export interface RewardProgress {
  /** 次のご褒美に必要な訓練回数（共有同意済みでカウント） */
  nextRewardAtCount: number;
  /** あと何回で次のご褒美か */
  remainingCount: number;
  /** ご褒美の説明（例: "浜松市で使えるポイント"） */
  rewardDescription?: string;
  /** 紐づくキャンペーンID（任意） */
  campaignId?: string;
}

/** アプリの表示モード。有事ボタンで切り替え、デフォルトは平時 */
export type AppMode = 'normal' | 'emergency';

/**
 * 有事時ガイド用：過去ログから算出した「その人に合った」避難能力サマリ
 * Agent A（地図・ガイド）が表示に利用。Agent B がログから算出可能。
 */
export interface EmergencyGuideProfile {
  /** 平均歩行速度 m/s（過去の訓練ログから算出） */
  averageSpeedMps: number;
  /** よく使う避難所または経路の識別子（scenarioId や target の ID） */
  preferredEvacuationTargetId?: string;
  /** その経路の典型所要時間（秒） */
  typicalDurationSeconds?: number;
  /** 最後に訓練した日時 ISO8601 */
  lastTrainedAt?: string;
}

// --- 行政ダッシュボード (Agent D が実装) ---

export interface AggregatedStats {
  period: { from: string; to: string };
  totalTrainings: number;
  uniqueUsers: number;
  averageDurationSeconds: number;
  evacuationSuccessRate: number;
}

export type ExportFormat = 'csv' | 'geojson';

/** 生活拠点: 訓練ログの経路起点から集計した匿名ユーザーごとの代表位置 */
export interface LifeBasePoint {
  /** 匿名ユーザーID（行政向けはハッシュ化推奨） */
  userId: string;
  /** 代表座標（直近または最頻の経路起点） */
  position: LatLng;
  /** 訓練回数（この拠点で記録された回数） */
  trainingCount: number;
  /** 最後に記録された日時 ISO8601 */
  lastRecordedAt: string;
}

/** 個人の運動能力: 訓練ログから算出した歩行速度等（匿名） */
export interface UserMobilityProfile {
  userId: string;
  /** 平均歩行速度 m/s */
  averageSpeedMps: number;
  /** 平均所要時間（秒）※避難所までの典型値 */
  averageDurationSeconds: number;
  /** 訓練回数 */
  trainingCount: number;
}

/** 移動手段ごとの運動能力。訓練時に選択した移動手段ごとにログで更新 */
export interface MobilityProfilePerMode {
  transportMode: TransportMode;
  /** 平均移動速度 m/s */
  averageSpeedMps: number;
  /** 訓練回数（この手段での） */
  trainingCount: number;
  /** 最後に更新した日時 ISO8601 */
  lastUpdatedAt?: string;
}

/**
 * 初期移動能力の算出に使う個人設定（年齢・ADL）。
 * 厚生労働省のデータを参照して予測移動能力を初期値とし、以降は本人ログで更新。
 * Agent C が設定画面で収集、Agent B が算出・保存に利用。
 */
export interface InitialMobilityInput {
  /** 年齢（歳）。任意 */
  age?: number;
  /** ADL（日常生活動作）のレベル。任意。厚生労働省等の区分に合わせて定義 */
  adlLevel?: 'independent' | 'assistive' | 'wheelchair' | 'bedridden' | 'other';
}

/** 避難施設シミュレーションの入力: 「ここに避難塔を作った場合」 */
export interface EvacuationFacilitySimulationInput {
  /** 候補施設の座標 */
  location: LatLng;
  /** 想定シナリオID（津波到達時間等に利用） */
  scenarioId: string;
  /** 津波到達までの秒数（シナリオから取得するか上書き） */
  tsunamiArrivalSeconds?: number;
  /** 集計に使う訓練ログの期間 */
  period?: { from: string; to: string };
}

/** 避難施設シミュレーションの結果: 想定避難人数・キャパシティ・費用 */
export interface EvacuationFacilitySimulationResult {
  /** この施設に間に合うと予測される人数（生活拠点・運動能力から算出） */
  expectedEvacuees: number;
  /** 推奨キャパシティ（余裕を見た人数。例: expectedEvacuees * 1.2） */
  suggestedCapacity: number;
  /** 1人あたりの費用仮説（円）※行政が入力する単価で計算 */
  costPerPerson?: number;
  /** 推奨キャパシティに基づく概算費用（円） */
  estimatedTotalCost?: number;
  /** シミュレーションに使用したユーザー数（生活拠点が有効な人数） */
  sampleSize: number;
}

// --- 訓練インセンティブ・行政による科学的デザイン (Agent D が実装) ---

/** 地域ターゲット: 緯度経度の範囲（生活拠点がこの範囲内のユーザーに適用） */
export interface RegionTarget {
  /** 北端の緯度 */
  north: number;
  /** 南端の緯度 */
  south: number;
  /** 東端の経度 */
  east: number;
  /** 西端の経度 */
  west: number;
}

/** 年齢層ターゲット（オプション。ユーザーが年齢を登録している場合にマッチ） */
export interface AgeRangeTarget {
  minAge?: number;
  maxAge?: number;
}

/** 性別ターゲット（オプション。'any' または未設定で全員） */
export type GenderTarget = 'any' | 'male' | 'female';

/**
 * ユーザーが最初に入力する「移動の障害の有無」＝主な移動能力。
 * 自力で歩ける／走れる／自転車／車／杖／車椅子／寝たきり
 */
export type MobilityCapability =
  | 'walk'      // 自力で歩ける
  | 'run'      // 走れる
  | 'bicycle'  // 自転車乗れる
  | 'car'      // 車運転できる
  | 'cane'     // 杖
  | 'wheelchair' // 車椅子
  | 'bedridden';  // 寝たきり

/** 住民が最初に入力する属性（年齢・性別・移動能力）。インセンティブの対象判定と行政集計に利用 */
export interface UserDemographics {
  userId: string;
  /** 年齢（歳） */
  age?: number;
  /** 性別 */
  gender?: 'male' | 'female' | 'other';
  /** 主な移動能力（障害の有無） */
  mobilityCapability?: MobilityCapability;
  /** 最終更新日時 ISO8601 */
  updatedAt: string;
}

/** 報酬の種類 */
export type IncentiveRewardType = 'voucher' | 'points' | 'other';

/** インセンティブ報酬: 振興券・ポイント等 */
export interface IncentiveReward {
  type: IncentiveRewardType;
  /** 振興券などの名称（例: "浜松市防災訓練振興券"） */
  name?: string;
  /** 説明文（地域で使える条件など） */
  description?: string;
  /** 金額（円）。voucher の場合の額面 */
  amountYen?: number;
  /** ポイント数（type === 'points' の場合） */
  points?: number;
}

/** 付与条件: 何を達成すると付与するか */
export interface IncentiveCondition {
  /** 訓練回数がこの値以上で付与（例: 1 = 1回完了で付与） */
  minTrainingCount?: number;
  /** 特定シナリオでの完了が必要な場合のシナリオID */
  scenarioId?: string;
}

/** キャンペーンのターゲット条件（地域・年齢・性別・移動能力・時間） */
export interface IncentiveCampaignTargeting {
  /** 地域（範囲を指定しない場合は全地域） */
  region?: RegionTarget;
  /** 年齢層（未設定は全年代） */
  ageRange?: AgeRangeTarget;
  /** 性別（'any' または未設定は全員） */
  gender?: GenderTarget;
  /** 対象とする移動能力（未設定は全員。指定時はいずれかに該当するユーザーが対象） */
  mobilityTypes?: MobilityCapability[];
  /** キャンペーン有効期間 開始 ISO8601 */
  validFrom: string;
  /** キャンペーン有効期間 終了 ISO8601 */
  validTo: string;
}

/** 予算制限: 当選確率と付与上限で振興券発行数をコントロール */
export interface IncentiveBudgetLimits {
  /** 当選確率 0～1（例: 0.3 = 条件を満たすユーザーの30%に付与） */
  selectionRate: number;
  /** 付与数の上限（未設定は上限なし。予算で cap する場合に指定） */
  maxRecipients?: number;
}

export interface IncentiveCampaignCreate {
  /** キャンペーン名（行政・住民に表示） */
  name: string;
  /** 説明（住民向けメッセージ） */
  description?: string;
  targeting: IncentiveCampaignTargeting;
  /** 報酬内容（振興券など） */
  reward: IncentiveReward;
  /** 付与条件（何回訓練で付与するか等） */
  condition: IncentiveCondition;
  /** 予算制限（当選確率・付与上限）。未設定時は条件を満たす全員に付与 */
  budgetLimits?: IncentiveBudgetLimits;
}

export interface IncentiveCampaign extends IncentiveCampaignCreate {
  id: string;
  createdAt: string;
  updatedAt: string;
}
