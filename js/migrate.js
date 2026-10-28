/* ==========================================================
   Migrate：数据结构版本与迁移
   代码随时可以更新，但用户手里是旧数据 —— 这里保证旧数据能读
   ========================================================== */
(function (global) {
  'use strict';
  const SCHEMA = 4;

  function run(state) {
    if (!state || typeof state !== 'object') return state;
    if (!state.schema) state.schema = 1;

    /* v1 → v2：补新手引导标记 */
    if (state.schema < 2) {
      if (!state.onboard) {
        state.onboard = { v: 1, done: (state.tasks || []).length > 0 };
      }
      state.schema = 2;
    }

    /* v2 → v3：资料字段 + 附件归档标记 */
    if (state.schema < 3) {
      state.me = state.me || { name: '小樱', face: '🌸' };
      if (typeof state.me.sign !== 'string') state.me.sign = '';
      if (typeof state.me.avatar !== 'string') state.me.avatar = '';
      for (const r of state.reviews || []) {
        for (const a of r.atts || []) {
          if (a.backed === undefined) a.backed = 0;   /* 0 = 只在本机 */
        }
      }
      state.schema = 3;
    }

    /* v3 → v4：复盘从三个字段合并成一段自由文字（旧字段保留，不删） */
    if (state.schema < 4) {
      for (const r of state.reviews || []) {
        if (typeof r.text !== 'string') {
          r.text = [r.good, r.words, r.next].filter(Boolean).join('\n');
        }
      }
      state.schema = 4;
    }

    /* 兜底：手动改过的 / 别处导入的数据可能缺字段，别让一条缺字段把整页渲染炸掉 */
    for (const t of state.tasks || []) {
      if (!t.priority || !['high', 'mid', 'low'].includes(t.priority)) t.priority = 'mid';
      if (typeof t.title !== 'string') t.title = '';
      if (!t.date) t.date = new Date().toISOString().slice(0, 10);
      if (t.done === undefined) t.done = false;
    }
    for (const r of state.reviews || []) {
      if (typeof r.text !== 'string') r.text = [r.good, r.words, r.next].filter(Boolean).join('\n');
      if (!r.mood) r.mood = 'happy';
    }

    return state;
  }

  global.Migrate = { SCHEMA, run };
})(window);
