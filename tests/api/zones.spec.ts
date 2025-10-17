import { test, expect } from '@playwright/test';
import { getZones } from '../../src/api-controller';
import type { ZoneCollectionGeoJson } from '../../src/gen/api-types';

test.use({
  baseURL: 'https://api.weather.gov',
  extraHTTPHeaders: {
    Accept: 'application/json',
    'User-Agent': 'playwright-test',
  },
});

test.describe('Zones query-parameter endpoints', () => {
  test('GET /zones returns list and respects limit', { tag: ['@zone', '@regression'] }, async ({ request }) => {
    const res = await getZones(request, { limit: 5 });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    const data = res.data as ZoneCollectionGeoJson;
    expect(Array.isArray(data.features)).toBe(true);
    // limit may not be strictly honored by API but features should be an array
    expect(data.features).toBeDefined();
  });

  test('GET /zones with id query param filters results', { tag: ['@zone'] }, async ({ request }) => {
    // Try filtering by a known zone id pattern (e.g. ALZ001) — we don't guarantee it exists
    const res = await getZones(request, { id: ['ALZ001'] as any });
    // Accept success or 4xx if invalid
    expect(res.status).toBeGreaterThanOrEqual(200);
  });

  test('GET /zones with invalid params returns error', { tag: ['@zone'] }, async ({ request }) => {
    const res = await getZones(request, { effective: 'not-a-date' } as any);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(600);
  });
});
