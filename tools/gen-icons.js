#!/usr/bin/env node
/**
 * 生成应用图标（纯 Node，无依赖）：512 / 192 / 180 / 32 四种尺寸 PNG
 *   node tools/gen-icons.js
 * 画法：粉紫渐变圆角方块 + 一朵白色小花，4x 超采样抗锯齿。
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- PNG 编码 ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- 画图 ---------- */
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* 圆角矩形内部判定 */
function inRoundRect(x, y, w, h, r) {
  const dx = Math.max(r - x, 0, x - (w - r));
  const dy = Math.max(r - y, 0, y - (h - r));
  if (dx <= 0 || dy <= 0) return x >= 0 && x <= w && y >= 0 && y <= h;
  return dx * dx + dy * dy <= r * r;
}

function render(size) {
  const S = 4;                       // 超采样
  const n = size * S;
  const out = Buffer.alloc(n * n * 4);
  const r = n * 0.235;               // 圆角半径

  /* 渐变：樱花粉 → 丁香紫，左上到右下 */
  const c1 = [255, 182, 200], c2 = [198, 182, 255];

  const cx = n / 2, cy = n / 2;
  const petalR = n * 0.135;          // 花瓣半径
  const petalD = n * 0.135;          // 花瓣中心到花心距离
  const coreR = n * 0.072;

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = (y * n + x) * 4;
      if (!inRoundRect(x, y, n, n, r)) { out[i + 3] = 0; continue; }

      const t = clamp((x / n) * 0.55 + (y / n) * 0.45, 0, 1);
      let cr = lerp(c1[0], c2[0], t);
      let cg = lerp(c1[1], c2[1], t);
      let cb = lerp(c1[2], c2[2], t);

      /* 顶部柔光 */
      const glow = clamp(1 - (y / n) * 1.6, 0, 1) * 0.16;
      cr = lerp(cr, 255, glow); cg = lerp(cg, 255, glow); cb = lerp(cb, 255, glow);

      /* 白色小花：5 瓣 */
      let inPetal = false;
      for (let k = 0; k < 5; k++) {
        const a = (-Math.PI / 2) + k * (Math.PI * 2 / 5);
        const px = cx + Math.cos(a) * petalD;
        const py = cy + Math.sin(a) * petalD;
        if ((x - px) ** 2 + (y - py) ** 2 <= petalR * petalR) { inPetal = true; break; }
      }
      const dCore = (x - cx) ** 2 + (y - cy) ** 2;

      if (dCore <= coreR * coreR) {
        /* 花心：暖黄 */
        cr = 255; cg = 205; cb = 120;
      } else if (inPetal) {
        cr = 255; cg = 252; cb = 255;
      }

      out[i] = cr; out[i + 1] = cg; out[i + 2] = cb; out[i + 3] = 255;
    }
  }

  /* box filter 缩小 */
  const res = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r0 = 0, g0 = 0, b0 = 0, a0 = 0;
      for (let dy = 0; dy < S; dy++) {
        for (let dx = 0; dx < S; dx++) {
          const i = ((y * S + dy) * n + (x * S + dx)) * 4;
          const al = out[i + 3] / 255;
          r0 += out[i] * al; g0 += out[i + 1] * al; b0 += out[i + 2] * al; a0 += al;
        }
      }
      const cnt = S * S;
      const i2 = (y * size + x) * 4;
      const a = a0 / cnt;
      res[i2] = a > 0 ? r0 / a0 : 0;
      res[i2 + 1] = a > 0 ? g0 / a0 : 0;
      res[i2 + 2] = a > 0 ? b0 / a0 : 0;
      res[i2 + 3] = Math.round(a * 255);
    }
  }
  return res;
}

/* ---------- 输出 ---------- */
const outDir = path.join(__dirname, '..', 'dist', 'icons');
fs.mkdirSync(outDir, { recursive: true });

for (const size of [512, 192, 180, 32]) {
  const buf = encodePNG(size, size, render(size));
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`  ${name}  ${size}×${size}  ${(buf.length / 1024).toFixed(1)} KB`);
}
console.log('\n图标已生成到 dist/icons/');
