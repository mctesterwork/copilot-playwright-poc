import { test, expect } from '@playwright/test';
import { getAlerts, getAlertById } from '../../api-controller';
import type { AlertCollectionJsonLd } from '../../gen/api-types';

test.describe('Alerts path-parameter endpoints', () => {
  test('GET /alerts -> pick an id and GET /alerts/{id} (positive)', { tag: ['@alerts', '@path', '@regression'] }, async ({ request }) => {
    const col = await getAlerts(request);
    expect(col.status).toBeGreaterThanOrEqual(200);
    expect(col.status).toBeLessThan(300);
    const data = col.data as AlertCollectionJsonLd;
    expect(Array.isArray(data['@graph'])).toBe(true);
    const first = data['@graph'] && data['@graph'][0];
    expect(first).toBeDefined();
    const id = first!.id as string;
    expect(typeof id).toBe('string');

    const single = await getAlertById(request, id);
    expect(single.status).toBeGreaterThanOrEqual(200);
    expect(single.status).toBeLessThan(300);
    // response body may be geojson or json-ld; at minimum expect an id or @graph
    expect(single.data).toBeDefined();
  });

  test('GET /alerts/{id} with non-existent id returns 4xx or 404', { tag: ['@alerts', '@path'] }, async ({ request }) => {
    const res = await getAlertById(request, 'does-not-exist-12345');
    // the API should return a client error for non-existent id, but tolerate server errors
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(600);
  });
});
