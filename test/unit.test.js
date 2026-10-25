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
    eq('schema', obj.schema, 3);
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

  console.log('\n-- 迁移 --');
  {
    const mw = {};
    load('js/migrate.js', mw);
    const out = mw.Migrate.run({ tasks: [{ id: 'a' }], me: { name: '小樱', face: '🌸' } });
    eq('补 schema', out.schema, 3);
    eq('有任务不再引导', out.onboard.done, true);
    eq('补签名', out.me.sign, '');
    eq('空账号要引导', mw.Migrate.run({ tasks: [], me: { name: 'x', face: '🌸' } }).onboard.done, false);
    eq('附件补 backed', mw.Migrate.run({ schema: 2, tasks: [], reviews: [{ atts: [{ id: 'z' }] }] }).reviews[0].atts[0].backed, 0);
  }

  console.log('\n合计 ' + (pass + fail) + ' 项 · 通过 ' + pass + ' · 失败 ' + fail + '\n');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('崩溃：', e); process.exit(1); });
