AGENTS.md
===========

Purpose
-------
This file contains instructions for AI agents and users to set up, generate API types, create controller functions and tests, run the test suite and submit results to Testmo. The repository is a template — it must not contain any API-specific secrets or hard-coded API URLs. Use your own OpenAPI/Swagger URL.

File/Directory naming
---------------------
- Use snake_case for files and directories (e.g., `src/tests/performance`, `src/api_controller.ts` becomes `src/api_controller.ts` if created).

High-level workflow (what the agent will guide the user through)
----------------------------------------------------------------
1. Install dependencies
2. Configure authentication (if any) — handled by `tests/setup/setup.js`
3. Provide OpenAPI/Swagger URL and run Kubb to generate types
4. Create an API controller class using generated types (`src/gen` is the output target)
5. Write Playwright API tests using the controller functions and generated types
6. Run tests and collect JUnit report (Playwright is configured to emit JUnit)
7. Submit results to Testmo using `scripts/testmo_submit.sh`

Setup steps for a user after cloning
-----------------------------------
1. Install dependencies

   ```bash
   npm install
   ```

2. Configure authentication (optional)

   - The repository includes `tests/setup/setup.js` which runs before tests to configure auth and environment variables.
   - When prompted, provide the authentication method (none, bearer, basic, api_key).
   - Secrets should never be committed. Use environment variables or a `.env` file (listed in `.gitignore`).

3. Provide OpenAPI/Swagger URL

   - The agent will ask for your OpenAPI URL. Provide the full URL (e.g., `https://example.com/openapi.json`).
   - The agent will run Kubb to generate TypeScript types based on that URL.

AGENTS.md
===========

Purpose
-------
This file contains instructions for AI agents and users to set up, generate API types, create controller functions and tests, run the test suite and submit results to Testmo. The repository is a template — it must not contain any API-specific secrets or hard-coded API URLs. Use your own OpenAPI/Swagger URL.

File/Directory naming
---------------------
- Use snake_case for files and directories (e.g., `src/tests/performance`, `src/api_controller.ts`).

High-level workflow (what the agent will guide the user through)
----------------------------------------------------------------
1. Install dependencies
2. Run the interactive setup wizard (`scripts/setup_wizard.ts`) to configure env files and the codegen URL
3. Generate types with Kubb (`npm run codegen`)
4. Create an API controller class using generated types (`src/gen` is the output target)
5. Write Playwright API tests using the controller functions and generated types
6. Run tests and collect JUnit report (Playwright is configured to emit JUnit)
7. Submit results to Testmo using `npm run testmo:submit`

Setup steps for a user after cloning
-----------------------------------
1. Install dependencies

   ```bash
   npm install
   ```

2. Interactive setup wizard (recommended)

   - Run the setup wizard which will prompt for authentication method, example env URLs and an OpenAPI/Swagger URL.

   ```bash
   npm run setup:wizard
   ```

   - The wizard will create example environment files (`.env.dev`, `.env.qa`) and update the `codegen` script (or write instructions) to include your API definition URL.
   - The wizard writes a TypeScript global setup at `src/tests/setup.ts` which Playwright will execute before tests. Secrets are written to `.env.*` files which are gitignored.

3. Generate types with Kubb

   - Kubb is invoked from the `codegen` npm script. Example:

   ```bash
   npm run codegen
   ```

4. Create API controller functions

   - Implement controller functions in `src/api_controller.ts` (or `src/api-controller.ts`) using the generated types in `src/gen` as inputs and outputs.
   - Keep controllers focused (one function per endpoint) and return typed shapes.

5. Write tests

   - Place API tests under `src/tests/api/` and use tags to group them:
     - `@smoke` — quick sanity checks
     - `@regression` — full regression suite
     - `@sanity` — smaller set for PR verification
   - Use Playwright's `test.describe` and `test` blocks and import controller functions.

6. Run tests

   ```bash
   npm test
   # or smoke only
   npm run test:api:smoke
   ```

7. Submit to Testmo

   - Run the TypeScript submission helper which will prompt for Testmo token and project ID if they are not set as env vars:

   ```bash
   npm run testmo:submit
   ```

   - The helper will submit `results/test-results.xml` to Testmo.

Files and scripts included in this template
-----------------------------------------
- `scripts/setup_wizard.ts` — interactive TypeScript wizard to scaffold `.env.dev`, `.env.qa` and update `codegen`.
- `src/tests/setup.ts` — TypeScript Playwright global setup that runs before tests and validates connectivity.
- `scripts/validate_setup.ts` — TypeScript validator that checks required files and generated types.
- `scripts/validate_and_run_smoke.ts` — TypeScript helper that installs deps and runs the smoke suite.
- `scripts/testmo_submit.ts` — TypeScript helper to submit JUnit results to Testmo.
- `src/tests/performance/*` — Artillery scenarios (alerts/zones/sigmets) for smoke performance runs.

Security & secrets
------------------
- Never commit secrets. The setup wizard stores example secrets in `.env.*` which are gitignored. For CI, set secrets as CI environment variables.

How agents should interact with the user
---------------------------------------
1. Offer to run `npm run setup:wizard`. If the user agrees, prompt for:
   - API base URLs for dev/qa
   - OpenAPI/Swagger URL
   - Authentication type (none, bearer, basic, api_key) and secret values
2. Update `package.json` `codegen` script with the provided OpenAPI URL or run `npm run codegen` directly.
3. Generate types and place them under `src/gen`.
4. Create or update `src/api_controller.ts` with controller functions using generated types.
5. Create tests under `src/tests/api/` using the controller functions and tags.
6. Run smoke tests with `npm run test:api:smoke` and collect `results/test-results.xml`.
7. Ask for Testmo token & project id and run `npm run testmo:submit` to upload results.

Notes for CI
------------
- Use environment variables for secrets (`API_BASE_URL`, `AUTH_TOKEN`, etc.).
- For CI, consider committing generated types (or running `npm run codegen` in CI) depending on policy.

Quick commands
--------------
```bash
npm install
npm run setup:wizard        # interactive setup
npm run codegen             # generate types
npm run validate:setup      # validate generated files and environment
npm run test:api:smoke      # run API smoke tests (Playwright)
npm run testmo:submit       # submit results to Testmo
npm run test:performance    # run smoke perf scenario (Artillery)
```

Completion summary
------------------
This AGENTS.md was updated to reflect the TypeScript-based setup scripts, the use of `tsx` to run TypeScript scripts, and the new location of performance scenarios under `src/tests/performance`.