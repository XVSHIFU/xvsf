import { appendFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

const baseUrl = process.env.PREVIEW_BASE_URL ?? 'https://cms-preview.xvshifu-xvsf-preview.pages.dev/';
let entryPath = '';
try {
  entryPath = JSON.parse(process.env.PAGES_CMS_PAYLOAD || '{}')?.context?.path ?? '';
} catch {
  // The workflow still produces a full-site preview when no entry context is available.
}

let previewUrl = baseUrl;
if (entryPath.startsWith('content/posts/') && entryPath.endsWith('.md')) {
  const source = await readFile(entryPath, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const data = match ? YAML.parse(match[1]) : {};
  const segment = String(data.slug || path.basename(entryPath, path.extname(entryPath)));
  previewUrl = new URL(`posts/${segment.split('/').map(encodeURIComponent).join('/')}/`, baseUrl).toString();
}

console.log(previewUrl);
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `url=${previewUrl}\n`);
