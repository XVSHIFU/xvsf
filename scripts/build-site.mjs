import { rm } from 'node:fs/promises';
import { refreshProjectActivity } from './project-activity.mjs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Hugo preserves some previously published global resources. Remove only our
// generated namespace before a build; never remove the destination itself.
export async function cleanTerminalOutputs(destination, allowedRoot) {
  const root = path.resolve(allowedRoot);
  const target = path.resolve(destination);
  if (!target.startsWith(root + path.sep)) throw Error('Build destination must be inside the workspace');
  const terminal = path.resolve(target, 'terminal');
  const manifest = path.resolve(target, '.well-known/xvsf-manifest.json');
  if (!terminal.startsWith(target + path.sep) || !manifest.startsWith(target + path.sep)) throw Error('Unsafe terminal output path');
  await rm(terminal, { recursive: true, force: true });
  await rm(manifest, { force: true });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const option = args.findIndex(arg => arg === '--destination' || arg === '-d');
  const inline = args.find(arg => arg.startsWith('--destination='));
  const destination = option >= 0 ? args[option + 1] : inline ? inline.slice('--destination='.length) : 'public';
  if (!destination || destination.startsWith('-')) throw Error('Missing build destination');
  await cleanTerminalOutputs(path.resolve(destination), process.cwd());
  await refreshProjectActivity();
  const result = spawnSync(process.env.HUGO_BIN || 'hugo', args, { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}
