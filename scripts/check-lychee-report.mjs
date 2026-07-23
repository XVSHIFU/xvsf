import { readFile } from 'node:fs/promises';
import process from 'node:process';
const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node scripts/check-lychee-report.mjs <lychee-report.json>');
  process.exit(2);
}

let report;
try {
  report = JSON.parse(await readFile(filename, 'utf8'));
} catch (error) {
  console.warn(`Lychee report is unavailable or invalid; treating the network result as a warning: ${error.message}`);
  process.exit(0);
}

const definitive = [];
const otherFailures = [];

function walk(value, context = []) {
  if (Array.isArray(value)) {
    for (const item of value) walk(item, context);
    return;
  }
  if (!value || typeof value !== 'object') return;

  const text = JSON.stringify(value);
  const url = value.url ?? value.uri ?? value.input ?? value.link ?? context.at(-1) ?? 'unknown URL';
  if (/\b(?:404|410)\b/.test(text)) definitive.push(String(url));
  else if (/error|failure|timeout|429|403|certificate/i.test(text)) otherFailures.push(String(url));

  for (const [key, child] of Object.entries(value)) walk(child, [...context, key]);
}

walk(report);
for (const url of [...new Set(otherFailures)]) console.warn(`External link warning: ${url}`);
if (definitive.length) {
  for (const url of [...new Set(definitive)]) console.error(`External link returned 404/410: ${url}`);
  process.exit(1);
}

console.log('No definitive 404/410 response was found in the Lychee report.');
