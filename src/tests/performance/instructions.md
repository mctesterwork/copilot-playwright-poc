# Performance tests

This folder contains simple Artillery scenarios used as smoke/performance checks against the public API (https://api.weather.gov).

Files:

- `alerts-load.yml` - smoke load against `/alerts` (default: 1 rps x 10s)
- `zones-load.yml` - smoke load against `/zones` (default: 1 rps x 10s)
- `sigmets-load.yml` - multiple smoke flows for `/aviation/sigmets` (baseline, atsu, date, sequence)

Run all scenarios from the repository root with the helper script (recommended):

```bash
# Run all performance scenarios sequentially
npm run test:performance

# Or run the TypeScript runner directly
npx tsx src/tests/performance/run-tests.ts
```

Run a single scenario directly with Artillery:

```bash
npx artillery run src/tests/performance/alerts-load.yml
npx artillery run src/tests/performance/zones-load.yml
npx artillery run src/tests/performance/sigmets-load.yml
```

Notes:
- These scenarios hit the public API (https://api.weather.gov). Do not ramp to high traffic without permission.
- For stable CI, run against a staging or mocked API to avoid rate limits and external failures.
