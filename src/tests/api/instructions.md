## API tests — patterns and conventions (short summary)

This file contains a short, actionable summary for adding API tests in this repository. Follow these conventions to keep tests consistent, robust and CI-friendly.

1. Location and naming
- Place API tests under `tests/api/`.
- Name files `<resource>.spec.ts`, optionally adding suffixes like `-path`, `-query`, or `-smoke` to indicate focus (e.g. `alerts-path.spec.ts`).

2. Playwright setup
- Use Playwright config file to setup the baseURL and other settings used by all your tests. If environment variables are provided for base url and authorization, those can be read using dotenv at the start of the file. Example:

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
export default defineConfig({
projects:{
	{
      name: 'api-tests',
      // Change the baseURL to the API under test
      use: { baseURL: process.env.BASE_URL || 'localhost:1433', extraHTTPHeaders: { 'Accept': 'application/ld+json' } },
    },
}
})
	
3. Use shared API layer
- Call functions in `src/api-controller` (e.g. `getAlerts`, `getSigmets`). Do not reimplement HTTP logic in tests.
- Use types from `src/gen/api-types` for response casting and clearer assertions.

4. Assertions and tolerance
- For success: assert status in [200, 300) using `expect(res.status).toBeGreaterThanOrEqual(200)` and `expect(res.status).toBeLessThan(300)`.
- For endpoints that may return success or client/server errors depending on input or data, use conditional assertions (accept 200–299 or assert >=400).
- Prefer shape checks (arrays, required fields) over exact numeric counts.

5. Tags and filtering
- Add `tag` metadata to tests to enable selective runs. Common tags: `@smoke`, `@regression`, `@path`, `@query`, resource tags like `@alerts`, `@sigmets`.

6. Params and types
- Pass query parameters as simple objects; prefer strings for params unless helpers document otherwise. Use helpers for serialization when needed.

7. Robustness
- Avoid relying on external mutable data. If tests create resources, ensure cleanup or use dedicated test/staging environments.
- Avoid arbitrary sleeps; prefer deterministic checks.

8. Helpers
- Use utilities under `tests/helpers` for common tasks (param serialization, safe request wrapper that parses json safely). Tests should import these helpers when necessary.

9. Documentation
- Document any preconditions in comments. Keep this file updated when adding new helpers or conventions.

10. Example template

Example test header and template:

```ts
import { test, expect } from '@playwright/test';
import { getAlerts } from '../../src/api-controller';
import type { AlertCollectionJsonLd } from '../../src/gen/api-types';

test.use({ baseURL: 'https://api.weather.gov', extraHTTPHeaders: { Accept: 'application/json', 'User-Agent': 'playwright-test' } });

test.describe('Alerts API', () => {
	test('GET /alerts returns 200 and collection', { tag: ['@alerts', '@smoke', '@regression'] }, async ({ request }) => {
		const res = await getAlerts(request);
		expect(res.status).toBeGreaterThanOrEqual(200);
		expect(res.status).toBeLessThan(300);
		expect(res.data).toBeDefined();
		const data = res.data as AlertCollectionJsonLd;
		expect(Array.isArray(data['@graph'])).toBe(true);
	});
});
```

---
Shared helpers are in `tests/helpers`. Use them to keep tests small and focused.