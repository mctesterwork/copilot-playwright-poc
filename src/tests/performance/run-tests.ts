#!/usr/bin/env -S npx tsx
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function readDotEnv(envPath: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    if (!fs.existsSync(envPath)) return out;
    const s = fs.readFileSync(envPath, 'utf8');
    for (const line of s.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      out[k] = v;
    }
  } catch (err) {
    // ignore
  }
  return out;
}

async function main() {
  const dir = path.resolve(__dirname);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  if (files.length === 0) {
    console.error('No YAML scenarios found in', dir);
    process.exit(2);
  }

  // Determine whether to save artillery results. Check env var first, then .env.dev
  const envFlag = (process.env.SAVE_ARTILLERY_RESULTS || '').toLowerCase();
  let saveResults = envFlag === '1' || envFlag === 'true';
  if (!saveResults) {
    const devEnv = path.resolve(process.cwd(), '.env.dev');
    const dev = readDotEnv(devEnv);
    if (dev.SAVE_ARTILLERY_RESULTS) {
      const v = String(dev.SAVE_ARTILLERY_RESULTS).toLowerCase();
      saveResults = v === '1' || v === 'true';
    }
  }

  if (saveResults) {
    const outDir = path.resolve(process.cwd(), 'results', 'perf');
    fs.mkdirSync(outDir, { recursive: true });
    console.log('Saving Artillery JSON/HTML results to', outDir);
  }

  console.log(`Found ${files.length} scenario(s):`, files.join(', '));

  let failed = false;

  for (const file of files) {
    const full = path.join(dir, file);
    const base = path.basename(file, path.extname(file));
    console.log('\n' + '='.repeat(60));
    console.log(`Running scenario: ${file}`);
    try {
      if (saveResults) {
        const outJson = path.resolve(process.cwd(), 'results', 'perf', `${base}.json`);
        // Run artillery and save JSON output
        execSync(`npx artillery run --output ${outJson} ${full}`, { stdio: 'inherit' });
        try {
          // Generate HTML report
          const outHtml = path.resolve(process.cwd(), 'results', 'perf', `${base}.html`);
          execSync(`npx artillery report --output ${outHtml} ${outJson}`, { stdio: 'inherit' });
        } catch (reportErr) {
          console.warn('Generating Artillery HTML report failed:', reportErr instanceof Error ? reportErr.message : String(reportErr));
        }
      } else {
        execSync(`npx artillery run ${full}`, { stdio: 'inherit' });
      }
      console.log(`Scenario ${file} finished successfully`);
    } catch (err) {
      failed = true;
      console.error(`Scenario ${file} failed:`, err instanceof Error ? err.message : String(err));
    }
  }

  console.log('\n' + '='.repeat(60));
  if (failed) {
    console.error('One or more scenarios failed');
    process.exit(1);
  }

  console.log('All scenarios completed successfully');
  process.exit(0);
}

if (require.main === module) {
  main();
}

export default main;
