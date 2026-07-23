import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'content', 'posts');

function deterministicUuid(kind, name) {
  const bytes = Buffer.from(createHash('sha256').update(`${kind}\0${name}`).digest().subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parseFrontMatter(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${filename}: YAML front matter not found`);
  return YAML.parse(match[1]);
}

const terms = { categories: new Set(), tags: new Set() };
for (const filename of (await readdir(postsDir)).filter((name) => name.endsWith('.md'))) {
  const data = parseFrontMatter(await readFile(path.join(postsDir, filename), 'utf8'), filename);
  for (const kind of Object.keys(terms)) {
    for (const value of data[kind] ?? []) {
      const name = String(value).trim();
      if (name) terms[kind].add(name);
    }
  }
}

for (const [kind, values] of Object.entries(terms)) {
  const directory = path.join(root, 'data', kind);
  await mkdir(directory, { recursive: true });
  for (const name of [...values].sort((a, b) => a.localeCompare(b, 'zh-CN'))) {
    const id = deterministicUuid(kind, name);
    const output = YAML.stringify({ id, name, description: '' }, { lineWidth: 0 });
    await writeFile(path.join(directory, `${id}.yaml`), output, { flag: 'wx' }).catch((error) => {
      if (error.code !== 'EEXIST') throw error;
    });
  }
  console.log(`${kind}: ${values.size} managed terms`);
}
