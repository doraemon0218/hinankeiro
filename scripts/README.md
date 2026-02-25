# データ取り込み・ビルドスクリプト（Agent E）

浜松市を中心に、静岡県内の**位置情報・標高・建築物の高さ**データを取得し、`data/` に配置する手順とスクリプト。

## 前提

- **docs/DATA_HAMAMATSU.md** でデータソースと役割を確認すること。
- 建築物は **Project PLATEAU 浜松市**、標高は **国土地理院 API** を利用。

---

## 1. 標高の取得（国土地理院 API）

指定した緯度・経度の標高を取得するサンプル:

```bash
node scripts/fetch-elevation.js 34.7106 137.7262
```

- API: `https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php`
- 過度なリクエストは避ける。バッチで必要な点だけ取得する想定。

---

## 2. 建築物データ（PLATEAU 浜松市）

1. **ダウンロード**
   - [G空間情報センター - 3D都市モデル（Project PLATEAU）浜松市（2023年度）](https://www.geospatial.jp/ckan/dataset/plateau-22130-hamamatsu-shi-2023) にアクセス。
   - 建築物モデル（CityGML または 3D Tiles / MVT）をダウンロード。範囲が大きいため、必要な区域（浜松市中心部など）のタイルのみ選んで取得するとよい。

2. **変換（GeoJSON + 高さ）**
   - CityGML を GeoJSON に変換し、各建物ポリゴンに `height`（m）を持つ `properties` を付与する。
   - ツール例: [plateau-gml-tools](https://github.com/Project-PLATEAU/plateau-gml-tools) 等で CityGML → 他形式の変換が可能。必要に応じて Node/Python スクリプトで GeoJSON を生成し、`data/hamamatsu/buildings.geojson` に出力する。
   - 出力形式は `shared/types.ts` の `BuildingFeatureProperties` に合わせる（`height` 必須、`id`, `groundElevationM` は任意）。

3. **簡易フロー**
   - PLATEAU の MVT や 3D Tiles をそのまま配信する方法も検討可。その場合はアプリ側でタイル URL を参照する。

---

## 3. 津波浸水想定・避難所

- 内閣府・静岡県の津波浸水想定区域を Shape または GeoJSON で取得し、`data/hamamatsu/inundation.geojson` に配置。
- 避難所は自治体オープンデータから取得し、`data/hamamatsu/shelters.geojson` に配置。
- 取得元 URL と利用条件は `data/README.md` に記載する。

---

## スクリプト一覧

| ファイル | 説明 |
|----------|------|
| `fetch-elevation.js` | 国土地理院標高 API のサンプル呼び出し（1 点）。 |
| `README.md` | 本ファイル。取り込み手順。 |

PLATEAU → GeoJSON 変換スクリプトは、利用するツール・形式に応じて追加する。
