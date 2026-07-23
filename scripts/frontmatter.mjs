import { createHash } from 'node:crypto';
import { readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import YAML from 'yaml';

const MODE_CHECK = '--check';
const MODE_WRITE = '--write';
const mode = process.argv[2] ?? MODE_CHECK;
if (![MODE_CHECK, MODE_WRITE].includes(mode)) {
  console.error('Usage: node scripts/frontmatter.mjs --check|--write');
  process.exit(2);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const postsDir = path.join(repoRoot, 'content', 'posts');
const schemaPath = path.join(repoRoot, 'schemas', 'frontmatter.schema.json');
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: true });
const validate = ajv.compile(schema);

const preferredOrder = [
  'title',
  'date',
  'publishDate',
  'expiryDate',
  'draft',
  'description',
  'categories',
  'tags',
  'showToc',
  'tocOpen',
  'math',
  'demoAlert',
  'slug',
  'aliases',
  'cover',
  'lastmod'
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readLine(buffer, offset) {
  const newline = buffer.indexOf(0x0a, offset);
  const next = newline === -1 ? buffer.length : newline + 1;
  let end = newline === -1 ? buffer.length : newline;
  if (end > offset && buffer[end - 1] === 0x0d) end -= 1;
  return { value: buffer.subarray(offset, end).toString('utf8'), start: offset, next };
}

function splitFrontMatter(buffer, filename) {
  const first = readLine(buffer, 0);
  const firstValue = first.value.replace(/^\uFEFF/, '');
  if (firstValue !== '---') throw new Error(`${filename}: expected YAML front matter starting with ---`);

  let offset = first.next;
  while (offset <= buffer.length) {
    const line = readLine(buffer, offset);
    if (line.value === '---') {
      return {
        yaml: buffer.subarray(first.next, line.start).toString('utf8'),
        body: buffer.subarray(line.next)
      };
    }
    if (line.next <= offset) break;
    offset = line.next;
  }
  throw new Error(`${filename}: closing front matter delimiter was not found`);
}

function asStringArray(value) {
  if (value === undefined || value === null) return [];
  const values = Array.isArray(value) ? value : [value];
  return values.map((item) => String(item).trim()).filter(Boolean);
}

function normalizeData(input) {
  const data = { ...input };
  data.title = data.title === undefined || data.title === null ? '' : String(data.title).trim();
  data.date = data.date === undefined || data.date === null ? '' : String(data.date).trim();
  for (const key of ['publishDate', 'expiryDate', 'lastmod']) {
    if (data[key] === undefined || data[key] === null || String(data[key]).trim() === '') {
      delete data[key];
    } else {
      data[key] = String(data[key]).trim();
    }
  }
  data.draft = data.draft === undefined ? false : data.draft;
  data.categories = asStringArray(data.categories);
  data.tags = asStringArray(data.tags);
  if (data.aliases !== undefined) data.aliases = asStringArray(data.aliases);

  const ordered = {};
  for (const key of preferredOrder) {
    if (Object.hasOwn(data, key)) ordered[key] = data[key];
  }
  for (const [key, value] of Object.entries(data)) {
    if (!Object.hasOwn(ordered, key)) ordered[key] = value;
  }
  return ordered;
}

function parseYaml(source, filename) {
  const document = YAML.parseDocument(source, {
    prettyErrors: true,
    strict: true,
    uniqueKeys: true
  });
  if (document.errors.length) {
    throw new Error(`${filename}: ${document.errors.map((error) => error.message).join('; ')}`);
  }
  const value = document.toJS();
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new Error(`${filename}: front matter must be a YAML mapping`);
  }
  return value;
}

function canonicalFrontMatter(data) {
  const yaml = YAML.stringify(data, {
    blockQuote: 'literal',
    lineWidth: 0,
    minContentWidth: 0
  });
  return Buffer.from(`---\n${yaml}---\n`, 'utf8');
}

function formatValidationErrors(filename) {
  return validate.errors.map((error) => {
    const location = error.instancePath || '/';
    return `${filename}${location}: ${error.message}`;
  });
}

const filenames = (await readdir(postsDir))
  .filter((filename) => filename.toLowerCase().endsWith('.md') && filename.toLowerCase() !== '_index.md')
  .sort((a, b) => a.localeCompare(b, 'zh-CN'));

let changed = 0;
const failures = [];

for (const filename of filenames) {
  const absolutePath = path.join(postsDir, filename);
  try {
    const original = await readFile(absolutePath);
    const { yaml, body } = splitFrontMatter(original, filename);
    const originalBodyHash = sha256(body);
    const parsed = parseYaml(yaml, filename);
    const normalized = normalizeData(parsed);

    if (!validate(normalized)) {
      failures.push(...formatValidationErrors(filename));
      continue;
    }

    const frontMatter = canonicalFrontMatter(normalized);
    const output = Buffer.concat([frontMatter, body]);
    const outputBody = output.subarray(frontMatter.length);
    if (sha256(outputBody) !== originalBodyHash || !outputBody.equals(body)) {
      failures.push(`${filename}: body bytes changed during normalization`);
      continue;
    }

    if (!output.equals(original)) {
      changed += 1;
      if (mode === MODE_WRITE) {
        const temporaryPath = `${absolutePath}.frontmatter-tmp`;
        await writeFile(temporaryPath, output);
        try {
          await rename(temporaryPath, absolutePath);
        } finally {
          await rm(temporaryPath, { force: true });
        }
      } else {
        failures.push(`${filename}: front matter is valid but not normalized (run npm run frontmatter:write)`);
      }
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`ERROR ${failure}`);
  console.error(`Front matter ${mode === MODE_WRITE ? 'write' : 'check'} failed: ${failures.length} issue(s).`);
  process.exit(1);
}

console.log(`Front matter ${mode === MODE_WRITE ? 'normalized' : 'validated'}: ${filenames.length} posts, ${changed} file(s) ${mode === MODE_WRITE ? 'updated' : 'would change'}, all body hashes preserved.`);
