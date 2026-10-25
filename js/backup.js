/* ==========================================================
   Backup：导出 / 导入 / 系统分享
   - 文字包：一个 JSON，几十 KB，随手就能发出去
   - 附件包：zip（store-only），按月份分批，避免一次几十 MB 卡死
   - 全量包：state.json + attachments/，换手机时用
   ========================================================== */
(function (global) {
  'use strict';

  const DB_NAME = 'xiaorizi-att';
  const STORE = 'f';
  const SCHEMA = 3;

  /* ---------- IndexedDB ---------- */
  let dbp = null;
  function openDB() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => {
        if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function tx(mode, fn) {
    return openDB().then((d) => new Promise((res, rej) => {
      const t = d.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => res(req && 'result' in req ? req.result : req);
      t.onerror = () => rej(t.error);
    }));
  }
  const IDB = {
    get: (id) => openDB().then((d) => new Promise((res) => {
      const rq = d.transaction(STORE).objectStore(STORE).get(id);
      rq.onsuccess = () => res(rq.result || null);
      rq.onerror = () => res(null);
    })),
    put: (rec) => tx('readwrite', (st) => st.put(rec)),
    del: (id) => tx('readwrite', (st) => st.delete(id)),
    all: () => openDB().then((d) => new Promise((res) => {
      const out = [];
      const rq = d.transaction(STORE).objectStore(STORE).openCursor();
      rq.onsuccess = (e) => {
        const c = e.target.result;
        if (c) { out.push({ id: c.value.id, meta: c.value.meta, size: c.value.blob ? c.value.blob.size : 0 }); c.continue(); }
        else res(out);
      };
      rq.onerror = () => res(out);
    })),
  };

  /* ---------- 小工具 ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const dayStamp = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function fmtBytes(n) {
    if (!n) return '0 B';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    if (n < 1073741824) return (n / 1048576).toFixed(1) + ' MB';
    return (n / 1073741824).toFixed(2) + ' GB';
  }
  const EXT = {
    'audio/webm': '.webm', 'audio/mp4': '.m4a', 'audio/mpeg': '.mp3', 'audio/ogg': '.ogg',
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
    'application/pdf': '.pdf', 'text/plain': '.txt',
  };
  const extOf = (mime, name) => {
    if (name && /\.[a-z0-9]{2,5}$/i.test(name)) return name.slice(name.lastIndexOf('.')).toLowerCase();
    return EXT[mime] || '.bin';
  };

  /* ---------- 下载 / 分享 ---------- */
  async function share(blob, name) {
    const file = new File([blob], name, { type: blob.type || 'application/octet-stream' });
    /* 优先系统分享面板（iOS 上能直接存到「文件」/ 网盘 App） */
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        return 'shared';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancel';
      }
    }
    download(blob, name);
    return 'downloaded';
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
  }

  /* ---------- 导出：文字 ---------- */
  function textPayload(state, who) {
    return {
      app: 'xiaorizi',
      kind: 'text',
      schema: SCHEMA,
      exportedAt: new Date().toISOString(),
      who: who || '',
      counts: {
        tasks: (state.tasks || []).length,
        reviews: (state.reviews || []).length,
        wishes: (state.wishes || []).length,
        sessions: ((state.study && state.study.sessions) || []).length,
      },
      state,
    };
  }
  function exportText(state, who) {
    const data = JSON.stringify(textPayload(state, who), null, 1);
    return new Blob([data], { type: 'application/json' });
  }
  const textName = () => `小日子-文字-${stamp(new Date())}.json`;

  /* ---------- 导出：附件 ---------- */
  /**
   * items: [{ id, kind, name, mime, size, dur, date }]
   * 返回 { blob, count, bytes, skipped }
   */
  async function exportAtts(items, label) {
    const entries = [];
    const manifest = [];
    let bytes = 0, skipped = 0;

    for (const it of items) {
      const rec = await IDB.get(it.id);
      if (!rec || !rec.blob) { skipped++; continue; }
      const ext = extOf(it.mime, it.name);
      const file = `attachments/${it.id}${ext}`;
      entries.push({ name: file, data: rec.blob });
      manifest.push({
        id: it.id, kind: it.kind, name: it.name, mime: it.mime,
        size: rec.blob.size, dur: it.dur || 0, date: it.date || '', file,
      });
      bytes += rec.blob.size;
    }

    entries.push({
      name: 'manifest.json',
      data: JSON.stringify({
        app: 'xiaorizi', kind: 'atts', schema: SCHEMA,
        exportedAt: new Date().toISOString(), label: label || '', items: manifest,
      }, null, 1),
    });

    return { blob: await global.Zip.make(entries), count: manifest.length, bytes, skipped };
  }
  const attsName = (label) => `小日子-附件-${label || stamp(new Date())}.zip`;

  /* ---------- 导出：全量 ---------- */
  async function exportAll(state, items, who) {
    const r = await exportAtts(items, 'all');
    const entries = await global.Zip.read(new File([r.blob], 'a.zip'));
    entries.push({
      name: 'state.json',
      data: JSON.stringify(textPayload(state, who), null, 1),
    });
    return { blob: await global.Zip.make(entries), count: r.count, bytes: r.bytes };
  }
  const allName = () => `小日子-全量-${stamp(new Date())}.zip`;

  /* ---------- 导入 ---------- */
  /** 返回 { kind:'text'|'all', state?, atts?:[{id,blob,meta}], payload? } */
  async function readFile(file) {
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.json')) {
      const txt = await file.text();
      let obj;
      try { obj = JSON.parse(txt); } catch (e) { throw new Error('这个 JSON 读不出来'); }
      const state = obj && obj.state ? obj.state : obj;
      if (!state || !Array.isArray(state.tasks)) throw new Error('里面没有小日子的数据');
      return { kind: 'text', state, payload: obj };
    }
    if (name.endsWith('.zip')) {
      const list = await global.Zip.read(file);
      const byName = new Map(list.map((x) => [x.name, x]));
      const stateEntry = byName.get('state.json');
      let state = null, payload = null;
      if (stateEntry) {
        payload = JSON.parse(new TextDecoder().decode(stateEntry.data));
        state = payload.state;
      }
      let manifest = null;
      const mf = byName.get('manifest.json');
      if (mf) manifest = JSON.parse(new TextDecoder().decode(mf.data));

      const atts = [];
      if (manifest && Array.isArray(manifest.items)) {
        for (const it of manifest.items) {
          const e = byName.get(it.file);
          if (!e) continue;
          atts.push({
            id: it.id,
            blob: new Blob([e.data], { type: it.mime || 'application/octet-stream' }),
            meta: { kind: it.kind, name: it.name, mime: it.mime, size: it.size, dur: it.dur, date: it.date },
          });
        }
      }
      return { kind: 'all', state, atts, payload, manifest };
    }
    throw new Error('只支持 .json 或 .zip');
  }

  async function writeAtts(atts) {
    let n = 0;
    for (const a of atts) {
      await IDB.put({ id: a.id, blob: a.blob, meta: a.meta });
      n++;
    }
    return n;
  }

  /* ---------- 存储占用 ---------- */
  async function usage() {
    let list = [];
    try { list = await IDB.all(); } catch (e) { }
    const bytes = list.reduce((a, x) => a + (x.size || 0), 0);
    let quota = 0, used = 0;
    if (navigator.storage && navigator.storage.estimate) {
      try { const e = await navigator.storage.estimate(); used = e.usage || 0; quota = e.quota || 0; } catch (err) { }
    }
    return { files: list.length, bytes, used, quota };
  }

  global.Backup = {
    SCHEMA,
    IDB,
    exportText, textName,
    exportAtts, attsName,
    exportAll, allName,
    readFile, writeAtts,
    share, download,
    usage, fmtBytes, stamp, dayStamp,
  };
})(window);
