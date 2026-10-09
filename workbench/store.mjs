import { nextHistory } from './workspace-model.mjs';

const database = new Promise((resolve, reject) => {
  const request = indexedDB.open('xvsf-vditor-workbench-v1', 2);
  request.onupgradeneeded = () => {
    for (const name of ['drafts', 'sources']) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: 'id' });
  };
  request.onblocked = () => reject(new Error('请关闭其他旧版写作窗口，然后刷新以保留并升级本机草稿。'));
  request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
  request.onerror = () => reject(request.error);
});

export async function allSources() {
  const db = await database;
  return new Promise((resolve, reject) => {
    const request = db.transaction('sources').objectStore('sources').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheSources(records) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sources', 'readwrite');
    for (const record of records) tx.objectStore('sources').put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('无法保存文章缓存，请先备份本机草稿。'));
  });
}

export async function allDrafts() {
  const db = await database;
  return new Promise((resolve, reject) => {
    const request = db.transaction('drafts').objectStore('drafts').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class DraftConflict extends Error {
  constructor(latest) { super('另一窗口已保存了更新的版本'); this.name = 'DraftConflict'; this.latest = latest; }
}

export async function saveDraft(record, expectedRevision = 0) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    const store = transaction.objectStore('drafts');
    const request = store.get(record.id);
    let saved, conflict;
    request.onsuccess = () => {
      const latest = request.result;
      if ((latest?.revision || 0) !== expectedRevision) { conflict = new DraftConflict(latest); transaction.abort(); return; }
      const { historySeed, historyReason, ...clean } = record;
      saved = { ...clean, history: nextHistory(latest, record), revision: expectedRevision + 1 };
      store.put(saved);
    };
    transaction.oncomplete = () => resolve(saved);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(conflict || transaction.error || new Error('保存已中断'));
  });
}

export async function readDraft(id) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const request = db.transaction('drafts').objectStore('drafts').get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// All imported copies are committed together. A quota failure cannot leave a half-restored backup.
export async function importDrafts(records) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('drafts', 'readwrite');
    for (const record of records) transaction.objectStore('drafts').add({ ...record, revision: 1 });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('导入已中断，未写入任何副本。'));
  });
}
