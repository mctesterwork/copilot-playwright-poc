#!/usr/bin/env -S npx tsx
import * as readline from 'readline';
import { execSync } from 'child_process';
import * as fs from 'fs';

function question(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(prompt, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  try {
    // Check if `testmo` CLI is available on PATH
    try {
      execSync('testmo --version', { stdio: 'ignore' });
    } catch (err) {
      console.error('\nTestmo CLI not found in PATH.');
      console.error('Please install the Testmo CLI and ensure it is available on your PATH.');
      console.error('For example (npm global):');
      console.error('  npm install -g @testmo/cli');
      console.error('\nIf you prefer not to install globally, you can use npx if a package exists:');
      console.error('  npx @testmo/cli automation:run:submit --help');
      console.error('\nSee your Testmo documentation for the correct CLI package name and installation instructions.');
      process.exit(3);
    }
    const envToken = process.env.TESTMO_TOKEN;
    const envProject = process.env.TESTMO_PROJECT_ID;

    const token = (envToken?.trim() || await question('Enter your Testmo token: ')).trim();
    if (!token) {
      console.error('Testmo token is required');
      process.exit(2);
    }

    const projectId = (envProject?.trim() || await question('Enter your Testmo project ID: ')).trim();
    if (!projectId) {
      console.error('Testmo project id is required');
      process.exit(2);
    }

    // Discover results files: JUnit XML and Artillery outputs
    const results: string[] = [];
    try {
      const jUnitGlob = 'results/*.xml';
      // Keep the glob string; many CLI tools accept globs. Also include any artillery perf JSONs
      results.push(jUnitGlob);

      const perfDir = 'results/perf';
      if (fs.existsSync(perfDir) && fs.statSync(perfDir).isDirectory()) {
        // include common extensions
        results.push(`${perfDir}/*.json`);
        results.push(`${perfDir}/*.html`);

        // generate a simple summary from artillery JSON results
        try {
          const summaryPath = `${perfDir}/summary.txt`;
          const jsonFiles = fs.readdirSync(perfDir).filter(f => f.endsWith('.json'));
          const lines: string[] = [];
          for (const jf of jsonFiles) {
            try {
              const content = JSON.parse(fs.readFileSync(`${perfDir}/${jf}`, 'utf8'));
              // Artillery JSONs usually have a 'aggregated' section or 'metrics' - be defensive
              const stats = content?.aggregate || content?.aggregated || content?.metrics || content?.summary || null;
              lines.push(`Scenario: ${jf}`);
              if (stats) {
                // try to extract some commonly available numbers
                if (stats.requests) lines.push(`  requests: ${stats.requests}`);
                if (stats.codes) lines.push(`  codes: ${JSON.stringify(stats.codes)}`);
                if (stats.latency && typeof stats.latency === 'object') lines.push(`  latency (p95): ${stats.latency.p95 || stats.latency['95th'] || ''}`);
              } else if (content && content.metrics) {
                lines.push(`  metrics keys: ${Object.keys(content.metrics).join(', ')}`);
              } else {
                lines.push('  Could not parse summary from this file');
              }
            } catch (e) {
              lines.push(`Scenario: ${jf} -> failed to read/parse`);
            }
          }
          if (lines.length === 0) lines.push('No artillery JSON results found');
          fs.writeFileSync(summaryPath, lines.join('\n') + '\n', 'utf8');
          results.push(summaryPath);
        } catch (e) {
          // ignore summary errors
        }
      }
    } catch (e) {
      // ignore discovery errors and fall back to the default junit pattern
      results.push('results/*.xml');
    }

    // Build arguments
    const args = [
      'automation:run:submit',
      '--instance', 'https://alsac.testmo.net',
      '--project-id', projectId,
      '--name', 'Playwright API Test Run',
      '--source', 'api-tests',
      '--results', results.join(','),
    ];

    console.log('Submitting results to Testmo...');

    // Prefer to pass TESTMO_TOKEN via env to avoid shell escaping issues and platform differences
    // Try to run `testmo`; if not found, fallback to `npx @testmo/cli` if available.
    const cmd = 'testmo';
    try {
      execSync(`${cmd} --version`, { stdio: 'ignore' });
      execSync(`${cmd} ${args.join(' ')}`, { stdio: 'inherit', env: { ...process.env, TESTMO_TOKEN: token } });
    } catch (err) {
      console.warn('`testmo` CLI not runnable directly, attempting to use `npx @testmo/cli` fallback');
      try {
        execSync(`npx @testmo/cli ${args.join(' ')}`, { stdio: 'inherit', env: { ...process.env, TESTMO_TOKEN: token } });
      } catch (err2) {
        console.error('Failed to invoke testmo via npx fallback:', err2 instanceof Error ? err2.message : String(err2));
        throw err2;
      }
    }

    console.log('\nTestmo submission finished');
    process.exit(0);
  } catch (err) {
    console.error('Testmo submission failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

if (require.main === module) main();

export default main;
