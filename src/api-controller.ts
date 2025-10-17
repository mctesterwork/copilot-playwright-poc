import {APIRequestContext} from '@playwright/test';
import {fetch} from './fetch';
import type {AlertCollection} from './gen/api-types';
import type {SigmetCollectionGeoJson, SigmetQueryQueryParams} from './gen/api-types';

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
	const qs = entries
		.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
		.join('&');
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

