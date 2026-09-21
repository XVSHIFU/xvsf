import { tokenize, resolvePath, childNodes } from './core.mjs';

export const descriptions = {
  help: '查看命令与用法', ls: '列出目录内容', cd: '切换目录', pwd: '显示当前路径',
  cat: '阅读文件或文章', open: '打开原始网页', search: '搜索文章', clear: '清屏并恢复启动画面',
  history: '查看命令历史', whoami: '关于作者', about: '关于博客', manifest: '查看内容目录',
  tree: '展开或收起文件目录', chat: '和猫聊两句', pet: '和猫聊天或互动', random: '随机读一篇文章',
  trail: '查看本次阅读足迹', man: '阅读命令手册', neofetch: '显示系统信息', meow: '叫一声猫',
  fortune: '随机短句', sudo: '权限申请', exit: '退出终端'
};
export const usage = {
  help: 'help [command]', ls: 'ls [path]', cd: 'cd [path]', cat: 'cat <path>', open: 'open <path>',
  search: 'search [--page N] <query>', manifest: 'manifest [--url]', chat: 'chat [message]',
  pet: 'pet [message|action]', man: 'man [command]'
};
const actions = ['status', 'nap', 'wake', 'feed', 'play', 'quiet', 'auto'];
const line = (text, tone) => ({ type: 'text', text, tone });
const result = (output = [], effects = []) => ({ output, effects });
const effect = (type, extra = {}) => ({ type, ...extra });

export function parseSearch(args) {
  let page = 1;
  if (args[0] === '--page') {
    if (!/^[1-9]\d*$/.test(args[1] || '') || !Number.isSafeInteger(Number(args[1]))) throw Error('search: page must be a positive integer');
    page = Number(args[1]); args = args.slice(2);
  }
  const query = args.join(' ').trim();
  if (!query) throw Error('search: missing query');
  return { query, page };
}

