import {APIRequestContext} from '@playwright/test';
import {fetch} from './fetch';
import type {AlertCollection, Zone} from './gen/api-types';
import type {SigmetCollectionGeoJson, SigmetQueryQueryParams, ZoneListQueryParams, ZoneCollectionGeoJson} from './gen/api-types';

type AlertsQuery = {
  [key: string]: string | number | boolean | undefined;
};

/**
 * Build a query string from an object of params.
 */
function buildQuery(params?: AlertsQuery): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const qs = entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
  return `?${qs}`;
}

/**
 * GET /alerts
 * Uses the project's fetch wrapper to call the API under test.
 * Returns the typed response data (AlertCollection) along with status and headers.
 */
export async function getAlerts(
  request: APIRequestContext,
  params?: AlertsQuery,
): Promise<{
  data?: AlertCollection;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/alerts${buildQuery(params)}`;

  const res = await fetch<AlertCollection>(request, {
    url,
    method: 'get',
  });

  return res;
}

export default {getAlerts};

/**
 * GET /aviation/sigmets
 */
export async function getSigmets(
  request: APIRequestContext,
  params?: SigmetQueryQueryParams,
): Promise<{
  data?: SigmetCollectionGeoJson;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/aviation/sigmets${buildQuery(params as any)}`;

  const res = await fetch<SigmetCollectionGeoJson>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /alerts/{id}
 */
export async function getAlertById(
  request: APIRequestContext,
  id: string,
): Promise<{
  data?: any;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/alerts/${encodeURIComponent(id)}`;

  const res = await fetch<any>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /aviation/sigmets/{atsu}
 */
export async function getSigmetsByATSU(
  request: APIRequestContext,
  atsu: string,
): Promise<{
  data?: SigmetCollectionGeoJson;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/aviation/sigmets/${encodeURIComponent(atsu)}`;

  const res = await fetch<SigmetCollectionGeoJson>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /aviation/sigmets/{atsu}/{date}
 */
export async function getSigmetsByATSUByDate(
  request: APIRequestContext,
  atsu: string,
  date: string,
): Promise<{
  data?: SigmetCollectionGeoJson;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/aviation/sigmets/${encodeURIComponent(atsu)}/${encodeURIComponent(date)}`;

  const res = await fetch<SigmetCollectionGeoJson>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /aviation/sigmets/{atsu}/{date}/{time}
 */
export async function getSigmet(
  request: APIRequestContext,
  atsu: string,
  date: string,
  time: string,
): Promise<{
  data?: any;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/aviation/sigmets/${encodeURIComponent(atsu)}/${encodeURIComponent(date)}/${encodeURIComponent(time)}`;

  const res = await fetch<any>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /zones
 */
export async function getZones(
  request: APIRequestContext,
  params?: ZoneListQueryParams,
): Promise<{
  data?: ZoneCollectionGeoJson;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const qs = buildQuery(params as any);
  const url = `/zones${qs}`;

  const res = await fetch<ZoneCollectionGeoJson>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /zones/{type}/{zoneId}
 */
export async function getZoneByTypeAndId(
  request: APIRequestContext,
  type: string,
  zoneId: string,
  params?: {effective?: string},
): Promise<{
  data?: Zone;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const qs = buildQuery(params as any);
  const url = `/zones/${encodeURIComponent(type)}/${encodeURIComponent(zoneId)}${qs}`;

  const res = await fetch<any>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /zones/{type}/{zoneId}/forecast
 */
export async function getZoneForecast(
  request: APIRequestContext,
  type: string,
  zoneId: string,
): Promise<{
  data?: any;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const url = `/zones/${encodeURIComponent(type)}/${encodeURIComponent(zoneId)}/forecast`;

  const res = await fetch<any>(request, {
    url,
    method: 'get',
  });

  return res;
}

/**
 * GET /zones/{type}/{zoneId}/stations
 */
export async function getZoneStations(
  request: APIRequestContext,
  zoneId: string,
  params?: {limit?: number},
): Promise<{
  data?: any;
  status: number;
  statusText: string;
  headers: {[key: string]: string};
}> {
  const qs = buildQuery(params as any);
  const url = `/zones/forecast/${encodeURIComponent(zoneId)}/stations${qs}`;

  const res = await fetch<any>(request, {
    url,
    method: 'get',
  });

  return res;
}