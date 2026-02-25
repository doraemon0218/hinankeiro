#!/usr/bin/env node
/**
 * 国土地理院 標高API のサンプル呼び出し（1点取得）
 * 用法: node scripts/fetch-elevation.js <緯度> <経度>
 * 例:   node scripts/fetch-elevation.js 34.7106 137.7262
 *
 * 利用規約・過度なアクセス禁止に従うこと。
 * @see https://maps.gsi.go.jp/development/elevation_s.html
 */

const lat = process.argv[2];
const lng = process.argv[3];

if (lat == null || lng == null) {
  console.error('用法: node scripts/fetch-elevation.js <緯度> <経度>');
  process.exit(1);
}

const url = new URL('https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php');
url.searchParams.set('lat', lat);
url.searchParams.set('lon', lng);
url.searchParams.set('outtype', 'JSON');

async function main() {
  const res = await fetch(url.toString());
  const json = await res.json();
  const elev = json.elevation;
  const hsrc = json.hsrc || '';
  if (elev === '-----' || elev == null) {
    console.error('標高を取得できませんでした:', json);
    process.exit(1);
  }
  console.log(`緯度 ${lat}, 経度 ${lng} => 標高 ${elev} m (${hsrc})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
