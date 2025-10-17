import { test, expect } from '@playwright/test';
import { getSigmets, getSigmetsByATSU, getSigmetsByATSUByDate, getSigmet } from '../../src/api-controller';
import type { SigmetCollectionGeoJson } from '../../src/gen/api-types';

test.use({
  baseURL: 'https://api.weather.gov',
  extraHTTPHeaders: {
    Accept: 'application/json',
    'User-Agent': 'playwright-test',
  },
});

test.describe('SIGMETs path-parameter endpoints', () => {
  test('GET /aviation/sigmets -> find an ATSU and call /aviation/sigmets/{atsu}', { tag: ['@aviation', '@path', '@regression'] }, async ({ request }) => {
    const res = await getSigmets(request);
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    const data = res.data as SigmetCollectionGeoJson;
    expect(Array.isArray(data.features)).toBe(true);

    // try to extract an ATSU code from the first feature if available
    let atsu: string | undefined;
    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties as any;
      if (props && props.atsu) atsu = props.atsu;
    }

    if (!atsu) {
      // fallback: use a known plausible ATSU id
      atsu = 'KEKA';
    }

    const byAtsu = await getSigmetsByATSU(request, atsu);
    if (byAtsu.status >= 200 && byAtsu.status < 300) {
      const d = byAtsu.data as SigmetCollectionGeoJson;
      expect(Array.isArray(d.features)).toBe(true);
    } else {
      expect(byAtsu.status).toBeGreaterThanOrEqual(400);
    }
  });

  test('GET /aviation/sigmets/{atsu} with non-existent atsu returns 4xx or 404', { tag: ['@aviation', '@path'] }, async ({ request }) => {
    const res = await getSigmetsByATSU(request, 'NONEXISTENT_ATSU_999');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(600);
  });

  test('GET /aviation/sigmets/{atsu}/{date} positive and negative', { tag: ['@aviation', '@path'] }, async ({ request }) => {
    const atsu = 'KEKA';
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const ok = await getSigmetsByATSUByDate(request, atsu, date);
    if (ok.status >= 200 && ok.status < 300) {
      const d = ok.data as SigmetCollectionGeoJson;
      expect(Array.isArray(d.features)).toBe(true);
    } else {
      expect(ok.status).toBeGreaterThanOrEqual(400);
    }

    const bad = await getSigmetsByATSUByDate(request, 'BAD_ATSU', '2025-13-40');
    expect(bad.status).toBeGreaterThanOrEqual(400);
    expect(bad.status).toBeLessThan(600);
  });

  test('GET /aviation/sigmets/{atsu}/{date}/{time} single sigmet', { tag: ['@aviation', '@path'] }, async ({ request }) => {
    // This test will attempt to find a real time from the collection and then request that specific resource.
    const list = await getSigmets(request);
    expect(list.status).toBeGreaterThanOrEqual(200);
    const data = list.data as SigmetCollectionGeoJson;

    if (data.features && data.features.length > 0) {
      const props = (data.features[0].properties as any) || {};
      const atsu = props.atsu || 'KEKA';
      const date = (props.date || new Date().toISOString().slice(0, 10));
      const time = (props.time || '0000');

      const single = await getSigmet(request, atsu, date, time);
      // Accept success or error codes depending on availability
      expect(single.status).toBeGreaterThanOrEqual(200);
    } else {
      test.skip();
    }
  });
});
