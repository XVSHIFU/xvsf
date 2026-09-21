// Pure path and filesystem operations; browser-independent.
export function resolvePath(raw, cwd = '/') {
  let value = raw || '/';
  if (value === '~') value = '/';
  if (value.startsWith('~/')) value = value.slice(1);
  const parts = value.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  for (const segment of value.split('/')) {
    if (segment === '..') parts.pop();
    else if (segment && segment !== '.') parts.push(segment);
  }
  return '/' + parts.join('/');
}
export function createFilesystem(manifest) {
  if (manifest.version !== 1 || !Array.isArray(manifest.tree) || !Array.isArray(manifest.posts)) throw Error('manifest: unsupported format');
  const posts = new Map(manifest.posts.map(post => [post.id, { ...post, canonical: post.canonical_url }]));
  const tree = new Map();
  for (const node of manifest.tree) {
    if (typeof node.path !== 'string' || !node.path.startsWith('/') || resolvePath(node.path) !== node.path || tree.has(node.path)) throw Error('manifest: invalid path');
    if (node.type === 'ref') {
      if (!posts.has(node.id)) throw Error('manifest: missing article');
      tree.set(node.path, { type: 'post', post: posts.get(node.id) });
    } else if (['dir', 'file', 'link'].includes(node.type)) tree.set(node.path, { ...node });
    else throw Error('manifest: invalid node type');
  }
  return tree;
}
export function childNodes(tree, path) {
  return [...tree].filter(([key]) => key !== path && key.slice(0, key.lastIndexOf('/')) === (path === '/' ? '' : path));
}
// Quotes preserve whitespace; incomplete input is allowed only during completion.
export function tokenize(raw,loose=false){const a=[];let buffer='',quote=null,started=false;for(let i=0;i<raw.length;i++){const c=raw[i];if(c==='\\'&&quote!=="'"&&/[\s"'\\]/.test(raw[i+1]||'')){buffer+=raw[++i];started=true;continue}if(quote){if(c===quote)quote=null;else buffer+=c;started=true}else if(c==='"'||c==="'"){quote=c;started=true}else if(/\s/.test(c)){if(started){a.push(buffer);buffer='';started=false}}else{buffer+=c;started=true}}if(quote&&!loose)throw Error('syntax error: unclosed quote');if(started)a.push(buffer);return a}
