/**
 * 訓練ログ エクスポート API（行政向け・Agent B）
 * GET ?from=...&to=...&scenarioId=...&format=csv|geojson
 * 同意済みログのみ匿名で返す。
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ExportOptions } from '@/shared/types';
import { getTrainingLogsForExport, trainingLogsToCsv, trainingLogsToGeoJSON } from '@/lib/logs/training-logs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const format = searchParams.get('format') === 'geojson' ? 'geojson' : 'csv';
    if (!from || !to) {
      return NextResponse.json(
        { error: 'Query required: from, to (ISO8601). Optional: scenarioId, format (csv|geojson)' },
        { status: 400 }
      );
    }
    const opts: ExportOptions = {
      from,
      to,
      scenarioId: searchParams.get('scenarioId') ?? undefined,
      format,
    };
    const logs = await getTrainingLogsForExport(opts);
    if (format === 'geojson') {
      const body = trainingLogsToGeoJSON(logs);
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'application/geo+json; charset=utf-8',
          'Content-Disposition': `attachment; filename="training-logs-${from}-${to}.geojson"`,
        },
      });
    }
    const body = trainingLogsToCsv(logs);
    return new NextResponse(body, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="training-logs-${from}-${to}.csv"`,
      },
    });
  } catch (e) {
    console.error('GET /api/training-logs/export', e);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
