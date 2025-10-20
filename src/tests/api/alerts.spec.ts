import {test, expect, request as playwrightRequest} from '@playwright/test';
import {getAlerts} from '../../api-controller';
import type {AlertCollectionJsonLd, Alert} from '../../gen/api-types';

test.describe('Alerts API', () => {
  test('GET /alerts returns 200 and a collection', {tag: ['@alerts', '@smoke', '@regression']}, async ({request}) => {

    const res = await getAlerts(request);

  expect(res.status).toBe(200);

  // Basic shape assertions
  expect(res.data).toBeDefined();
  const data = res.data as AlertCollectionJsonLd;

  // title is a non-empty string (guard because title is optional in the type)
  expect(typeof data.title).toBe('string');
  if (data.title) expect(data.title.length).toBeGreaterThan(0);

  // This endpoint returned JSON-LD: check @graph (array of alerts)
  expect(Array.isArray(data['@graph'])).toBe(true);
  expect(data['@graph'] && data['@graph'].length).toBeGreaterThan(0);

  const first = (data['@graph'] && data['@graph'][0]) as Alert | undefined;
  expect(first).toBeDefined();
  // core alert fields on the alert object
  if (first) {
    expect(typeof first.id).toBe('string');
    expect(typeof first.event).toBe('string');
    expect(typeof first.areaDesc).toBe('string');
    expect(typeof first.sent).toBe('string');
    if (typeof first.sent === 'string') {
      expect(Boolean(Date.parse(first.sent))).toBe(true);
    }
  }

  // pagination.next should be an https url that contains 'alerts'
    expect(data.pagination).toBeDefined();
    if (data.pagination && data.pagination.next) {
      expect(typeof data.pagination.next).toBe('string');
      expect(data.pagination.next.startsWith('http')).toBe(true);
      expect(data.pagination.next.includes('alerts')).toBe(true);
    }
  });
});
