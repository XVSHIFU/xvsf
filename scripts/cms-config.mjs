import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, '.pages.yml');

const fail = (message) => {
  console.error(`Pages CMS configuration error: ${message}`);
  process.exitCode = 1;
};

let config;
try {
  config = parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`Unable to parse .pages.yml: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(config?.media) || config.media.length === 0) {
  fail('at least one media definition is required');
}

const postImages = config?.media?.find((entry) => entry?.name === 'post_images');
if (!postImages) {
  fail('the post_images media definition is missing');
} else {
  if (postImages.input !== 'static/uploads') fail('post_images.input must be static/uploads');
  if (postImages.output !== '/xvsf/uploads') fail('post_images.output must be /xvsf/uploads');
  const extensions = new Set(postImages.extensions ?? []);
  for (const extension of ['jpg', 'jpeg', 'png', 'webp', 'avif']) {
    if (!extensions.has(extension)) fail(`post_images must allow .${extension}`);
  }
  if (extensions.has('svg')) fail('SVG uploads must remain disabled because SVG can execute active content');
  const optimization = postImages.actions?.find((action) => action?.name === 'optimize-images');
  if (optimization?.workflow !== 'optimize-images.yml') {
    fail('post_images must expose the pinned image optimization workflow');
  }
}

const deployAction = config?.actions?.find((action) => action?.name === 'validate-deploy');
if (deployAction?.workflow !== 'pages.yml') {
  fail('the validate-deploy Pages CMS action is missing');
}

if (config?.settings?.content?.merge !== true) {
  fail('settings.content.merge must be true so unknown front matter fields survive edits');
}

const posts = config?.content?.find((entry) => entry?.name === 'posts');
if (!posts) {
  fail('the posts collection is missing');
} else {
  if (posts.type !== 'collection') fail('posts must be a collection');
  if (posts.path !== 'content/posts') fail('posts.path must be content/posts');
  if (posts.format !== 'yaml-frontmatter') fail('posts must use YAML front matter');

  const fields = Array.isArray(posts.fields) ? posts.fields : [];
  const names = fields.map((field) => field?.name).filter(Boolean);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length > 0) fail(`duplicate field names: ${[...new Set(duplicates)].join(', ')}`);

  for (const required of ['title', 'date', 'draft', 'categories', 'tags', 'body']) {
    if (!names.includes(required)) fail(`required field ${required} is missing`);
  }

  const body = fields.find((field) => field?.name === 'body');
  if (body?.type !== 'rich-text' || body?.options?.format !== 'markdown') {
    fail('body must use the Markdown rich-text editor');
  }
  if (body?.options?.switcher !== true) {
    fail('body.options.switcher must remain enabled for raw Markdown editing');
  }

  const date = fields.find((field) => field?.name === 'date');
  if (date?.type !== 'string') {
    fail('date must remain a string so legacy date precision and timezone are preserved');
  }
}

for (const workflow of ['pages.yml', 'optimize-images.yml']) {
  if (!fs.existsSync(path.join(root, '.github', 'workflows', workflow))) {
    fail(`required workflow ${workflow} is missing`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log('Pages CMS configuration parses and matches the xvsf content-preservation rules.');
