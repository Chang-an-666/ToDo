#!/usr/bin/env node
/**
 * 一键发布到 Cloudflare Pages
 *
 *   npm run ship            打包 + 发布到生产
 *   npm run pack            只打包到 .publish，不发布
 *   npm run ship -- --dry   同上（只打包）
 *
 * 环境变量
 *   PAGES_PROJECT   Pages 项目名（默认 xiaorizi，全局唯一，被占就换一个）
 *   PAGES_BRANCH    生产分支（默认自动读项目的 production_branch，读不到用 master）
 *   CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID   无人值守时用
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, '.publish');
const PROJECT = process.env.PAGES_PROJECT || 'xiaorizi';
let BRANCH = process.env.PAGES_BRANCH || '';
const DRY = process.argv.includes('--dry') || process.argv.includes('--pack');

/* 只发布这些，测试、README、.git 一律不上传 */
const KEEP = [
  'index.html',
  'styles.css',
  'app.js',
  'sw.js',
  'manifest.webmanifest',
  '_headers',
  '_redirects',
  '.nojekyll',
  'icons',
  'js',
];

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* 注意：本环境把 fs.rmSync 换成了「移到回收站」的 shim，删目录会失败，
   所以逐文件 unlink，最后 rmdir */
function clearDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    let st;
    try { st = fs.lstatSync(p); } catch (e) { continue; }
    if (st.isDirectory()) {
      clearDir(p);
      try { fs.rmdirSync(p); } catch (e) { }
    } else {
      try { fs.unlinkSync(p); } catch (e) { }
    }
  }
}

function build() {
  clearDir(OUT);
  fs.mkdirSync(OUT, { recursive: true });

  const missing = [];
  let files = 0;
  let bytes = 0;

  const walk = (dir, base) => {
    for (const name of fs.readdirSync(dir)) {
      const src = path.join(dir, name);
      const rel = base ? `${base}/${name}` : name;
      const st = fs.statSync(src);
      if (st.isDirectory()) {
        walk(src, rel);
      } else {
        const dst = path.join(OUT, rel);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        try { fs.unlinkSync(dst); } catch (e) { }
        fs.copyFileSync(src, dst);
        files++;
        bytes += st.size;
      }
    }
  };

  for (const item of KEEP) {
    const src = path.join(ROOT, item);
    if (!fs.existsSync(src)) { missing.push(item); continue; }
    const st = fs.statSync(src);
    if (st.isDirectory()) walk(src, item);
    else {
      fs.copyFileSync(src, path.join(OUT, item));
      files++;
      bytes += st.size;
    }
  }

  console.log(`\n  打包完成 → .publish`);
  console.log(`  ${files} 个文件 · ${(bytes / 1024).toFixed(0)} KB`);
  if (missing.length) console.log(`  跳过（不存在）：${missing.join(', ')}`);
  return { files, bytes };
}

function runWrangler(args) {
  /* 本地装了就用本地（npx 在国内经常拉不下来） */
  const local = path.join(ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
  const isWin = process.platform === 'win32';
  const opt = { stdio: 'inherit', cwd: ROOT, env: process.env };
  if (fs.existsSync(local)) return spawnSync(process.execPath, [local, ...args], opt);
  return spawnSync(isWin ? 'npx.cmd' : 'npx', ['--yes', 'wrangler@latest', ...args], Object.assign({}, opt, { shell: isWin }));
}

/* 问 Cloudflare“这个项目的生产分支叫什么”，避免推成 preview */
async function resolveBranch() {
  if (BRANCH) return BRANCH;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const acc = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (token && acc && typeof fetch === 'function') {
    try {
      const r = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${acc}/pages/projects/${PROJECT}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const j = await r.json();
      const b = j && j.result && j.result.production_branch;
      if (b) return b;
    } catch (e) { }
  }
  return 'master';
}

async function main() {
  console.log('\n  小日子 · 发布到 Cloudflare Pages');
  console.log('  ' + '-'.repeat(42));

  const info = build();
  if (!info.files) {
    console.error('\n  没东西可发布，检查目录是不是被清空了。\n');
    process.exit(1);
  }

  if (DRY) {
    console.log('\n  只打包，没有发布。\n');
    return;
  }

  BRANCH = await resolveBranch();

  const hasToken = !!process.env.CLOUDFLARE_API_TOKEN;
  console.log(`\n  项目：${PROJECT}`);
  console.log(`  分支：${BRANCH}（production）`);
  console.log(`  认证：${hasToken ? '使用 CLOUDFLARE_API_TOKEN' : '使用本机 wrangler 登录态'}`);
  console.log('\n  正在上传…\n');

  /* 分支必须和生产分支一致，否则会被当成 preview，生产域名不更新 */
  const r = runWrangler([
    'pages', 'deploy', '.publish',
    `--project-name=${PROJECT}`,
    `--branch=${BRANCH}`,
    '--commit-dirty=true',
  ]);

  if (r.status !== 0) {
    console.error('\n  发布失败。常见原因：');
    console.error('   · 非交互环境（脚本 / 自动化里跑）：必须先设 CLOUDFLARE_API_TOKEN');
    console.error('       export CLOUDFLARE_API_TOKEN=...     # 权限只要 Pages: Edit');
    console.error('       export CLOUDFLARE_ACCOUNT_ID=7b570ade4f442204fb251b3a8bfef386');
    console.error('   · 手动在自己终端里跑：先 npx wrangler login 一次，之后都能直接用');
    console.error(`   · 项目名 ${PROJECT} 已被别人占用：换一个，PAGES_PROJECT=别的名字 npm run ship`);
    console.error('   · 首次需要先建项目：npx wrangler pages project create ' + PROJECT);
    console.error('');
    process.exit(r.status || 1);
  }

  await verifyProd();

  const url = process.env.PAGES_URL || `https://${PROJECT}.pages.dev`;
  console.log('\n  ' + '-'.repeat(42));
  console.log(`  发布完成 · ${stamp()}`);
  console.log(`  网址（永远不变）：${url}`);
  console.log('  手机上：Safari 打开 → 分享 → 添加到主屏幕\n');
}

/* 确认这次真的进了 production，而不是 preview */
async function verifyProd() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const acc = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !acc || typeof fetch !== 'function') return;
  try {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${acc}/pages/projects/${PROJECT}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const j = await r.json();
    const d = (j && j.result && j.result.latest_deployment) || {};
    const env = d.environment;
    if (env === 'production') console.log('\n  ✓ 已确认是 production 部署（正式域名已更新）');
    else console.log(`\n  ⚠️ 这次是 ${env || '未知'} 部署，正式域名不会更新。生产分支应为 ${BRANCH}`);
  } catch (e) { }
}

main();
