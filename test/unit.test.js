/* 纯前端模块的单元测试：在 Node 里跑 zip / backup / migrate 的文件解析 */
'use strict';
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
const ok = (n, c, extra) => {
  if (c) { pass++; console.log('  OK   ' + n); }
  else { fail++; console.log('  FAIL ' + n + (extra ? ' :: ' + extra : '')); }
};
const eq = (n, a, b) => ok(n + ' = ' + JSON.stringify(b), JSON.stringify(a) === JSON.stringify(b), 'got ' + JSON.stringify(a));

function load(file, win) {
  const code = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  new Function('window', code)(win);
  return win;
}

(async () => {
  const win = { navigator: {} };
  load('js/zip.js', win);
  load('js/backup.js', win);
  const { Zip, Backup } = win;

  console.log('\n-- zip --');
  {
    const txt = '你好，小日子 🌷';
    const bin = new Uint8Array([0, 1, 2, 250, 255, 128]);
    const blob = await Zip.make([
      { name: 'a.txt', data: txt },
      { name: 'dir/b.bin', data: bin },
      { name: '中文名.json', data: '{"x":1}' },
    ]);
    ok('打包出 Blob', blob instanceof Blob && blob.size > 100);
    const list = await Zip.read(new File([blob], 't.zip', { type: 'application/zip' }));
    eq('条目数', list.length, 3);
    const a = list.find((x) => x.name === 'a.txt');
    eq('中文内容无损', new TextDecoder().decode(a.data), txt);
    eq('二进制无损', Array.from(list.find((x) => x.name === 'dir/b.bin').data), [0, 1, 2, 250, 255, 128]);
    ok('中文文件名', !!list.find((x) => x.name === '中文名.json'));
    eq('二次读取', (await Zip.read(new File([blob], 't2.zip'))).length, 3);
  }

  console.log('\n-- 文字包 --');
  {
    const state = { tasks: [{ id: 't1', title: '写代码', date: '2026-10-25' }], reviews: [], wishes: [], study: { sessions: [] } };
    const blob = Backup.exportText(state, '长安');
    ok('是 JSON', blob.type.includes('json'));
    const obj = JSON.parse(await blob.text());
    eq('schema', obj.schema, 4);
    eq('kind', obj.kind, 'text');
    eq('任务数', obj.counts.tasks, 1);
    eq('state 完整', obj.state.tasks[0].title, '写代码');
    ok('文件名带日期', /小日子-文字-\d{8}\.json/.test(Backup.textName()));
  }

  console.log('\n-- 导入 json --');
  {
    const payload = { app: 'xiaorizi', kind: 'text', schema: 3, state: { tasks: [{ id: 'x', title: 'a' }] } };
    const r = await Backup.readFile(new File([JSON.stringify(payload)], 'backup.json'));
    eq('识别为文字包', r.kind, 'text');
    eq('拿到状态', r.state.tasks.length, 1);
    let t1 = false; try { await Backup.readFile(new File(['{oops'], 'bad.json')); } catch (e) { t1 = true; }
    ok('坏 JSON 报错', t1);
    let t2 = false; try { await Backup.readFile(new File(['{"a":1}'], 'no.json')); } catch (e) { t2 = true; }
    ok('缺 tasks 报错', t2);
  }

  console.log('\n-- 导入 zip 全量包 --');
  {
    const state = { tasks: [{ id: 't1', title: '任务' }], reviews: [] };
    const zipBlob = await Zip.make([
      { name: 'state.json', data: JSON.stringify({ app: 'xiaorizi', kind: 'text', schema: 3, state }) },
      {
        name: 'manifest.json',
        data: JSON.stringify({
          app: 'xiaorizi', kind: 'atts', schema: 3,
          items: [{ id: 'att1', kind: 'audio', name: '录音.webm', mime: 'audio/webm', size: 4, dur: 3, date: '2026-10-25', file: 'attachments/att1.webm' }],
        }),
      },
      { name: 'attachments/att1.webm', data: new Uint8Array([1, 2, 3, 4]) },
    ]);
    const r = await Backup.readFile(new File([zipBlob], 'all.zip'));
    eq('识别为全量包', r.kind, 'all');
    eq('状态恢复', r.state.tasks[0].title, '任务');
    eq('附件数量', r.atts.length, 1);
    eq('附件 id', r.atts[0].id, 'att1');
    eq('附件 mime', r.atts[0].blob.type, 'audio/webm');
    eq('附件字节', r.atts[0].blob.size, 4);
    eq('附件名字', r.atts[0].meta.name, '录音.webm');
  }

  console.log('\n-- 可阅读的 HTML 备份 --');
  {
    const state = {
      schema: 4,
      me: { name: '长安', face: '🌸' },
      tasks: [
        { id: 't1', title: '把周报写完', date: '2026-10-25', done: true, tag: '工作' },
        { id: 't2', title: '买花', date: '2026-10-26', done: false },
      ],
      reviews: [{ id: 'r1', type: 'day', date: '2026-10-25', mood: 'happy', text: '今天有点累，但还是把事做完了。' }],
      wishes: [{ id: 'w1', title: '妈妈的生日', date: '2026-11-02', icon: '🎂', yearly: true }],
      study: { sessions: [{ id: 's1', sec: 3600 }] },
      moods: { '2026-10-25': 'happy' },
    };
    const blob = Backup.exportHtml(state, '长安');
    const html = await blob.text();
    ok('是 html', blob.type.indexOf('text/html') === 0);
    ok('给人看的正文', html.includes('把周报写完') && html.includes('把事做完了'));
    ok('重要日子也在', html.includes('妈妈的生日'));
    ok('内嵌数据', /<script type="application\/json" id="xrz-data">/.test(html));
    ok('文件名', /小日子-可阅读-\d{8}\.html/.test(Backup.htmlName()));

    /* 关键：它既是给人看的文件，也是备份 —— 必须能导回来 */
    const back = await Backup.readFile(new File([blob], '小日子-可阅读-20261027.html', { type: 'text/html' }));
    eq('HTML 能导回：kind', back.kind, 'text');
    eq('HTML 能导回：任务数', back.state.tasks.length, 2);
    eq('HTML 能导回：标题', back.state.tasks[1].title, '买花');
    eq('HTML 能导回：复盘', back.state.reviews[0].text, '今天有点累，但还是把事做完了。');
    eq('HTML 能导回：纪念日', back.state.wishes[0].title, '妈妈的生日');
    eq('HTML 能导回：state 一致', JSON.stringify(back.state), JSON.stringify(state));

    /* 标题里塞 </script> 不能把文件截断，也不能执行 */
    const evil = {
      schema: 4, me: { name: '<img src=x onerror=alert(1)>' }, tasks: [
        { id: 'e1', title: '</script><script>alert(1)</script>', date: '2026-10-25', done: false },
        { id: 'e2', title: 'a & b < c > d', date: '2026-10-26', done: false },
      ], reviews: [{ id: 'er', type: 'day', date: '2026-10-25', text: '</script>\n<p>hi</p>' }],
      wishes: [], study: { sessions: [] },
    };
    const evilHtml = await (await Backup.exportHtml(evil, 'x')).text();
    eq('正文里 </script> 出现次数 = 1（只有收尾那个）', (evilHtml.match(/<\/script>/g) || []).length, 1);
    ok('正文转义了 <', evilHtml.includes('&lt;/script&gt;'));
    const seg = evilHtml.split('id="xrz-data">')[1].split('</script>')[0];
    ok('内嵌 JSON 里没有裸 <', seg.indexOf('<') < 0);
    const segObj = JSON.parse(seg);
    eq('内嵌 JSON 能解析', segObj.state.tasks[0].title, '</script><script>alert(1)</script>');
    const evilBack = await Backup.readFile(new File([evilHtml], 'evil.html', { type: 'text/html' }));
    eq('怪字符原样回来', evilBack.state.tasks[0].title, '</script><script>alert(1)</script>');
    eq('特殊符号原样回来', evilBack.state.tasks[1].title, 'a & b < c > d');

    let t3 = false;
    try { await Backup.readFile(new File(['<html>没有数据</html>'], 'none.html', { type: 'text/html' })); } catch (e) { t3 = true; }
    ok('普通网页报错', t3);
  }

  console.log('\n-- 全量包里带一份可读网页 --');
  {
    const state = { schema: 4, tasks: [{ id: 't1', title: '任务' }], reviews: [] };
    const r = await Backup.exportAll(state, [], '长安');
    const list = await Zip.read(new File([r.blob], 'all.zip'));
    const names = list.map((x) => x.name);
    ok('有 state.json', names.includes('state.json'));
    ok('有 index.html', names.includes('index.html'));
    const idx = list.find((x) => x.name === 'index.html');
    const html = new TextDecoder().decode(idx.data);
    ok('zip 里的网页能读', html.includes('任务') && html.includes('id="xrz-data"'));
    const back = await Backup.readFile(new File([r.blob], 'all.zip'));
    eq('全量包仍可导回', back.state.tasks[0].title, '任务');
  }

  console.log('\n-- 迁移 --');
  {
    const mw = {};
    load('js/migrate.js', mw);
    const out = mw.Migrate.run({ tasks: [{ id: 'a' }], me: { name: '小樱', face: '🌸' } });
    eq('补 schema', out.schema, 4);
    eq('有任务不再引导', out.onboard.done, true);
    eq('补签名', out.me.sign, '');
    eq('空账号要引导', mw.Migrate.run({ tasks: [], me: { name: 'x', face: '🌸' } }).onboard.done, false);
    eq('附件补 backed', mw.Migrate.run({ schema: 2, tasks: [], reviews: [{ atts: [{ id: 'z' }] }] }).reviews[0].atts[0].backed, 0);
    /* v3 → v4：三段合成一段，旧字段留着不删 */
    const v3 = mw.Migrate.run({
      schema: 3, tasks: [],
      reviews: [{ id: 'r', type: 'day', date: '2026-10-25', good: '早起了', words: '别急', next: '先写最难那件' }],
    });
    eq('三段拼成一段', v3.reviews[0].text, '早起了\n别急\n先写最难那件');
    eq('旧字段保留', v3.reviews[0].good, '早起了');
    const v4 = mw.Migrate.run({ schema: 4, tasks: [], reviews: [{ id: 'r', date: '2026-10-25', text: '已经写好的' }] });
    eq('已迁移的不动', v4.reviews[0].text, '已经写好的');
  }

  console.log('\n合计 ' + (pass + fail) + ' 项 · 通过 ' + pass + ' · 失败 ' + fail + '\n');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('崩溃：', e); process.exit(1); });
