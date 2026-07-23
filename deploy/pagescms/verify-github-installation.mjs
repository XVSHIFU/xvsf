import fs from 'node:fs';
import { App } from '@octokit/app';

const envPath = process.argv[2] || '/etc/pagescms.env';
const values = {};

for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2];
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1).replace(/\\n/g, '\n');
  }
  values[match[1]] = value;
}

const app = new App({
  appId: values.GITHUB_APP_ID,
  privateKey: values.GITHUB_APP_PRIVATE_KEY,
});

const { data: installations } = await app.octokit.request('GET /app/installations');
const result = [];

for (const installation of installations) {
  const octokit = await app.getInstallationOctokit(installation.id);
  const { data } = await octokit.request('GET /installation/repositories', {
    per_page: 100,
  });
  result.push({
    account: installation.account?.login,
    repositorySelection: installation.repository_selection,
    repositories: data.repositories.map((repository) => repository.full_name),
  });
}

console.log(JSON.stringify(result, null, 2));
