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
  const SCHEMA = 4;

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

  /* ---------- 导出：可阅读的 HTML（内嵌 JSON，照样能导回来） ---------- */
  const MOOD_EMO = { great: '🤩', happy: '😊', calm: '🙂', tired: '😪', down: '🥺' };
  const RV_NAME = { day: '这一天', week: '这一周', month: '这个月', stage: '这个阶段' };
  const WD = ['日', '一', '二', '三', '四', '五', '六'];

  const escHtml = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
  const para = (s) => escHtml(s).replace(/\n/g, '<br>');
  const cnDate = (d) => {
    if (!d) return '';
    const p = String(d).split('-');
    return p.length === 3 ? `${Number(p[1])} 月 ${Number(p[2])} 日` : d;
  };
  const cnWeek = (d) => {
    const t = new Date(String(d) + 'T00:00:00');
    return isNaN(t) ? '' : '周' + WD[t.getDay()];
  };
  const cnMonth = (d) => {
    const p = String(d || '').split('-');
    return p.length >= 2 ? `${p[0]} 年 ${Number(p[1])} 月` : String(d || '');
  };
  const humanSec = (n) => {
    if (!n) return '0 分钟';
    const h = Math.floor(n / 3600), m = Math.round((n % 3600) / 60);
    if (h && m) return `${h} 小时 ${m} 分`;
    return h ? `${h} 小时` : `${m} 分钟`;
  };

  function buildHtml(state, who) {
    const st = state || {};
    const name = st.me && st.me.name ? st.me.name : (who || '我');
    const face = (st.me && st.me.face) || '🌸';
    const tasks = (st.tasks || []).slice();
    const reviews = (st.reviews || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const wishes = st.wishes || [];
    const sessions = (st.study && st.study.sessions) || [];
    const secAll = sessions.reduce((a, s) => a + (s.sec || 0), 0);

    const byDay = new Map();
    for (const t of tasks) {
      if (!byDay.has(t.date)) byDay.set(t.date, []);
      byDay.get(t.date).push(t);
    }
    const days = [...byDay.keys()].sort().reverse();
    const firstDay = days.length ? days[days.length - 1] : '';
    const lastDay = days.length ? days[0] : '';

    const dayHtml = days.map((d) => {
      const list = byDay.get(d);
      const done = list.filter((x) => x.done).length;
      const mood = (st.moods && st.moods[d]) ? `<span class="mood">${MOOD_EMO[st.moods[d]] || ''}</span>` : '';
      const joy = (st.joys && st.joys[d]) ? `<div class="joy">🌈 ${para(st.joys[d])}</div>` : '';
      return `<article class="day">
        <h3>${cnDate(d)}<span class="wd">${cnWeek(d)}</span>${mood}
          <em>${done}/${list.length}</em></h3>
        <ul>${list.map((x) => `<li class="${x.done ? 'ok' : ''}">
          <span class="mk">${x.done ? '✓' : '·'}</span>
          <span class="tt">${escHtml(x.title)}</span>
          ${x.time ? `<span class="tag">${escHtml(x.time)}</span>` : ''}
          ${x.tag ? `<span class="tag soft">${escHtml(x.tag)}</span>` : ''}
          ${x.goal ? '<span class="tag goal">目标</span>' : ''}
        </li>${x.note ? `<li class="note">${para(x.note)}</li>` : ''}`).join('')}</ul>
        ${joy}
      </article>`;
    }).join('');

    const rvHtml = reviews.map((r) => {
      const text = r.text || [r.good, r.words, r.next].filter(Boolean).join('\n');
      const span = r.type === 'stage' && r.endDate
        ? `${cnDate(r.date)} - ${cnDate(r.endDate)}`
        : r.type === 'week' ? `${cnDate(r.date)} 起的一周`
          : r.type === 'month' ? `${cnMonth(r.date)}` : `${cnDate(r.date)} ${cnWeek(r.date)}`;
      return `<article class="rv">
        <h3>${MOOD_EMO[r.mood] || '✍️'} <span>${RV_NAME[r.type] || '复盘'}</span> <em>${span}</em></h3>
        <p>${para(text) || '<span class="dim">（这一篇没有写内容）</span>'}</p>
      </article>`;
    }).join('');

    const wishHtml = wishes.length ? `<section>
      <h2>重要的日子</h2>
      <ul class="wish">${wishes.map((w) => `<li>
        <span>${escHtml(w.icon || '🎀')}</span> ${escHtml(w.title)}
        <em>${cnDate(w.date)}${w.yearly ? ' · 每年' : ''}</em></li>`).join('')}</ul>
    </section>` : '';

    const sRev = ((st.study && st.study.reviews) || []).length;
    const studyHtml = secAll ? `<section>
      <h2>学习</h2>
      <p class="line">一共学了 <b>${humanSec(secAll)}</b>，${sessions.length} 段${sRev ? `，写过 ${sRev} 段复盘` : ''}。</p>
    </section>` : '';

    const payload = textPayload(state, who);
    /* 关键：把 < 转成 \u003c，JSON 里就算出现 </script> 也不会截断 */
    const json = JSON.stringify(payload).replace(/</g, '\\u003c');
    const range = firstDay ? ` · ${firstDay} ~ ${lastDay}` : '';

    return `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escHtml(name)}的小日子 · ${dayStamp(new Date())}</title>
<style>
:root{--ink:#4A3B44;--ink2:#8C7A85;--line:#F0E4EA;--pink:#D4537E;--pink-s:#FDF0F5;--bg:#FFF9FB}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.75 -apple-system,"PingFang SC","Microsoft YaHei",sans-serif;-webkit-text-size-adjust:100%}
.wrap{max-width:680px;margin:0 auto;padding:28px 18px 64px}
header{text-align:center;padding:20px 0 26px}
.face{font-size:44px;line-height:1}
h1{font-size:21px;margin:10px 0 6px;font-weight:600}
.meta{font-size:12.5px;color:var(--ink2);margin:0}
.stats{display:flex;gap:8px;margin-top:20px}
.stats div{flex:1;background:#fff;border:1px solid var(--line);border-radius:14px;padding:10px 4px}
.stats b{display:block;font-size:16px;color:var(--pink)}
.stats span{font-size:11px;color:var(--ink2)}
h2{font-size:15px;font-weight:600;margin:30px 0 12px;padding-left:10px;border-left:3px solid var(--pink)}
.day,.rv{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:10px}
.day h3,.rv h3{margin:0 0 8px;font-size:13.5px;font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.day h3 em,.rv h3 em{margin-left:auto;font-style:normal;font-size:11.5px;color:var(--ink2);font-weight:400}
.wd{font-size:11.5px;color:var(--ink2);font-weight:400}
.mood{font-size:14px}
.day ul{list-style:none;margin:0;padding:0}
.day li{display:flex;gap:7px;font-size:14px;padding:3px 0;align-items:baseline}
.day li.ok .tt{color:var(--ink2);text-decoration:line-through}
.mk{color:var(--pink);flex:none;width:12px}
.tt{flex:1;min-width:0}
.tag{font-style:normal;font-size:11px;color:var(--ink2);background:#F7F1F4;border-radius:99px;padding:1px 7px;white-space:nowrap}
.tag.goal{background:#FFF4D6;color:#8A5B00}
.note{color:var(--ink2);font-size:12.5px;padding-left:19px!important;border:0}
.joy{font-size:12.5px;color:#7A6A74;background:var(--pink-s);border-radius:10px;padding:6px 9px;margin-top:8px}
.rv p{margin:0;font-size:14px;white-space:normal;word-break:break-word}
.rv h3 span{font-weight:600}
.dim{color:var(--ink2)}
.wish{list-style:none;padding:0;margin:0}
.wish li{background:#fff;border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:8px;font-size:14px;display:flex;gap:8px;align-items:baseline}
.wish em{margin-left:auto;font-style:normal;font-size:12px;color:var(--ink2)}
.line{font-size:14px;margin:0}
footer{margin-top:36px;text-align:center;font-size:11.5px;color:var(--ink2)}
@media print{body{background:#fff}.day,.rv,.stats div,.wish li{break-inside:avoid}}
</style>
</head><body>
<div class="wrap">
  <header>
    <div class="face">${escHtml(face)}</div>
    <h1>${escHtml(name)}的小日子</h1>
    <p class="meta">导出于 ${dayStamp(new Date())}${range}</p>
    <div class="stats">
      <div><b>${tasks.length}</b><span>件小事</span></div>
      <div><b>${tasks.filter((x) => x.done).length}</b><span>已完成</span></div>
      <div><b>${reviews.length}</b><span>篇复盘</span></div>
      <div><b>${wishes.length}</b><span>个日子</span></div>
    </div>
  </header>
  ${studyHtml}
  ${days.length ? `<section><h2>每天的小事</h2>${dayHtml}</section>` : ''}
  ${reviews.length ? `<section><h2>写给自己的话</h2>${rvHtml}</section>` : ''}
  ${wishHtml}
  <footer>这份文件既是给人看的，也是备份 —— 在「导入备份」里选它就能恢复。</footer>
</div>
<script type="application/json" id="xrz-data">${json}</script>
</body></html>`;
  }

  function exportHtml(state, who) {
    return new Blob([buildHtml(state, who)], { type: 'text/html;charset=utf-8' });
  }
  const htmlName = () => `小日子-可阅读-${stamp(new Date())}.html`;

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
    /* 顺手塞一份能直接点开看的网页，解压后双击 index.html 就能读 */
    entries.push({ name: 'index.html', data: buildHtml(state, who) });
    return { blob: await global.Zip.make(entries), count: r.count, bytes: r.bytes };
  }
  const allName = () => `小日子-全量-${stamp(new Date())}.zip`;

  /* ---------- 导入 ---------- */
  /** 返回 { kind:'text'|'all', state?, atts?:[{id,blob,meta}], payload? } */
  async function readFile(file) {
    const name = (file.name || '').toLowerCase();
    /* 可阅读的 HTML 备份：从内嵌 JSON 里取回数据 */
    if (name.endsWith('.html') || name.endsWith('.htm') || (file.type || '').indexOf('text/html') === 0) {
      const txt = await file.text();
      const m = txt.match(/<script[^>]*id=["']xrz-data["'][^>]*>([\s\S]*?)<\/script>/i);
      if (!m) throw new Error('这个网页里没有小日子的数据');
      let obj;
      try { obj = JSON.parse(m[1]); } catch (e) { throw new Error('网页里的数据读不出来'); }
      const state = obj && obj.state ? obj.state : obj;
      if (!state || !Array.isArray(state.tasks)) throw new Error('里面没有小日子的数据');
      return { kind: 'text', state, payload: obj };
    }
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
    throw new Error('只支持 .json / .html / .zip');
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
    exportHtml, htmlName, buildHtml,
    exportAtts, attsName,
    exportAll, allName,
    readFile, writeAtts,
    share, download,
    usage, fmtBytes, stamp, dayStamp,
  };
})(window);
