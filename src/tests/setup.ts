import { request } from '@playwright/test';

async function globalSetup() {
  // Minimal placeholder global setup used by Playwright until the interactive
  // setup wizard creates a fully configured setup.ts with auth and env handling.

  const apiBaseUrl = process.env.API_BASE_URL || process.env.npm_config_api_base_url;
  if (!apiBaseUrl) {
    console.warn('No API_BASE_URL provided; skipping API health check in globalSetup.');
    return;
  }

  // create and dispose a lightweight request context to verify connectivity
  const ctx = await request.newContext({ baseURL: apiBaseUrl });
  try {
    const res = await ctx.get('/');
    console.log(`GlobalSetup: ${apiBaseUrl} responded ${res.status()}`);
  } catch (err) {
    console.warn('GlobalSetup: health check failed:', err instanceof Error ? err.message : String(err));
  } finally {
    await ctx.dispose();
  }
}

export default globalSetup;
