/* ==========================================================
   Migrate：数据结构版本与迁移
   代码随时可以更新，但用户手里是旧数据 —— 这里保证旧数据能读
   ========================================================== */
(function (global) {
  'use strict';
  const SCHEMA = 3;

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

    return state;
  }

  global.Migrate = { SCHEMA, run };
})(window);