// Commands return text/table data and explicit effects. This module never accesses the DOM.
export function createCommands({ tree, posts, manifest, manifestURL, search, reply, random = Math.random }) {
  const registry = new Map();
  const register = (name, handler) => registry.set(name, handler);
  const pathFor = (args, state) => resolvePath(args[0], state.cwd);
  const talk = message => { const text = reply(message); return result([line('cat > ' + text, 'accent')], [effect('say', { text })]); };
  register('help', args => {
    if (!args.length) return result([{ type: 'table', style: 'help-list', rows: Object.entries(descriptions).map(([name, text]) => [usage[name] || name, text]) }]);
    const name = args[0];
    if (!Object.hasOwn(descriptions, name)) throw Error('help: unknown command: ' + name);
    const output = [line((usage[name] || name) + '  ' + descriptions[name])];
    if (name === 'manifest') output.push(line('GET ' + manifestURL + '\nRead endpoint for article JSON, or canonical_url for the published page.', 'muted'));
    if (name === 'pet') output.push(line('pet hi · pet 你好 · pet 喵喵\npet status | nap | wake | feed | play | quiet | auto', 'muted'));
    if (name === 'search') output.push(line('search --page 2 "代码审计"', 'muted'));
    return result(output);
  });
  register('ls', (args, state) => {
    const path = args.length ? pathFor(args, state) : state.cwd;
    const node = tree.get(path);
    if (!node) throw Error('ls: ' + path + ': No such file or directory');
    const nodes = node.type === 'dir' ? childNodes(tree, path) : [[path, node]];
    return result(nodes.length ? [{ type: 'table', style: 'listing', rows: nodes.map(([p, n]) => [p.slice(p.lastIndexOf('/') + 1) + (n.type === 'dir' ? '/' : n.type === 'link' ? '@' : ''), n.post?.title || n.href || '']) }] : [line('(empty)', 'muted')]);
  });
  register('cd', (args, state) => {
    const path = pathFor(args, state), node = tree.get(path);
    if (!node) throw Error('cd: ' + path + ': No such file or directory');
    if (node.type !== 'dir') throw Error('cd: ' + path + ': Not a directory');
    return result([], [effect('cwd', { path })]);
  });
  register('pwd', (_, state) => result([line(state.cwd)]));
  register('cat', (args, state) => {
    if (!args.length) throw Error('cat: missing operand');
    const path = pathFor(args, state), node = tree.get(path);
    if (!node) throw Error('cat: ' + path + ': No such file or directory');
    if (node.type === 'dir') throw Error('cat: ' + path + ': Is a directory');
    return node.type === 'post' ? result([line(path, 'muted')], [effect('read', { post: node.post })]) : result([line(node.content || node.href || '')]);
  });
  register('open', (args, state) => {
    const path = pathFor(args, state), node = tree.get(path), url = node?.post?.canonical || node?.href;
    if (!url) throw Error('open: no URL for ' + path);
    if (!/^https?:\/\//i.test(url)) throw Error('open: unsupported URL');
    return result([line(url)], [effect('open', { url })]);
  });
  register('search', async args => {
    const { query, page } = parseSearch(args);
    const matches = await search(query, page);
    const output = [];
    if (matches.mode === 'catalog') output.push(line('search: catalog mode (full-text index unavailable)', 'muted'));
    output.push(line(matches.total + ' results · page ' + matches.page + '/' + matches.pages, 'muted'));
    for (const post of matches.posts) output.push(line(post.title, 'accent'), line('  cat ' + JSON.stringify('/posts/' + post.name), 'muted'));
    if (matches.page < matches.pages) output.push(line('next: search --page ' + (matches.page + 1) + ' ' + JSON.stringify(query), 'muted'));
    return result(output, matches.posts.length ? [effect('phrase', { pool: 'search' })] : []);
  });
  for (const name of ['clear', 'tree', 'exit']) register(name, () => result([], [effect(name)]));
  register('history', (_, state) => result(state.history.map((text, i) => line(String(i + 1).padStart(3) + '  ' + text))));
  for (const name of ['whoami', 'about']) register(name, (_, state) => result([line(state.info)]));
  register('manifest', args => result([args[0] === '--url' ? line(manifestURL, 'muted') : { type: 'pre', text: JSON.stringify(manifest, null, 2) }]));
  register('chat', args => talk(args.join(' ') || 'hello'));
  register('pet', (args, state) => {
    const action = args[0]?.toLowerCase() || 'status';
    if (!actions.includes(action)) return talk(args.join(' '));
    if (args.length > 1) throw Error('pet: actions take no arguments');
    if (action === 'status') return result([line('cat@xvsf\nstate   ' + state.pet.pose + '\nvoice   ' + (state.pet.quiet ? 'quiet' : 'auto') + '\nsnacks  ' + state.pet.snacks + '\ntrail   ' + state.trailCount + ' pages', 'accent')]);
    const messages = { nap: 'entering sleep mode.', wake: 'awake.', feed: 'snack received.', play: 'chasing yarn.', quiet: 'quiet mode.', auto: 'auto voice.' };
    return result([line('cat: ' + messages[action], 'muted')], [effect('pet', { action })]);
  });
  register('random', (_, state) => {
    const candidates = posts.filter(post => post.id !== state.lastPost?.id), pool = candidates.length ? candidates : posts;
    if (!pool.length) return result([line('random: no pages available', 'muted')]);
    const post = pool[Math.floor(random() * pool.length)];
    return result([line('cat ' + JSON.stringify('/posts/' + post.name), 'muted')], [effect('read', { post })]);
  });
  register('trail', (_, state) => result([line(state.trail, 'muted')]));
  register('man', args => {
    const name = args[0] || 'help';
    if (name === 'cat') return result([line('CAT(1)\n\nNAME\n    cat — read a file; also, the small resident of /home\n\nSYNOPSIS\n    cat <path>\n    pet [status|nap|wake|feed|play|quiet|auto]\n\nNOTES\n    Files can be read. Cats prefer to be consulted.\n    No network. No chores. Occasional naps.', 'muted')]);
    if (!Object.hasOwn(descriptions, name)) throw Error('man: no manual entry for ' + name);
    return result([line((usage[name] || name) + '  ' + descriptions[name])]);
  });
  register('neofetch', () => result([line('xvsf@xvsf.devserver\n────────────────────\nsite    Hugo · PaperMod\nshell   JavaScript · browser\nposts   ' + posts.length + ' mounted\nchat    local vocabulary', 'accent')]));
  register('meow', () => result([line(tree.get('/home/cat').content, 'accent')], [effect('phrase', { pool: 'meow' })]));
  register('fortune', () => result([line(['curiosity > certainty', 'all systems purr.', 'read. question. repeat.', 'sudo take-a-nap'][Math.floor(random() * 4)], 'accent')]));
  register('sudo', () => result([line('xvsf is not in the sudoers file. This incident has been reported to the cat.', 'error')], [effect('phrase', { pool: 'security' })]));
  return {
    execute(raw, state) {
      const [name, ...args] = tokenize(raw), handler = registry.get(name?.toLowerCase());
      if (!handler) throw Error((name || '') + ': command not found');
      return handler(args, state);
    }
  };
}
