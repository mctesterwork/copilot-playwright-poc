# Performance tests

This folder contains simple Artillery scenarios used as smoke/performance checks against the public API (https://api.weather.gov).

Files:

- `alerts-load.yml` - smoke load against `/alerts` (default: 1 rps x 10s)
- `zones-load.yml` - smoke load against `/zones` (default: 1 rps x 10s)
- `sigmets-load.yml` - multiple smoke flows for `/aviation/sigmets` (baseline, atsu, date, sequence)

Run a scenario from the repository root:

```bash
npm run perf:alerts
npm run perf:zones
npm run perf:sigmets
```

Notes:
- These scenarios hit the public API. Do not ramp to high traffic without permission.
- For stable CI, mock or use a staging environment.
