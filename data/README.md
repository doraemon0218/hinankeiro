# ひなんけいろ - 静的データ配置

地図・シミュレーション用の GeoJSON 等を配置するディレクトリ。**Agent E** がデータ取り込みスクリプトで生成・更新する。

## ディレクトリ構成（案）

```
data/
├── hamamatsu/              # 浜松市向け
│   ├── buildings.geojson   # 建築物ポリゴン + height（PLATEAU から変換）
│   ├── inundation.geojson # 津波浸水想定（必要に応じて）
│   └── shelters.geojson   # 避難所（必要に応じて）
└── README.md              # 本ファイル
```

- **buildings.geojson**: 各 Feature の `properties` に `shared/types.ts` の `BuildingFeatureProperties`（`height` 必須）に準拠した属性を持たせる。
- 標高は国土地理院 API で取得するため、ここには大きな静的ファイルを置かない想定（必要なら `elevation/` を追加可）。

## データの出典・利用条件

| データ | 出典 | 利用条件 |
|--------|------|----------|
| 建築物（高さ） | Project PLATEAU 浜松市（2023年度） | 商用含め無償。利用規約・クレジット表記に従う。 |
| 標高 | 国土地理院 標高API・標高タイル | 国土地理院の利用規約に従う。過度なアクセス禁止。 |
| 津波浸水想定・避難所 | 内閣府・静岡県・浜松市オープンデータ | 各ポータルの利用条件に従う。 |

詳細は **docs/DATA_HAMAMATSU.md** を参照。

## 更新手順

`scripts/README.md` の手順に従い、必要に応じて `scripts/` 内のスクリプトを実行する。
