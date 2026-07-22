import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Ajv from 'ajv';
import { parse } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'deploy', 'cms', 'config.yml');
const schemaPath = path.join(
  root,
  'node_modules',
  '@sveltia',
  'cms',
  'schema',
  'sveltia-cms.json',
);

const config = parse(fs.readFileSync(configPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: false });
const validate = ajv.compile(schema);

if (!validate(config)) {
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

console.log('CMS configuration matches the pinned Sveltia CMS schema.');
