import { test, expect, request as playwrightRequest } from '@playwright/test';
import { getSigmets } from '../../src/api-controller';
import type { SigmetCollectionGeoJson } from '../../src/gen/api-types';

test.use({
    baseURL: 'https://api.weather.gov',
    extraHTTPHeaders: {
        Accept: 'application/json',
        'User-Agent': 'playwright-test',
    },
});

test.describe('Aviation SIGMETs API', () => {
    test(
        'GET /aviation/sigmets returns 200 and geojson',
        { tag: ['@aviation', '@smoke', '@regression'] },
        async ({ request }) => {
            const res = await getSigmets(request);

            expect(res.status).toBeGreaterThanOrEqual(200);
            expect(res.status).toBeLessThan(300);

            expect(res.data).toBeDefined();
            const data = res.data as SigmetCollectionGeoJson;

            // GeoJSON feature collection should have features array
            expect(Array.isArray(data.features)).toBe(true);
            if (data.features && data.features.length > 0) {
                const first = data.features[0];
                expect(first).toBeDefined();
                expect(first.properties).toBeDefined();
                // properties should include at least an id and sequence
                expect(typeof first.properties!.id).toBe('string');
                expect(typeof first.properties!.sequence).toBe('string');
            }
        },
    );

    test(
        'GET /aviation/sigmets with sequence query returns collection or empty set',
        { tag: ['@aviation', '@smoke', '@regression'] },
        async ({ request }) => {
            // Use an unlikely sequence value; API may return 200 with empty features or 4xx
            const params = { sequence: '999999999999' };
            const res = await getSigmets(request, params as any);

            // Accept either success with empty features, or an error status
            if (res.status >= 200 && res.status < 300) {
                const data = res.data as SigmetCollectionGeoJson;
                expect(Array.isArray(data.features)).toBe(true);
                // either zero results or more; ensure it's an array
                expect(data.features).toBeDefined();
            } else {
                expect(res.status).toBeGreaterThanOrEqual(400);
            }
        },
    );

    test(
        'GET /aviation/sigmets with invalid sequence returns error',
        { tag: ['@aviation', '@regression'] },
        async ({ request }) => {
            // invalid sequence format should produce 4xx
            const params = { sequence: '!invalid-seq' };
            const res = await getSigmets(request, params as any);

            // Expect an error status (client or server) for invalid parameter
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.status).toBeLessThan(600);
        },
    );
});

test(
    'GET /aviation/sigmets with valid start param',
    { tag: ['@aviation', '@sigmets', '@regression'] },
    async ({ request }) => {
        // valid ISO datetime for start
        const params = { start: '2025-10-01T00:00:00Z' };
        const res = await getSigmets(request, params as any);

        if (res.status >= 200 && res.status < 300) {
            const data = res.data as SigmetCollectionGeoJson;
            expect(Array.isArray(data.features)).toBe(true);
        } else {
            // allow error responses from the API
            expect(res.status).toBeGreaterThanOrEqual(400);
        }
    },
);

test(
    'GET /aviation/sigmets with invalid start param',
    { tag: ['@aviation', '@sigmets'] },
    async ({ request }) => {
        const params = { start: 'not-a-date' };
        const res = await getSigmets(request, params as any);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(600);
    },
);

test(
    'GET /aviation/sigmets with valid end param',
    { tag: ['@aviation', '@sigmets', '@regression'] },
    async ({ request }) => {
        const params = { end: '2025-10-18T00:00:00Z' };
        const res = await getSigmets(request, params as any);
        if (res.status >= 200 && res.status < 300) {
            const data = res.data as SigmetCollectionGeoJson;
            expect(Array.isArray(data.features)).toBe(true);
        } else {
            expect(res.status).toBeGreaterThanOrEqual(400);
        }
    },
);

test(
    'GET /aviation/sigmets with invalid end param',
    { tag: ['@aviation', '@sigmets'] },
    async ({ request }) => {
        const params = { end: 'invalid-end' };
        const res = await getSigmets(request, params as any);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(600);
    },
);

test(
    'GET /aviation/sigmets with valid date param',
    { tag: ['@aviation', '@sigmets', '@regression'] },
    async ({ request }) => {
        const params = { date: '2025-10-17' };
        const res = await getSigmets(request, params as any);
        if (res.status >= 200 && res.status < 300) {
            const data = res.data as SigmetCollectionGeoJson;
            expect(Array.isArray(data.features)).toBe(true);
        } else {
            expect(res.status).toBeGreaterThanOrEqual(400);
        }
    },
);

test(
    'GET /aviation/sigmets with invalid date param',
    { tag: ['@aviation', '@sigmets'] },
    async ({ request }) => {
        const params = { date: '32-13-2025' };
        const res = await getSigmets(request, params as any);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(600);
    },
);

test(
    'GET /aviation/sigmets with valid atsu param',
    { tag: ['@aviation', '@sigmets', '@regression'] },
    async ({ request }) => {
        // Use a typical center code as a plausible ATSU value; API may return 200
        const params = { atsu: 'KEKA' };
        const res = await getSigmets(request, params as any);
        if (res.status >= 200 && res.status < 300) {
            const data = res.data as SigmetCollectionGeoJson;
            expect(Array.isArray(data.features)).toBe(true);
        } else {
            expect(res.status).toBeGreaterThanOrEqual(400);
        }
    },
);

test(
    'GET /aviation/sigmets with invalid atsu param',
    { tag: ['@aviation', '@sigmets'] },
    async ({ request }) => {
        const params = { atsu: '!@#' };
        const res = await getSigmets(request, params as any);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(600);
    },
);
