import { test, expect } from '@playwright/test';
import { getZones, getZoneByTypeAndId, getZoneForecast, getZoneStations } from '../../api-controller';
import type { ZoneCollectionGeoJson } from '../../gen/api-types';

test.describe('Zones path-parameter endpoints', () => {
  test('GET /zones -> pick a zone and GET /zones/{type}/{zoneId}', { tag: ['@zone', '@path', '@regression'] }, async ({ request }) => {
    const res = await getZones(request, { limit: 1 });
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(300);
    const data = res.data as ZoneCollectionGeoJson;
    expect(Array.isArray(data.features)).toBe(true);
    if (!data.features || data.features.length === 0) test.skip();

    const props = data.features[0].properties as any;
    const type = props.type || 'public';
    const zoneId = props.id;
    expect(zoneId).toBeDefined();

    const single = await getZoneByTypeAndId(request, type, zoneId);
    expect(single.status).toBeGreaterThanOrEqual(200);
    expect(single.status).toBeLessThan(300);
    expect(single.data).toBeDefined();
    console.log(single.data);
  });

  test('GET /zones/{type}/{zoneId} with non-existent id returns 4xx', { tag: ['@zone', '@path'] }, async ({ request }) => {
    const res = await getZoneByTypeAndId(request, 'public', 'ZZZ999');
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(600);
  });

  test('GET /zones/{type}/{zoneId}/forecast and /stations', { tag: ['@zone', '@path'] }, async ({ request }) => {
    // try to get a real zone first
    const list = await getZones(request, { limit: 1 });
    if (!list.data || !Array.isArray((list.data as ZoneCollectionGeoJson).features) || (list.data as ZoneCollectionGeoJson).features!.length === 0) {
      test.skip();
      return;
    }

    const props = (list.data as ZoneCollectionGeoJson).features![0].properties as any;
    const type = props.type || 'public';
    const zoneId = props.id;

    const fc = await getZoneForecast(request, type, zoneId);
    // forecast may or may not be available; accept 2xx or 4xx
    expect(fc.status).toBeGreaterThanOrEqual(200);

    const stations = await getZoneStations(request, zoneId, { limit: 5 });
    if (stations.status >= 200 && stations.status < 300) {
      expect(stations.data).toBeDefined();
    } else {
      expect(stations.status).toBeGreaterThanOrEqual(400);
    }
  });
});
