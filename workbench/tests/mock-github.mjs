import { createHash } from 'node:crypto';

export const sha = raw => createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
export function mockGitHub(initial = {}) {
  const refs = new Map([['main', new Map(Object.entries(initial))]]), commits = new Map(), heads = new Map(), bases = new Map(), blobs = new Map(), pulls = [], calls = [];
  let revision = 0;
  function snapshot(branch) {
    const files = refs.get(branch), id = createHash('sha1').update(`commit-${++revision}`).digest('hex');
    heads.set(branch, id); commits.set(id, new Map(files));
    for (const raw of files.values()) blobs.set(sha(raw), raw);
  }
  snapshot('main');
  const pull = item => ({ ...item, head: { ref: item.branch, sha: heads.get(item.branch), repo: { full_name: 'XVSHIFU/xvsf' } }, base: { ref: 'main' } });
  const response = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json', ...headers } });
  const state = {
    refs, pulls, calls, blobs, heads,
    putFailure: null, pullFailure: null, losePutResponse: false, beforePut: null,
    change(branch, path, raw) { if (raw === null) refs.get(branch).delete(path); else refs.get(branch).set(path, raw); snapshot(branch); },
    merge(number) { const pr = pulls.find(item => item.number === number); for (const [path, raw] of refs.get(pr.branch)) if (bases.get(pr.branch)?.get(path) !== raw) refs.get('main').set(path, raw); pr.state = 'closed'; pr.merged = true; snapshot('main'); },
    async fetch(url, init = {}) {
      const parsed = new URL(url), pathname = decodeURIComponent(parsed.pathname.replace('/repos/XVSHIFU/xvsf', ''));
      const method = init.method || 'GET', body = init.body && JSON.parse(init.body);
      calls.push({ pathname, method, body, ref: parsed.searchParams.get('ref') });
      if (method === 'GET' && pathname.startsWith('/branches/')) {
        const branch = pathname.slice(10);
        return refs.has(branch) ? response({ name: branch, protected: branch === 'main', commit: { sha: heads.get(branch) } }) : response({}, 404);
      }
      if (method === 'GET' && pathname.startsWith('/git/trees/')) {
        const files = commits.get(pathname.slice(11));
        if (!files) return response({}, 404);
        return response({ truncated: false, tree: [...files].map(([path, raw]) => ({ type: 'blob', mode: '100644', path, sha: sha(raw), size: Buffer.byteLength(raw) })) });
      }
      if (method === 'GET' && pathname.startsWith('/git/blobs/')) {
        const raw = blobs.get(pathname.slice(11));
        return raw === undefined ? response({}, 404) : response({ encoding: 'base64', size: Buffer.byteLength(raw), content: Buffer.from(raw).toString('base64') });
      }
      if (pathname.startsWith('/contents/')) {
        const path = pathname.slice(10), branch = body?.branch || parsed.searchParams.get('ref') || 'main', files = refs.get(branch) || commits.get(branch);
        if (!files) return response({}, 404);
        if (method === 'GET') {
          const raw = files.get(path);
          return raw === undefined ? response({}, 404) : response({ type: 'file', size: Buffer.byteLength(raw), sha: sha(raw), encoding: 'base64', content: Buffer.from(raw).toString('base64') });
        }
        if (method === 'PUT') {
          if (branch === 'main') throw new Error('TEST FAILURE: attempted write to protected main');
          if (state.beforePut) { const handler = state.beforePut; state.beforePut = null; handler(branch, path); }
          if (state.putFailure) return response({}, state.putFailure);
          const old = files.get(path);
          if ((old === undefined ? null : sha(old)) !== (body.sha || null)) return response({}, 409);
          const raw = Buffer.from(body.content, 'base64').toString('utf8');
          state.change(branch, path, raw);
          if (state.losePutResponse) { state.losePutResponse = false; throw new Error('Simulated lost response after write'); }
          return response({ content: { sha: sha(raw) }, commit: { sha: heads.get(branch) } }, old === undefined ? 201 : 200);
        }
      }
      if (method === 'POST' && pathname === '/git/refs') {
        const branch = body.ref.replace('refs/heads/', '');
        if (refs.has(branch)) return response({}, 422);
        const base = commits.get(body.sha); if (!base) return response({}, 422);
        refs.set(branch, new Map(base)); bases.set(branch, new Map(base)); snapshot(branch); return response({ ref: body.ref }, 201);
      }
      if (pathname === '/pulls') {
        if (method === 'GET') return response(parsed.searchParams.get('page') === '1' ? pulls.filter(item => item.state === 'open').map(pull) : []);
        if (method === 'POST') {
          if (state.pullFailure) return response({}, state.pullFailure);
          if (pulls.some(item => item.state === 'open' && item.branch === body.head)) return response({}, 422);
          const item = { number: pulls.length + 1, state: 'open', branch: body.head, title: body.title }; pulls.push(item);
          return response(pull(item), 201);
        }
      }
      const match = pathname.match(/^\/pulls\/(\d+)(\/files)?$/);
      if (method === 'GET' && match) {
        const item = pulls.find(value => value.number === Number(match[1])); if (!item) return response({}, 404);
        if (!match[2]) return response(pull(item));
        return response([...refs.get(item.branch)].filter(([path, raw]) => bases.get(item.branch)?.get(path) !== raw).map(([filename, raw]) => ({ filename, sha: sha(raw), status: bases.get(item.branch)?.has(filename) ? 'modified' : 'added' })));
      }
      throw new Error(`Unexpected mocked endpoint: ${method} ${pathname}`);
    }
  };
  return state;
}
