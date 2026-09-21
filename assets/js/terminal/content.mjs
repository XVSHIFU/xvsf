// Network state belongs here; failed requests never become permanent cached failures.
export async function readResource(url, kind = 'json', signal) {
  const response = await fetch(url, { signal: signal || AbortSignal.timeout(15000) });
  if (!response.ok) throw Error('HTTP ' + response.status);
  return kind === 'json' ? response.json() : response.text();
}
export function createSearch(manifest, moduleURL) {
  let pagefindPromise;
  let retry = 0;
  let cachedQuery;
  let cachedPosts;
  const key = value => { const url = new URL(value, location.href); return decodeURIComponent(url.pathname).replace(/\/$/, ''); };
  const byURL = new Map(manifest.posts.map(post => [key(post.canonical_url), post]));
  async function load() {
    if (!pagefindPromise) {
      const url = new URL(moduleURL, location.href);
      if (retry) url.searchParams.set('terminal-retry', String(retry));
      pagefindPromise = import(url.href).catch(error => { pagefindPromise = undefined; throw error; });
    }
    return pagefindPromise;
  }
  return async (query, page = 1) => {
    if (!Number.isSafeInteger(page) || page < 1) throw Error('search: page must be a positive integer');
    const paginate = (posts, mode) => {
      const pages = Math.max(1, Math.ceil(posts.length / 20));
      if (page > pages) throw Error('search: page out of range (1–' + pages + ')');
      return { mode, posts: posts.slice((page - 1) * 20, page * 20), total: posts.length, page, pages };
    };
    if (cachedQuery === query && cachedPosts) return paginate(cachedPosts, 'full-text');
    let matches;
    try {
      const pagefind = await load();
      const result = await pagefind.search(query);
      matches = [];
      // Resolve in small batches, filtering to the same public manifest collection.
      for (let offset = 0; offset < result.results.length; offset += 20) {
        const batch = await Promise.all(result.results.slice(offset, offset + 20).map(item => item.data()));
        for (const item of batch) { const post = byURL.get(key(item.url)); if (post && !matches.includes(post)) matches.push(post); }
      }
      cachedQuery = query;
      cachedPosts = matches;
    } catch {
      pagefindPromise = undefined;
      retry += 1;
      const needle = query.toLocaleLowerCase();
      return paginate(manifest.posts.filter(post => [post.title, post.description, ...post.categories, ...post.tags].join(' ').toLocaleLowerCase().includes(needle)), 'catalog');
    }
    return paginate(matches, 'full-text');
  };
}
