/* ==========================================================
   小日子 · 温柔计划本
   纯前端原型 · 数据保存在浏览器 localStorage
   ========================================================== */

/* ---------- 日期小工具 ---------- */
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => fmt(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return fmt(d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const dow = (s) => (parse(s).getDay() + 6) % 7;
const weekStart = (s) => addDays(s, -dow(s));
const monthStart = (s) => { const d = parse(s); return fmt(new Date(d.getFullYear(), d.getMonth(), 1)); };
const monthEnd = (s) => { const d = parse(s); return fmt(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
const CN = ['一', '二', '三', '四', '五', '六', '日'];
const monthText = (s) => { const d = parse(s); return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月`; };
const dayText = (s) => { const d = parse(s); return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 周${CN[dow(s)]}`; };
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- 常量 ---------- */
const TAGS = [
  { k: '生活', e: '🍰' }, { k: '学习', e: '📚' }, { k: '工作', e: '💼' },
  { k: '健康', e: '🌸' }, { k: '朋友', e: '💌' }, { k: '想做的事', e: '✨' },
];
/* 自定义小篮子 */
const BK_EMOJIS = ['🧺', '🎀', '🍰', '📚', '💼', '🌸', '💌', '✨', '🎨', '🏃',
  '🎵', '🍀', '✈️', '🎁', '🧸', '☕', '🐾', '🌙', '💰', '🧹'];
const BK_COLORS = [
  { k: 'pink', n: '蜜桃粉' }, { k: 'lav', n: '薰衣草' }, { k: 'mint', n: '薄荷绿' },
  { k: 'peach', n: '杏子橙' }, { k: 'sky', n: '晴空蓝' },
];
const allTags = () => TAGS.concat((state && state.baskets) || []);
const tagOf = (k) => allTags().find((x) => x.k === k);

/* ---------- 备考：默认栏目（2026 国考公共科目笔试大纲口径） ---------- */
const SBJ_DEF = [
  { id: 'yanyu', n: '言语理解', e: '📖', c: 'pink', g: 'xingce', target: 40, tip: '片段阅读 · 选词填空 · 语句排序' },
  { id: 'panduan', n: '判断推理', e: '🧩', c: 'lav', g: 'xingce', target: 45, tip: '图形 · 定义 · 类比 · 逻辑' },
  { id: 'ziliao', n: '资料分析', e: '📊', c: 'mint', g: 'xingce', target: 40, tip: '速算与公式，练到手熟为止' },
  { id: 'shuliang', n: '数量关系', e: '🔢', c: 'peach', g: 'xingce', target: 35, tip: '工程 · 行程 · 排列组合' },
  { id: 'changshi', n: '常识判断', e: '🌍', c: 'sky', g: 'xingce', target: 20, tip: '碎片时间刷题就好' },
  { id: 'zhengzhi', n: '政治理论', e: '🚩', c: 'pink', g: 'xingce', target: 20, tip: '每日一条，慢慢积累' },
  { id: 'gainuo', n: '归纳概括', e: '📝', c: 'mint', g: 'shenlun', target: 30, tip: '踩点意识是第一位的' },
  { id: 'fenxi', n: '综合分析', e: '🔍', c: 'lav', g: 'shenlun', target: 30, tip: '是什么 · 为什么 · 怎么办' },
  { id: 'duice', n: '提出对策', e: '💡', c: 'peach', g: 'shenlun', target: 30, tip: '对策要具体、要能落地' },
  { id: 'guanche', n: '贯彻执行', e: '📋', c: 'sky', g: 'shenlun', target: 30, tip: '格式分先拿到手' },
  { id: 'xiezuo', n: '文章写作', e: '✍️', c: 'pink', g: 'shenlun', target: 45, tip: '标题亮观点，结尾要回扣' },
];
const SBJ_GROUPS = [
  { k: 'xingce', n: '行测', e: '✏️' },
  { k: 'shenlun', n: '申论', e: '📄' },
  { k: 'own', n: '我自己加的', e: '🧺' },
];
const SBJ_PLANS = [15, 25, 45, 60, 90];
const RATE_EMO = ['😵', '😕', '🙂', '😊', '🤩'];
const RATE_NAME = ['完全没懂', '有点懵', '还行吧', '挺顺的', '通透了'];

/* ---------- 重复频率 ---------- */
const REP_UNIT = { day: '天', week: '周', month: '个月' };
const REP_PRESET = [
  { k: 'none', n: '只做一次' },
  { k: 'day:1', n: '每天' },
  { k: 'week:1', n: '每周' },
  { k: 'month:1', n: '每月' },
];
const repText = (rep) => {
  if (!rep || !rep.unit) return '';
  const n = rep.every || 1;
  if (rep.unit === 'day') return n === 1 ? '每天' : `每 ${n} 天`;
  if (rep.unit === 'week') return n === 1 ? '每周' : `每 ${n} 周`;
  return n === 1 ? '每月' : `每 ${n} 个月`;
};
/* 从某天按规则推下一次 */
function nextRep(date, rep) {
  if (!rep || !rep.unit) return null;
  const n = Math.max(1, rep.every || 1);
  if (rep.unit === 'day') return addDays(date, n);
  if (rep.unit === 'week') return addDays(date, n * 7);
  const d = parse(date);
  const m = d.getMonth() + n;
  const y = d.getFullYear() + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  const last = new Date(y, mm + 1, 0).getDate();
  return fmt(new Date(y, mm, Math.min(d.getDate(), last)));
}
/* 从一条任务往后铺满未来 days 天 */
function expandRep(t, days = 90) {
  if (!t || !t.rep || !t.rep.unit) return 0;
  if (!t.sid) t.sid = t.id;
  const limit = addDays(today(), days);
  let d = nextRep(t.date, t.rep), made = 0, guard = 0;
  while (d && d <= limit && guard++ < 500) {
    if (!state.tasks.some((x) => x.sid === t.sid && x.date === d)) {
      state.tasks.push({
        id: uid(), title: t.title, date: d, time: t.time, tag: t.tag,
        priority: t.priority, note: t.note, done: false,
        rep: { unit: t.rep.unit, every: t.rep.every }, sid: t.sid,
      });
      made++;
    }
    d = nextRep(d, t.rep);
  }
  return made;
}
/* 启动时把每个系列的尾巴补到 90 天后 */
function fillAllRepeats() {
  const limit = addDays(today(), 90);
  const last = {};
  state.tasks.forEach((t) => {
    if (!t.rep || !t.rep.unit) return;
    if (!t.sid) t.sid = t.id;
    if (!last[t.sid] || t.date > last[t.sid].date) last[t.sid] = t;
  });
  Object.values(last).forEach((t) => {
    let d = nextRep(t.date, t.rep), guard = 0;
    while (d && d <= limit && guard++ < 500) {
      if (!state.tasks.some((x) => x.sid === t.sid && x.date === d)) {
        state.tasks.push({
          id: uid(), title: t.title, date: d, time: t.time, tag: t.tag,
          priority: t.priority, note: t.note, done: false,
          rep: { unit: t.rep.unit, every: t.rep.every }, sid: t.sid,
        });
      }
      d = nextRep(d, t.rep);
    }
  });
}

/* ---------- 小花园：植物图鉴 ---------- */
const PLANTS = [
  { k: 'daisy', n: '小雏菊', need: [3, 5, 8], emo: ['🌱', '🌿', '🌼'], c: 'var(--sun)', cost: 0, tip: '晒晒太阳就会笑的小家伙' },
  { k: 'clover', n: '四叶草', need: [4, 6, 9], emo: ['🌱', '☘️', '🍀'], c: 'var(--mint)', cost: 12, tip: '听说找到四片叶子会有好运' },
  { k: 'tulip', n: '郁金香', need: [5, 7, 10], emo: ['🌱', '🌷', '🌷'], c: 'var(--pink)', cost: 18, tip: '把心事小声说给它听' },
  { k: 'sakura', n: '樱花草', need: [6, 9, 12], emo: ['🌱', '🌸', '🌸'], c: 'var(--pink)', cost: 26, tip: '春天的小尾巴，风一吹就晃' },
  { k: 'sun', n: '小太阳', need: [7, 10, 14], emo: ['🌱', '🌻', '🌻'], c: 'var(--sun)', cost: 34, tip: '永远朝着光的方向长' },
  { k: 'lav', n: '薰衣草', need: [8, 11, 15], emo: ['🌱', '🌾', '💜'], c: 'var(--lav)', cost: 42, tip: '睡前闻一闻会做好梦' },
  { k: 'berry', n: '小草莓', need: [9, 12, 16], emo: ['🌱', '🍃', '🍓'], c: 'var(--peach)', cost: 52, tip: '甜甜的，像今天这样子' },
  { k: 'star', n: '星星花', need: [10, 14, 18], emo: ['🌱', '✨', '🌟'], c: 'var(--sky)', cost: 64, tip: '只在很努力的日子才会开' },
];
const plantOf = (k) => PLANTS.find((p) => p.k === k) || PLANTS[0];

const RANKS = [
  { lv: 1, n: '小苗圃', plots: 4, need: 0, tip: '先把第一块地种满吧' },
  { lv: 2, n: '小花园', plots: 6, need: 40, tip: '篱笆往后退了一点' },
  { lv: 3, n: '花田', plots: 9, need: 120, tip: '风里有淡淡的花香' },
  { lv: 4, n: '小秘境', plots: 12, need: 260, tip: '角落里长出了会发光的草' },
  { lv: 5, n: '花之森', plots: 16, need: 480, tip: '这里已经很像梦了' },
];
const rankOf = (total) => RANKS.slice().reverse().find((r) => total >= r.need) || RANKS[0];

const WEATHERS = [
  { k: 'sun', n: '晴天', e: '☀️', tip: '阳光软软的，花会多长一点点' },
  { k: 'cloud', n: '多云', e: '☁️', tip: '不冷不热，适合慢慢来' },
  { k: 'rain', n: '小雨', e: '🌦️', tip: '免费浇水一次，快去谢谢云朵' },
  { k: 'wind', n: '微风', e: '🍃', tip: '风把花瓣吹得晃呀晃' },
  { k: 'star', n: '星夜', e: '🌙', tip: '晚上的花园会小声唱歌' },
];
const weatherOf = (d) => {
  const n = d.split('-').reduce((a, b) => a + Number(b), 0);
  return WEATHERS[n % WEATHERS.length];
};

const BADGES = [
  { k: 'first', n: '第一滴水', e: '💧', d: '完成第一件小事', test: (g) => g.total > 0 },
  { k: 'sow', n: '播种的人', e: '🌱', d: '种下第一株植物', test: (g) => g.planted > 0 },
  { k: 'bloom1', n: '花开啦', e: '🌸', d: '收获第一朵花', test: (g) => g.harvest > 0 },
  { k: 'bloom5', n: '小有花田', e: '💐', d: '累计收获 5 朵花', test: (g) => g.harvest >= 5 },
  { k: 'kinds4', n: '收集癖', e: '📖', d: '图鉴点亮 4 种', test: (g) => Object.keys(g.dex).length >= 4 },
  { k: 'streak7', n: '一周不断', e: '🔥', d: '连续 7 天有完成', test: (g) => g.streak >= 7 },
  { k: 'drops200', n: '露珠富翁', e: '🫧', d: '累计获得 200 滴露珠', test: (g) => g.total >= 200 },
  { k: 'lv5', n: '花之森主', e: '🌳', d: '花园升到 Lv.5', test: (g) => g.lv >= 5 },
  { k: 'study1', n: '开卷有益', e: '📖', d: '完成第一段专注学习',
    test: () => ((state.study && state.study.sessions) || []).filter((x) => !x.drop).length >= 1 },
  { k: 'rev5', n: '复盘星人', e: '📝', d: '累计写下 5 段备考复盘',
    test: () => ((state.study && state.study.reviews) || []).length >= 5 },
  { k: 'study30', n: '稳住节奏', e: '✏️', d: '累计 30 段专注学习',
    test: () => ((state.study && state.study.sessions) || []).filter((x) => !x.drop).length >= 30 },
];

/* 完成一件小事能换多少露珠 */
const dropsFor = (t) => {
  let n = 3;
  if (t.priority === 'high') n += 2;
  else if (t.priority === 'mid') n += 1;
  if (t.rep && t.rep.unit) n += 1;          // 重复的小事更值得
  return n;
};
/* 取第一个完整字形（带变体选择符 / ZWJ 的 emoji 不被截断） */
function firstGrapheme(s) {
  const v = String(s || '').trim(); if (!v) return '';
  try {
    const seg = new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(v);
    const it = seg[Symbol.iterator]().next();
    if (!it.done) return it.value.segment;
  } catch (e) { }
  return Array.from(v)[0];
}
const PRI = { high: { t: '先做这个', e: '🌶️' }, mid: { t: '慢慢来', e: '🌼' }, low: { t: '有空再说', e: '🍃' } };
const MOODS = { great: '🤩', happy: '😊', calm: '🙂', tired: '😪', down: '🥺' };
const MOOD_NAME = { great: '超有劲', happy: '开心', calm: '平静', tired: '有点累', down: '小难过' };
const FACES = ['🌸', '🐰', '🍑', '🌷', '🐱', '🍓', '🦊', '⭐', '🧸', '☁️'];
const QUOTES = [
  '慢一点也没关系，你已经在路上了呀。',
  '今天也要好好吃饭、好好睡觉，照顾好自己~',
  '不必事事完美，做完就值得给自己一朵小花。',
  '累了就歇一会儿，事情不会跑掉的。',
  '你今天已经比昨天多走了一小步呢。',
  '把大事拆成小事，一件一件来就好啦。',
  '开心的事记得写下来，难过的事就让它过去。',
  '先做完最重要的一件，剩下的都会顺起来。',
  '给自己一点耐心，花开也需要时间。',
  '今天也要元气满满哦，加油小可爱！',
];
const PRAISE = [
  '太棒啦！奖励你一朵小花 🌸', '完成一件就轻松一点~', '你好厉害呀 ✨',
  '又前进一小步，真好 🌷', '记得夸夸自己，你很努力了', '好棒好棒，给你鼓个掌 👏',
  '这样就又离目标近一点啦 🍰',
];
const KEY = 'xiaorizi.v2';

/* ---------- 状态 ---------- */
let state = null;
let ui = {
  view: 'today', cal: 'month', anchor: today(), sel: today(), reviewTab: 'day',
  cur: today(),        // 首页正在看哪一天
  heroPop: null,       // 顶部卡展开的小面板：date | progress | wish
  wishView: 'grid',    // 纪念日展示样式：grid | list | fold | mini
  wishOpen: {},        // 纪念日条目展开的详情
  wishFold: {},        // 折叠视图里展开的分组
  basket: null,        // 正在编辑的小篮子
  studySid: null,      // 备考：正在打开哪个栏目
  studyRange: 'today', // 备考汇总范围：today | week | month
  studyMode: 'down',   // 计时模式：down 倒计时 | up 正计时
  studyPlan: 25,       // 倒计时分钟
  studyEdit: null,     // 正在编辑的栏目
  dropHelp: false,     // 汇总卡里的露珠小帮助展开与否
  pick: null,          // 日历里点开的那一天（null = 还没点，不显示清单）
};

function seed() {
  /* 新用户从一张白纸开始，示例内容只在引导里演示 */
  return {
    me: { name: '小樱', face: '🌸' },
    tasks: [], moods: {}, joys: {}, reviews: [], wishes: [],
    settings: { theme: 'day', sideW: 250, collapsed: true },
    study: { subjects: SBJ_DEF.map((s) => ({ ...s, b: 1 })), sessions: [], reviews: [], goal: 180 },
    onboard: { v: 1, done: false },
  };
}
function load() {
  try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) { }
  return seed();
}
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const saveUi = () => save();

/* ==========================================================
   本地模式：没有服务器，数据只存在这台设备
   ========================================================== */
const AUTH = { user: null, ok: false, offline: true };
const APP_VERSION = '3.0.1';

/* 头像 / 昵称 / 签名都以本地 state.me 为准 */
function paintProfile() {
  const av = $('#avatar');
  if (av) {
    if (state.me.avatar) {
      av.textContent = '';
      av.style.backgroundImage = `url("${state.me.avatar}")`;
      av.classList.add('has-img');
    } else {
      av.style.backgroundImage = '';
      av.classList.remove('has-img');
      av.textContent = state.me.face || '🌸';
    }
  }
  const sub = $('#meSub');
  if (sub) {
    sub.textContent = state.me.sign
      || (state.moods[today()] ? '今天心情：' + MOOD_NAME[state.moods[today()]] : '还没有写签名');
  }
  const nm = $('#meName');
  if (nm && document.activeElement !== nm) nm.value = state.me.name || '小樱';
}
function bootLocal() {
  try { state = Migrate.run(state); } catch (e) { console.warn('迁移失败', e); }
  paintProfile();
  paintFootVersion();
  paintStore();
  backupNudge();
}
function paintFootVersion() {
  const el = $('#appVer');
  if (el) el.textContent = 'v' + APP_VERSION;
}
/* 学习报告：用本地数据生成 */
async function srvReport(range) {
  const md = buildAIPrompt(range || ui.studyRange);
  download(`学习报告_${today()}.md`, md, 'text/markdown;charset=utf-8');
}

/* ---------- 新手引导（只出现一次） ---------- */
const GUIDE_STEPS = [
  { t: '从一件很小的事开始', s: '写下今天最想完成的那件，不用多，一件就行。想到什么写什么，回车就记下了。' },
  { t: '做完就点一下小圆圈', s: '每完成一件小事都会换成露珠 💧，攒够了就能去花园种花。' },
  { t: '想学点东西的时候', s: '去「📚 备考」挑一个栏目按下开始，学完还能写一段复盘，露珠会更多。' },
];
let gdStep = 0, gdTimer = null;
function maybeGuide() {
  if (!state.onboard || state.onboard.done) return;
  const gate = $('#authGate');
  if (gate && !gate.classList.contains('hidden')) return;
  openGuide(0);
}
function openGuide(step) {
  gdStep = Math.max(0, Math.min(GUIDE_STEPS.length - 1, step || 0));
  const g = $('#guide'); if (!g) return;
  g.classList.remove('hidden');
  paintGuide();
}
function paintGuide() {
  $$('#guide .gstep').forEach((el) => el.classList.toggle('on', Number(el.dataset.step) === gdStep));
  const cur = GUIDE_STEPS[gdStep];
  $('#gdTitle').textContent = cur.t;
  $('#gdSub').textContent = cur.s;
  $$('#gdDots i').forEach((el, i) => el.classList.toggle('on', i === gdStep));
  $('#gdNext').textContent = gdStep === GUIDE_STEPS.length - 1 ? '开始记录' : '下一步';
  const prev = $('#guide [data-act="guide-prev"]');
  if (prev) prev.classList.toggle('hidden', gdStep === 0);
  clearTimeout(gdTimer);
}
function closeGuide(done) {
  clearTimeout(gdTimer);
  const g = $('#guide'); if (g) g.classList.add('hidden');
  if (done) {
    state.onboard = { v: 1, done: true };
    save();
    renderView();
    toast('就从这一件开始吧，写一句就好 🌱');
    setTimeout(() => { const q = $('#quickAdd'); if (q) q.focus(); }, 420);
  }
}
function guideNext() {
  if (gdStep < GUIDE_STEPS.length - 1) { gdStep++; paintGuide(); }
  else closeGuide(true);
}
function guidePrev() { if (gdStep > 0) { gdStep--; paintGuide(); } }

/* ---------- 我的资料 ---------- */
let pfAvatar = '';
function pfPaint() {
  const box = $('#pfAv'); if (!box) return;
  if (pfAvatar) {
    box.textContent = ''; box.style.backgroundImage = `url("${pfAvatar}")`; box.classList.add('has-img');
  } else {
    box.style.backgroundImage = ''; box.classList.remove('has-img');
    box.textContent = state.me.face || '🌸';
  }
}
function openProfile() {
  pfAvatar = state.me.avatar || '';
  $('#pfName').value = state.me.name || '小樱';
  $('#pfSign').value = state.me.sign || '';
  const u = $('#pfUser'); if (u) u.textContent = '本机（无需账号）';
  const old = $('#pfOld'); if (old) old.value = '';
  const np = $('#pfNew'); if (np) np.value = '';
  pfPaint();
  openMask('#maskProfile');
}
function pfRandomFace() {
  pfAvatar = '';
  const i = FACES.indexOf(state.me.face);
  state.me.face = FACES[(i + 1) % FACES.length];
  save(); pfPaint();
}
function saveProfile() {
  const nickname = $('#pfName').value.trim();
  const signature = $('#pfSign').value.trim();
  if (!nickname) { toast('昵称别空着呀', '👤'); $('#pfName').focus(); return; }
  state.me.name = nickname;
  state.me.sign = signature;
  state.me.avatar = pfAvatar;
  save();
  closeMasks();
  paintProfile();
  schedule('view', renderView); schedule('side', renderSide);
  toast('资料更新好啦', '✨');
}
function changePass() {
  toast('本地版本没有密码，数据就在这台设备里', '💾');
}

/* ---------- 通用 ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sortTasks = (a) => a.slice().sort((x, y) => x.date === y.date
  ? (x.time || 'zz') < (y.time || 'zz') ? -1 : 1 : x.date < y.date ? -1 : 1);
const tasksOn = (d) => sortTasks(state.tasks.filter((t) => t.date === d));
const tasksIn = (a, b) => sortTasks(state.tasks.filter((t) => t.date >= a && t.date <= b));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- 异步刷新调度（微任务 + rAF，合并同帧任务） ---------- */
const jobs = new Map();
let scheduled = false;
function schedule(key, fn) {
  jobs.set(key, fn);
  if (scheduled) return;
  scheduled = true;
  Promise.resolve().then(() => requestAnimationFrame(() => {
    scheduled = false;
    const list = [...jobs.values()]; jobs.clear();
    list.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }));
}

function toast(msg, face) {
  const el = $('#toast');
  el.classList.remove('has-act');
  el.textContent = (face ? face + ' ' : '') + msg;
  el.style.whiteSpace = String(msg).includes('\n') ? 'pre-line' : '';
  el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 3200);
}
function cheer(x, y, big) {
  const sky = $('#sky');
  const emo = big >= 2 ? ['🌟', '✨', '💫', '🌸', '⭐', '💗', '🎉', '🌈'] : ['🌸', '✨', '💗', '⭐', '🌷', '🍬'];
  const count = big ? emo.length * 2 : emo.length;
  for (let i = 0; i < count; i++) {
    const e = emo[i % emo.length];
    const s = document.createElement('span');
    s.className = 'spark'; s.textContent = e;
    if (big) s.style.fontSize = (20 + Math.random() * 8) + 'px';
    s.style.left = (x - 10 + (Math.random() * 60 - 30)) + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--x', (Math.random() * (big ? 260 : 160) - (big ? 130 : 80)) + 'px');
    s.style.setProperty('--r', (Math.random() * 240 - 120) + 'deg');
    s.style.animationDelay = (i * .05) + 's';
    sky.appendChild(s);
    setTimeout(() => s.remove(), 1600);
  }
}
function greet() {
  const h = new Date().getHours();
  if (h < 6) return '这么晚还没睡呀';
  if (h < 11) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  if (h < 23) return '晚上好';
  return '夜深了';
}
/* ---------- 名字：打招呼只用登录账号（用户名），跟账号完全一致 ---------- */
function nameOf(u) { return (u && (u.nickname || u.username)) || ''; }   // 资料卡上的昵称
function whoName() {
  return state.me.name || '你';
}
/* 打招呼的前半句：早上好，长安 */
const hiName = () => `${greet()}，${esc(whoName())}`;
/* 打招呼整句：早上好，长安 ~ */
const hiLine = () => `${hiName()} ~`;
/* 开屏那句：名字变了才重画，避免动画闪一下 */
function paintSplashHi() {
  const box = $('#spHi'); if (!box) return;
  const words = `${greet()}，${whoName()} ~`;
  if (box.dataset.txt === words) return;
  box.dataset.txt = words;
  box.innerHTML = [...words].map((c, i) => {
    const ch = c === ' ' ? '&nbsp;' : esc(c);
    const wd = c === '~' ? ' wd' : '';
    return `<span class="${wd.trim()}" style="animation-delay:${(.75 + i * .075).toFixed(2)}s">${ch}</span>`;
  }).join('');
}
function streakDays() {
  let n = 0, cur = today();
  if (!tasksOn(cur).some((x) => x.done)) cur = addDays(cur, -1);
  while (tasksOn(cur).some((x) => x.done)) { n++; cur = addDays(cur, -1); }
  return n;
}

/* ==========================================================
   小花园 · 养成系统
   ========================================================== */
const G = () => state.garden;
const rankNow = () => rankOf(state.garden.total);
const plotCount = () => rankNow().plots;
function gardenPlots() {
  const g = state.garden, n = plotCount();
  return Array.from({ length: n }, (_, i) => g.plots[i] || null);
}
function gardenStat() {
  const g = state.garden;
  return {
    drops: g.drops, total: g.total, harvest: g.harvest,
    planted: g.plots.filter(Boolean).length,
    dex: g.dex, streak: streakDays(), lv: rankNow().lv,
  };
}
/* 每天第一次进来：换天气，小雨天替每株浇一次水 */
function gardenDaily() {
  const g = state.garden, t = today();
  if (g.weather && g.weather.date === t) return null;
  const w = weatherOf(t);
  g.weather = { date: t, k: w.k };
  let bonus = 0;
  if (w.k === 'rain') {
    g.plots.forEach((p) => {
      if (p && p.stage < 2) { p.water += 1; bonus++; }
    });
  }
  return { w, bonus };
}
/* 浇水：先扣露珠，再算升阶 */
function waterPlot(i, n = 1) {
  const g = state.garden, p = g.plots[i];
  if (!p || p.stage >= 2) return null;
  const use = Math.min(n, g.drops);
  if (use <= 0) return { dry: true };
  g.drops -= use; p.water += use;
  const def = plantOf(p.k);
  let bloom = false;
  while (p.stage < 2 && p.water >= def.need[p.stage]) {
    p.water -= def.need[p.stage]; p.stage++;
  }
  if (p.stage >= 2) { p.stage = 2; p.water = 0; bloom = true; }
  return { bloom, used: use };
}
function harvestPlot(i) {
  const g = state.garden, p = g.plots[i];
  if (!p || p.stage < 2) return null;
  g.plots[i] = null;
  g.harvest++;
  g.dex[p.k] = (g.dex[p.k] || 0) + 1;
  const gain = 8 + Math.round(plantOf(p.k).cost / 5);
  g.drops += gain; g.total += gain;
  return { kind: p.k, gain };
}
function sowPlot(i, kind) {
  const g = state.garden, def = plantOf(kind);
  if (g.drops < def.cost) return false;
  g.drops -= def.cost;
  g.plots[i] = { k: kind, stage: 0, water: 0, born: today() };
  return true;
}
/* 徽章：算出来，新解锁的记进 seen */
function checkBadges() {
  const g = state.garden, st = gardenStat();
  const fresh = [];
  BADGES.forEach((b) => {
    if (g.seen.includes(b.k)) return;
    if (b.test(st)) { g.seen.push(b.k); fresh.push(b); }
  });
  return fresh;
}
/* 小园丁：为以后的 ToDo 机器人预留的说话口子 */
function botLine() {
  const g = state.garden, st = gardenStat(), r = rankNow();
  const sy = studyHint();
  if (sy) return sy;
  if (!st.planted) return '土还是空的呀，点一个格子，我教你怎么种 🌱';
  const bloom = g.plots.filter((p) => p && p.stage >= 2).length;
  if (bloom) return `有 ${bloom} 朵开啦，点一下就能收下来，我帮你抱着 🌸`;
  const soon = g.plots.find((p) => p && p.stage < 2);
  if (soon) {
    const need = plantOf(soon.k).need[soon.stage] - soon.water;
    return `「${plantOf(soon.k).n}」还差 ${need} 滴就长大一点啦`;
  }
  return `Lv.${r.lv} ${r.n}，${r.tip}`;
}
/* 阿露也会念叨备考（以后接 AI 就换这一个函数） */
function studyHint() {
  if (!state.study) return '';
  const run = ST().sessions.find((s) => s.seg);
  if (run) {
    const sb = sbjOf(run.sid);
    return `${sb ? sb.n : '这个栏目'}正在计时呢，我在旁边替你数着 ⏳`;
  }
  const due = ST().sessions.filter((s) => !s.drop && !s.rev).length;
  if (due >= 2) return `有 ${due} 段还没复盘，写一句也算数，我陪你补呀 📝`;
  const t = today(), sec = todayStat().sec;
  const goal = (ST().goal || 180) * 60;
  if (sec <= 0) return '今天还没开始学呢，去「📚 备考」挑一块，先坐十分钟也好呀';
  if (sec < goal) return `今天已经 ${Math.round(sec / 60)} 分钟啦，离目标还差 ${Math.round((goal - sec) / 60)} 分钟，慢慢来 ~`;
  return `今天学了 ${Math.round(sec / 60)} 分钟，超额完成啦，去花园收收花吧 🌸`;
}
function nextDate(w) {
  const t = today();
  if (!w.yearly) return w.date;
  let d = w.date;
  if (d < t) {
    const y = Number(t.slice(0, 4)) - Number(d.slice(0, 4));
    d = `${Number(d.slice(0, 4)) + y}-${d.slice(5)}`;
    if (d < t) d = `${Number(d.slice(0, 4)) + 1}-${d.slice(5)}`;
  }
  return d;
}
function dueSoon() {
  const t = today();
  return state.wishes.map((w) => ({ w, d: diff(t, nextDate(w)) }))
    .filter((x) => x.d >= 0 && x.d <= Number(x.w.remind || 0))
    .sort((a, b) => a.d - b.d);
}

/* ==========================================================
   备考 · 学习工作台
   ========================================================== */
const ST = () => state.study;
const sbjOf = (id) => ST().subjects.find((s) => s.id === id);
const sbjLive = () => ST().subjects.filter((s) => !s.off);
const sbjVar = (c) => WISH_COLOR[c] || 'var(--pink)';
const secFloor = (s) => Math.floor(s);
const clockOf = (sec) => {
  const n = secFloor(Math.max(0, sec));
  const h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60;
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
const hhmm = (ms) => { const d = new Date(ms); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const humanSec = (sec) => {
  const m = Math.round(sec / 60);
  if (m < 1) return `${secFloor(sec)} 秒`;
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h} 小时 ${r} 分` : `${h} 小时`) : `${m} 分钟`;
};
/* 时长永远用时间戳差值算，页面睡着也不会走偏 */
const nowSec = (s) => s.sec + (s.seg ? (Date.now() - s.seg) / 1000 : 0);
const runningSession = () => ST().sessions.find((s) => s.seg);
const pauseSession = (s, now = Date.now()) => {
  if (!s || !s.seg) return;
  s.sec += (now - s.seg) / 1000; s.seg = null;
};
/* 上次忘了关：超过 3 小时自动收住，免得记出一个离谱的时长 */
function studyBoot() {
  const t = Date.now();
  let n = 0;
  ST().sessions.forEach((s) => {
    if (s.seg && t - s.seg > 3 * 3600 * 1000) { pauseSession(s, t); n++; }
  });
  if (n) save();
  return n;
}
function rangeOf(k) {
  const t = today();
  if (k === 'week') return { from: weekStart(t), to: addDays(weekStart(t), 6), n: '本周' };
  if (k === 'month') return { from: monthStart(t), to: monthEnd(t), n: '本月' };
  return { from: t, to: t, n: '今天' };
}
const sessionsIn = (from, to) => ST().sessions
  .filter((s) => !s.drop && s.date >= from && s.date <= to)
  .sort((a, b) => (a.startedAt || 0) < (b.startedAt || 0) ? 1 : -1);
const secTotal = (list) => list.reduce((a, s) => a + nowSec(s), 0);
const secOfSbj = (id, from, to) => secTotal(sessionsIn(from, to).filter((s) => s.sid === id));
function todayStat() {
  const t = today();
  const list = sessionsIn(t, t);
  return {
    sec: secTotal(list), n: list.length,
    due: list.filter((s) => !s.rev).length,
    missed: ST().sessions.filter((s) => !s.drop && !s.rev && s.date < t).length,
  };
}
function studyStreak() {
  let n = 0, d = today();
  if (!sessionsIn(d, d).length) d = addDays(d, -1);
  while (sessionsIn(d, d).length) { n++; d = addDays(d, -1); }
  return n;
}
const revOf = (s) => ST().reviews.find((r) => r.id === s.rev);
/* ---------- 露珠奖励：时长档位 ---------- */
/* 学满一段时间给花园的露珠（纯档位，兼容旧测试/旧引用） */
function studyDrops(sec) {
  const m = sec / 60;
  if (m >= 240) return 20;
  if (m >= 150) return 14;
  if (m >= 90) return 9;
  if (m >= 45) return 6;
  if (m >= 25) return 3;
  if (m >= 10) return 1;
  return 0;
}
/* 结算明细：每一项加减都摆出来，用户看得见为什么 */
const DROP_TIERS = [
  { m: 240, n: 20, n2: '沉浸档 · 4 小时' },
  { m: 150, n: 14, n2: '深耕档 · 2.5 小时' },
  { m: 90, n: 9, n2: '深度档 · 1.5 小时' },
  { m: 45, n: 6, n2: '专注档 · 45 分钟' },
  { m: 25, n: 3, n2: '番茄档 · 25 分钟' },
  { m: 10, n: 1, n2: '起步档 · 10 分钟' },
];
function settleDrops(s, v) {
  const m = Math.round(nowSec(s) / 60);
  const tier = DROP_TIERS.find((x) => m >= x.m);
  const parts = [];
  let n = tier ? tier.n : 0;
  if (tier) parts.push({ n: tier.n, t: tier.n2 });
  if (tier && s.mode === 'down' && m * 60 >= s.plan) { n += 1; parts.push({ n: 1, t: '倒计时说到做到' }); }
  const sd = studyStreak();
  if (tier && sd >= 3) {
    const b = Math.max(1, Math.round(tier.n * .15));
    n += b; parts.push({ n: b, t: `连续 ${sd} 天学习 · 连击` });
  }
  if (tier && weatherOf(today()).k === 'rain') { n += 1; parts.push({ n: 1, t: '雨天也在学 ☔' }); }
  if ((s.pauses || 0) >= 3 && n > 1) { n -= 1; parts.push({ n: -1, t: '中断有点多' }); }
  if (v) {
    n += 2; parts.push({ n: 2, t: '认真写了复盘' });
    if (v.qAll && v.qRight != null && v.qRight / v.qAll >= .8) { n += 2; parts.push({ n: 2, t: '正确率 ≥80%' }); }
    if (v.atts && v.atts.length) { n += 1; parts.push({ n: 1, t: '留下了声音或影像' }); }
  }
  return { n: Math.max(0, n), parts };
}
const settleLine = (r) => r.parts.length
  ? r.parts.map((p) => `${p.n > 0 ? '＋' : ''}${p.n} ${p.t}`).join(' · ')
  : '';

/* ---------- 首页：概览 + 栏目宫格 + 汇总 ---------- */
function viewStudy() {
  return ui.studySid ? viewStudySub() : viewStudyHome();
}
function viewStudyHome() {
  return `${studyHero()}
  ${studyGrid()}
  ${studyLogCard()}
  ${studyStatCard()}`;
}
function studyHero() {
  const st = todayStat(), goal = ST().goal || 180;
  const pct = Math.min(100, Math.round(st.sec / (goal * 60) * 100));
  const C = 2 * Math.PI * 34;
  const sd = studyStreak();
  return `<section class="card sy-hero">
    <div class="sy-ring">
      <svg viewBox="0 0 78 78"><circle class="bg" cx="39" cy="39" r="34"/>
        <circle class="fg" cx="39" cy="39" r="34" stroke-dasharray="${(C * pct / 100).toFixed(1)} ${C.toFixed(1)}"/></svg>
      <div class="sy-ring-txt"><b id="syToday">${humanSec(st.sec)}</b><span>今日已学</span></div>
    </div>
    <div class="sy-info">
      <div class="sy-hi">${hiName()} · 今天想先啃哪一块呀 ~</div>
      <div class="sy-bar"><i style="width:${pct}%"></i></div>
      <div class="sy-bar-txt">每日目标 ${goal} 分钟 · 完成 ${pct}%${pct >= 100 ? ' 🎉 今天达标啦' : ''}
        <button class="sy-link" data-act="sbj-set-goal">改一改</button></div>
      <div class="sy-nums">
        <div><b id="sySeg">${st.n}</b><span>段专注</span></div>
        <div><b id="syDue" class="${st.due ? 'warn' : ''}">${st.due}</b><span>待复盘</span></div>
        <div><b>${sd}</b><span>连续天数</span></div>
      </div>
    </div>
  </section>`;
}
function studyGrid() {
  return `<section class="card">
    <div class="card-head">
      <div><h3>备考栏目</h3><div class="sub">点一个进去，开始计时</div></div>
      <button class="soft-btn" data-act="sbj-new">＋ 新栏目</button>
    </div>
    ${SBJ_GROUPS.map((g) => {
    const items = sbjLive().filter((s) => (s.g || 'own') === g.k);
    if (!items.length) return '';
    return `<div class="sy-grp">
        <div class="sy-grp-h">${g.e} ${g.n}</div>
        <div class="sy-grid">${items.map(sbjCell).join('')}</div>
      </div>`;
  }).join('')}
  </section>`;
}
function sbjCell(s) {
  const t = today(), w = weekStart(t);
  const sec = secOfSbj(s.id, t, t), wk = secOfSbj(s.id, w, addDays(w, 6));
  const pct = s.target ? Math.min(100, Math.round(sec / 60 / s.target * 100)) : 0;
  const run = runningSession();
  const on = run && run.sid === s.id;
  return `<div class="sy-cell ${on ? 'run' : ''}" data-act="sbj-open" data-id="${s.id}" role="button" tabindex="0"
      style="--sc:${sbjVar(s.c)}" title="${esc(s.tip || s.n)}">
    <div class="sy-c-top"><span class="sy-c-e">${s.e}</span>${on ? '<i class="sy-live"></i>' : ''}
      ${s.b ? '' : `<i class="sy-edit" data-act="sbj-edit" data-id="${s.id}" title="改一改">✏️</i>`}</div>
    <div class="sy-c-n">${esc(s.n)}</div>
    <div class="sy-c-t">${sec ? `今天 ${humanSec(sec)}` : '今天还没开始'}</div>
    <div class="sy-c-bar"><i style="width:${pct}%"></i></div>
    <div class="sy-c-foot"><span>本周 ${wk ? humanSec(wk) : '—'}</span><span>目标 ${s.target} 分</span></div>
  </div>`;
}
function studyStatCard() {
  const k = ui.studyRange, r = rangeOf(k), list = sessionsIn(r.from, r.to);
  const total = secTotal(list);
  const bySbj = sbjLive().map((s) => ({ s, sec: secTotal(list.filter((x) => x.sid === s.id)) }))
    .filter((x) => x.sec > 0).sort((a, b) => b.sec - a.sec);
  const max = bySbj.length ? bySbj[0].sec : 1;
  const days = [];
  if (k === 'today') days.push({ d: r.from, sec: total, l: '今天' });
  else for (let d = r.from; d <= r.to; d = addDays(d, 1)) {
    days.push({ d, sec: secTotal(sessionsIn(d, d)), l: `${parse(d).getMonth() + 1}/${parse(d).getDate()}` });
  }
  const dmax = Math.max(1, ...days.map((x) => x.sec));
  const revs = ST().reviews.filter((v) => v.date >= r.from && v.date <= r.to).length;
  return `<section class="card">
    <div class="card-head">
      <div><h3>学习汇总 <button class="sy-help-btn" data-act="sy-help" title="露珠怎么算？">?</button></h3><div class="sub">${r.n} · ${days.filter((x) => x.sec).length} 天有记录</div></div>
      <div class="seg" id="syRange">
        ${['today', 'week', 'month'].map((x) => `<button data-act="sy-range" data-range="${x}" class="${k === x ? 'on' : ''}">${rangeOf(x).n}</button>`).join('')}
      </div>
    </div>
    <div class="sy-sum">
      <div><b>${humanSec(total)}</b><span>总时长</span></div>
      <div><b>${list.length}</b><span>段专注</span></div>
      <div><b>${ratioOf(list, revs)}</b><span>复盘率</span></div>
      <div><b>${humanSec(list.length ? total / list.length : 0)}</b><span>平均每段</span></div>
    </div>
    ${bySbj.length ? `<div class="sy-stack">
      ${bySbj.map((x) => `<div class="sy-stack-row" style="--sc:${sbjVar(x.s.c)}">
        <div class="sy-sk-n">${x.s.e} ${esc(x.s.n)}</div>
        <div class="sy-sk-bar"><i style="width:${(x.sec / max * 100).toFixed(1)}%"></i></div>
        <div class="sy-sk-v">${humanSec(x.sec)}</div>
      </div>`).join('')}
    </div>` : '<div class="empty"><span class="face">🌱</span>这段时间还没有记录，点上面的栏目开始吧</div>'}
    <div class="sy-trend">
      ${days.map((x) => `<div class="sy-tr ${x.d === today() ? 'today' : ''}" title="${x.d} ${humanSec(x.sec)}">
        <i style="height:${(x.sec / dmax * 100).toFixed(1)}%"></i><span>${x.l}</span></div>`).join('')}
    </div>
    ${ui.dropHelp ? `<div class="sy-help">
      <b>露珠怎么算？</b> 学满 10 分钟 ＋1 · 25 分钟 ＋3 · 45 分钟 ＋6 · 90 分钟 ＋9 · 2.5 小时 ＋14 · 4 小时 ＋20<br>
      加成：倒计时按时完成 ＋1 · 连续 ≥3 天 ＋15% · 雨天 ＋1 · 写复盘 ＋2 · 正确率 ≥80% ＋2 · 留声音/影像 ＋1<br>
      中断 ≥3 次 －1 · 完整规则在「🌷 小花园」最下面那张卡里
    </div>` : ''}
    <div class="sy-export">
      <button class="soft-btn" data-act="sy-csv">📊 导出 CSV</button>
      <button class="soft-btn" data-act="sy-md">📝 导出周报</button>
      <button class="soft-btn" data-act="sy-ai">🤖 复制给 AI</button>
      <button class="soft-btn" data-act="srv-report">📄 生成报告</button>
      <button class="soft-btn" data-act="sy-json">📦 学习备份</button>
    </div>
  </section>`;
}
const ratioOf = (list, revs) => (list.length ? Math.round(revs / list.length * 100) : 0) + '%';
function studyLogCard() {
  const t = today(), list = sessionsIn(t, t);
  return `<section class="card">
    <div class="card-head"><div><h3>今天的学习流水</h3><div class="sub">${list.length ? `共 ${list.length} 段` : '还没有开始，先挑一块做一会儿吧'}</div></div></div>
    ${list.length ? `<div class="sy-log">${list.map(logRow).join('')}</div>`
      : '<div class="empty"><span class="face">⏳</span>点上面的栏目，按下开始就好啦</div>'}
  </section>`;
}
function logRow(s) {
  const sb = sbjOf(s.sid), v = revOf(s);
  const need = !s.rev && !s.drop;
  return `<div class="sy-log-row ${need ? 'due' : ''}" style="--sc:${sbjVar(sb ? sb.c : 'pink')}">
    <div class="sy-lg-t">${hhmm(s.began || s.startedAt)} <span>${humanSec(nowSec(s))}</span></div>
    <div class="sy-lg-n">${sb ? sb.e + ' ' + esc(sb.n) : '已删栏目'}${s.mode === 'down' ? `<em class="mini">倒计时 ${Math.round(s.plan / 60)} 分</em>` : '<em class="mini">正计时</em>'}</div>
    <div class="sy-lg-r">${v ? `<div class="sy-lg-v">${esc(v.learned || v.next || (v.atts && v.atts.length ? '用声音/影像记了一段' : '已复盘'))}${v.atts && v.atts.length ? `<em class="att-mini">${v.atts.map((a) => ATT_ICON[a.kind]).join('')}</em>` : ''}</div>
      <button class="soft-btn tiny" data-act="rev-edit" data-id="${v.id}">看看</button>`
      : `<div class="sy-lg-v muted">还没复盘${need ? ' · 记得补一下哦' : ''}</div>
      ${s.seg ? '' : `<button class="soft-btn tiny" data-act="rev-new" data-id="${s.id}">写复盘</button>`}`}</div>
  </div>`;
}

/* ---------- 栏目工作台：计时器 ---------- */
function viewStudySub() {
  const s = sbjOf(ui.studySid);
  if (!s) { ui.studySid = null; return viewStudyHome(); }
  const t = today(), w = weekStart(t);
  const run = ST().sessions.find((x) => x.sid === s.id && x.seg) || null;
  const rest = ST().sessions.find((x) => x.sid === s.id && !x.seg && !x.end && !x.drop) || null;
  const mine = sessionsIn(t, t).filter((x) => x.sid === s.id);
  const busy = run || rest;
  return `<section class="card sy-timer" style="--sc:${sbjVar(s.c)}">
    <div class="card-head">
      <div><h3>${s.e} ${esc(s.n)}</h3>
        <div class="sub">今天 ${mine.length ? humanSec(secOfSbj(s.id, t, t)) : '还没开始'} · 本周 ${humanSec(secOfSbj(s.id, w, addDays(w, 6)))}</div></div>
      <button class="soft-btn" data-act="sbj-back">‹ 返回栏目</button>
    </div>
    <div class="sy-stage">
      <div class="sy-tm-ring big">
        <svg viewBox="0 0 200 200"><circle class="bg" cx="100" cy="100" r="92"/>
          <circle class="fg" id="tmRing" cx="100" cy="100" r="92" stroke-dasharray="0 578"/></svg>
        <div class="sy-tm-in">
          <b id="tmClock">${tmShow()}</b>
          <span id="tmSub">${tmSub()}</span>
        </div>
      </div>
      <div class="sy-tm-ctl">
        ${busy ? '' : `<div class="seg" id="tmMode">
          <button data-act="tm-mode" data-mode="down" class="${ui.studyMode === 'down' ? 'on' : ''}">⏳ 倒计时</button>
          <button data-act="tm-mode" data-mode="up" class="${ui.studyMode === 'up' ? 'on' : ''}">⏱️ 正计时</button>
        </div>
        ${ui.studyMode === 'down' ? `<div class="sy-plans">
          ${SBJ_PLANS.map((m) => `<button data-act="tm-plan" data-min="${m}" class="sy-plan ${ui.studyPlan === m ? 'on' : ''}">${m} 分</button>`).join('')}
          <label class="sy-plan sy-plan-custom ${!SBJ_PLANS.includes(ui.studyPlan) ? 'on' : ''}">
            <input type="number" id="planCustom" min="1" max="480"
              value="${SBJ_PLANS.includes(ui.studyPlan) ? '' : ui.studyPlan}" placeholder="自定" /> 分
          </label>
        </div>` : ''}`}
        <div class="sy-tm-btns">
          ${run
    ? `<button class="soft-btn primary" data-act="tm-pause">⏸ 休息一下</button>
             <button class="soft-btn" data-act="tm-finish">✓ 结束并复盘</button>
             <button class="soft-btn danger" data-act="tm-drop">算了，不算这段</button>`
    : rest
      ? `<button class="soft-btn primary" data-act="tm-resume" data-id="${rest.id}">▶ 继续刚才那段</button>
             <button class="soft-btn" data-act="tm-end" data-id="${rest.id}">✓ 结束并复盘</button>
             <button class="soft-btn danger" data-act="tm-drop-id" data-id="${rest.id}">算了，不算这段</button>`
      : `<button class="soft-btn primary big" data-act="tm-start" data-id="${s.id}">▶ 开始这段</button>`}
        </div>
        <div class="sy-tm-tip">${tmTip(run, rest)}</div>
      </div>
    </div>
  </section>
  <section class="card">
    <div class="card-head"><div><h3>今天在这里的时间轴</h3><div class="sub">${mine.length ? `共 ${mine.length} 段` : '点上面那个「开始」就好啦'}</div></div></div>
    ${mine.length ? `<div class="sy-log">${mine.map(logRow).join('')}</div>`
      : `<div class="empty"><span class="face">${s.e}</span>${esc(s.tip || '慢慢来，先做十分钟试试')}</div>`}
  </section>`;
}
const TM_C = 2 * Math.PI * 92;
/* 当前脸上应该显示的时间：正在跑 > 这一段暂停中 > 还没开始 */
function tmCur() {
  const r = runningSession();
  if (r) {
    return { s: r, sec: nowSec(r), plan: r.plan, mode: r.mode, running: true, paused: false,
      left: r.mode === 'down' ? Math.max(0, r.plan - nowSec(r)) : nowSec(r) };
  }
  if (ui.studySid) {
    const p = ST().sessions.find((x) => x.sid === ui.studySid && !x.seg && !x.end && !x.drop);
    if (p) {
      const sec = nowSec(p);
      return { s: p, sec, plan: p.plan, mode: p.mode, running: false, paused: true,
        left: p.mode === 'down' ? Math.max(0, p.plan - sec) : sec };
    }
  }
  const down = ui.studyMode === 'down';
  return { sec: 0, running: false, paused: false, mode: ui.studyMode,
    plan: down ? ui.studyPlan * 60 : 0, left: down ? ui.studyPlan * 60 : 0 };
}
const pausedAny = () => ST().sessions.find((x) => !x.seg && !x.end && !x.drop) || null;
const tmShow = () => clockOf(tmCur().left);
const tmSub = () => {
  const c = tmCur();
  if (c.paused) return `已暂停 · 学了 ${humanSec(c.sec)}`;
  if (!c.running) return c.mode === 'down' ? `倒计时 ${Math.round(c.plan / 60)} 分钟` : '正计时，随时可以停';
  return c.mode === 'down' ? `还剩 ${clockOf(c.left)} · 已学 ${humanSec(c.sec)}` : `已学 ${humanSec(c.sec)}`;
};
const tmTip = (run, rest) => {
  if (run) return '离开这一页也没关系，它还在背后走 ⏳';
  if (rest) return '刚才那段停在这里啦，继续或者直接算结束都行 ☕';
  if (ui.studyMode === 'down') {
    return `按下开始，按时完成这 ${ui.studyPlan} 分钟至少换 3 滴露珠 💧`;
  }
  return '正计时：想停就停，满 10 分钟就能换露珠 💧';
};

/* ---------- 计时器引擎 ---------- */
let tmTick = null;
function tmEnsureTick() {
  const r = runningSession();
  if (r && !tmTick) tmTick = setInterval(tmFrame, 500);
  if (!r && tmTick) { clearInterval(tmTick); tmTick = null; }
}
function tmFrame() {
  const r = runningSession();
  if (!r) { tmEnsureTick(); patchTimer(); return; }
  if (r.mode === 'down' && nowSec(r) >= r.plan) { tmFinish(true); return; }
  patchTimer();
}
function patchTimer() {
  const c = tmCur(), r = runningSession();
  const cl = $('#tmClock');
  if (cl) cl.textContent = clockOf(c.left);
  const sub = $('#tmSub');
  if (sub) sub.textContent = tmSub();
  const ring = $('#tmRing');
  if (ring) {
    const pct = c.mode === 'down' && c.plan ? Math.max(0, Math.min(100, c.left / c.plan * 100)) : 100;
    ring.setAttribute('stroke-dasharray', `${(TM_C * pct / 100).toFixed(1)} ${TM_C.toFixed(1)}`);
    ring.style.opacity = pct > 0.5 ? 1 : 0;
  }
  // 浮动小药丸：离开计时页也看得到它在走
  const pill = $('#tmPill');
  if (pill) {
    const p = r || pausedAny();
    if (p) {
      pill.classList.remove('hidden');
      pill.classList.toggle('rest', !r);
      const sb = sbjOf(p.sid);
      pill.innerHTML = `<span class="tp-e">${sb ? sb.e : '📚'}</span>
        <span class="tp-n">${sb ? esc(sb.n) : '备考'} · ${clockOf(nowSec(p))}${r ? '' : ' ☕'}</span>
        ${r
    ? `<button class="soft-btn tiny" data-act="tm-pause">⏸</button>
             <button class="soft-btn tiny primary" data-act="tm-finish">结束</button>`
    : `<button class="soft-btn tiny" data-act="tm-resume" data-id="${p.id}">继续</button>
             <button class="soft-btn tiny primary" data-act="tm-end" data-id="${p.id}">结束</button>`}
        <button class="round-btn tiny-x" data-act="sbj-open" data-id="${p.sid}" title="回到我的栏目">›</button>`;
    } else pill.classList.add('hidden');
  }
  // 概览卡的今日时长随计时走
  const tt = $('#syToday');
  if (tt) {
    const s = todayStat();
    tt.textContent = humanSec(s.sec);
    const sg = $('#sySeg'); if (sg) sg.textContent = s.n;
    const du = $('#syDue'); if (du) du.textContent = s.due;
  }
}
function beep(times = 2) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const a = new AC();
    [...Array(times)].forEach((_, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sine'; o.frequency.value = i % 2 ? 1046 : 784;
      g.gain.setValueAtTime(0, a.currentTime + i * .32);
      g.gain.linearRampToValueAtTime(.14, a.currentTime + i * .32 + .02);
      g.gain.exponentialRampToValueAtTime(.001, a.currentTime + i * .32 + .28);
      o.connect(g).connect(a.destination);
      o.start(a.currentTime + i * .32); o.stop(a.currentTime + i * .32 + .3);
    });
    setTimeout(() => a.close(), times * 320 + 400);
  } catch (e) { }
}
function tmStart(sid) {
  const prev = runningSession();
  if (prev) pauseSession(prev);
  const down = ui.studyMode === 'down';
  const now = Date.now();
  const s = {
    id: uid(), sid, mode: ui.studyMode, plan: down ? ui.studyPlan * 60 : 0,
    date: today(), began: now, startedAt: now,
    sec: 0, seg: now, rev: null, drop: false, end: false, pauses: 0,
  };
  ST().sessions.push(s); save();
  tmEnsureTick(); patchTimer();
  if (prev) schedule('view', renderView);
  toast(down ? `倒计时 ${ui.studyPlan} 分钟，开始啦` : '开始计时啦，慢慢做就好', '⏳');
}
/* 中场休息：还在这段里，只是暂停了 */
function tmPause() {
  const s = runningSession(); if (!s) return;
  pauseSession(s); s.pauses++; save();
  if (s.pauses === 1) ui._pausedId = s.id;
  tmEnsureTick(); patchTimer();
  if (ui.studySid) schedule('view', renderView);
  toast('先歇一会儿，随时可以继续', '☕');
}
/* 继续刚才那段 */
function tmResume(id) {
  const s = ST().sessions.find((x) => x.id === id && !x.seg && !x.end && !x.drop);
  if (!s || runningSession()) return;
  s.seg = Date.now(); save();
  tmEnsureTick(); patchTimer(); schedule('view', renderView);
  toast('回来啦，接着走 ~', '🌿');
}
/* 收尾：结算露珠 → 弹复盘 */
const SY_END_PRAISE = [
  { m: 90, e: '🌟', t: ['哇，一口气啃了这么久，你真的很可以！', '这么长时间都坐住了，太了不起啦'] },
  { m: 45, e: '🌷', t: ['稳稳的一大段，给自己鼓鼓掌 👏', '这一段时间很扎实，辛苦啦'] },
  { m: 25, e: '🌸', t: ['一个完整的番茄，节奏刚刚好', '完成啦，喝口水眨眨眼睛 ~'] },
  { m: 10, e: '🌱', t: ['开始就是最好的事，又攒了一段', '十分钟也很珍贵呀，积少成多'] },
  { m: 0, e: '🍃', t: ['哪怕一小会儿也算数，慢慢来'] },
];
const praiseFor = (min) => {
  const g = SY_END_PRAISE.find((x) => min >= x.m) || SY_END_PRAISE[SY_END_PRAISE.length - 1];
  return { e: g.e, t: g.t[Math.floor(Math.random() * g.t.length)] };
};
/* 露珠从计时环飞向侧边栏的小动画 */
function dropFly(n) {
  if (n <= 0) return;
  const from = $('#tmRing') ? $('#tmRing').getBoundingClientRect() : { left: innerWidth / 2, top: 300, width: 0, height: 0 };
  const to = $('#side') ? $('#side').getBoundingClientRect() : { left: 60, top: innerHeight - 200, width: 0 };
  const sky = $('#sky'); if (!sky) return;
  const count = Math.min(6, n);
  for (let i = 0; i < count; i++) {
    const d = document.createElement('span');
    d.className = 'drop-fly';
    d.textContent = '💧';
    const x0 = from.left + from.width / 2, y0 = from.top + from.height / 2;
    const x1 = to.left + to.width / 2 + (Math.random() * 30 - 15), y1 = to.top + 60;
    d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
    d.style.setProperty('--dx', (x1 - x0) + 'px');
    d.style.setProperty('--dy', (y1 - y0) + 'px');
    d.style.setProperty('--mid', -(60 + Math.random() * 90) + 'px');
    d.style.animationDelay = (i * 90) + 'ms';
    sky.appendChild(d);
    setTimeout(() => d.remove(), 1700 + i * 90);
  }
}
function tmFinish(auto, id) {
  const s = id ? ST().sessions.find((x) => x.id === id) : runningSession();
  if (!s) return;
  if (s.seg) pauseSession(s);
  s.end = true;
  const total = nowSec(s);
  tmEnsureTick();
  if (total < 60) {                       // 太短就不算一段
    s.drop = true; save(); patchTimer();
    schedule('view', renderView);
    toast('这段太短啦，先不计啦', '🍃');
    return;
  }
  const r = settleDrops(s);
  const gain = r.n, g = state.garden;
  s.gain = gain;
  if (gain > 0) { g.drops += gain; g.total += gain; }
  save();
  const fresh = checkBadges();
  if (auto) beep(2);
  const sb = sbjOf(s.sid);
  const min = Math.round(total / 60);
  const p = praiseFor(min);
  openRev(s.id);
  /* 奖励文案：结算明细 + 按时长分级的夸奖 */
  const line = settleLine(r);
  toast(`${p.e} ${p.t}${gain ? `\n＋${gain}💧${line ? '（' + line + '）' : ''}` : ''}`);
  if (gain) dropFly(gain);
  if (auto || min >= 45) cheer(window.innerWidth / 2, 200, min >= 90 ? 2 : 1);
  if (fresh.length) setTimeout(() => toast(`解锁徽章「${fresh[0].n}」${fresh[0].e}`), 900);
  patchTimer();
  schedule('view', renderView); schedule('side', renderSide);
}
function tmDrop(id) {
  const s = id ? ST().sessions.find((x) => x.id === id) : runningSession();
  if (!s) return;
  if (s.seg) pauseSession(s);
  s.drop = true; s.end = true; save();
  tmEnsureTick(); patchTimer();
  schedule('view', renderView);
  toast('这段不算啦，下一次再来', '🍃');
}

/* ---------- 复盘附件：录音 / 图片 / 文档 ----------
   大文件走 IndexedDB（localStorage 只有 5MB），
   reviews 里只放 meta：atts = [{ id, kind, name, mime, size, dur }] */
const hasIDB = typeof indexedDB !== 'undefined';
const IDB = (() => {
  let dbp = null;
  const open = () => dbp || (dbp = new Promise((res, rej) => {
    const r = indexedDB.open('xiaorizi-att', 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('f')) r.result.createObjectStore('f', { keyPath: 'id' }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  }));
  const tx = (mode, fn) => open().then((d) => new Promise((res, rej) => {
    const t = d.transaction('f', mode);
    const out = fn(t.objectStore('f'));
    t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
    t.onerror = () => rej(t.error);
  }));
  return {
    put: (id, blob, meta) => tx('readwrite', (st) => st.put({ id, blob, meta })),
    get: (id) => open().then((d) => new Promise((res) => {
      const rq = d.transaction('f').objectStore('f').get(id);
      rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null);
    })),
    del: (id) => tx('readwrite', (st) => st.delete(id)),
  };
})();
let revAtts = [];                 // 当前弹窗里的附件（meta 数组）
let rec = null;                   // { mr, chunks, start, stream }
const ATT_ICON = { audio: '🎙️', img: '🖼️', doc: '📎' };
const sizeText = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
function renderAttList() {
  const box = $('#attList'); if (!box) return;
  if (!revAtts.length) { box.innerHTML = ''; return; }
  box.innerHTML = revAtts.map((a, i) => `<div class="att-item">
      <span class="att-e">${ATT_ICON[a.kind]}</span>
      <span class="att-n" title="${esc(a.name)}">${esc(a.name)}</span>
      <span class="att-s">${a.dur != null ? clockOf(a.dur) : sizeText(a.size)}</span>${a.backed ? '<span class="att-backed">已备份</span>' : ''}
      <button type="button" class="att-play" data-att-play="${i}" title="听听 / 看看">▶</button>
      <button type="button" class="att-del" data-att-del="${i}" title="拿掉">✕</button>
    </div>`).join('');
}
async function addAttBlob(kind, blob, name, dur) {
  if (!hasIDB) { toast('这个浏览器存不了附件，先用文字记一下呀', '🙈'); return; }
  const a = { id: uid(), kind, name, mime: blob.type || 'application/octet-stream', size: blob.size };
  if (dur != null) a.dur = Math.round(dur);
  a.blob = blob;                  // 暂存，保存复盘时才写进 IDB
  revAtts.push(a);
  renderAttList();
  toast(kind === 'audio' ? `录好啦，${clockOf(a.dur)} 秒` : '加进来啦', ATT_ICON[kind]);
}
/* 录音：按住思路，松开收尾 */
async function attToggleRec() {
  const btn = $('#attRec'); if (!btn) return;
  if (rec) {
    try { rec.mr.stop(); } catch (e) { }
    rec = null;
    btn.classList.remove('on');
    btn.innerHTML = '🎙️<span>录一段</span>';
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === 'undefined') {
    toast('这个浏览器不支持录音，先用文字记吧', '🎙️'); return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks = [];
    mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const start = Date.now();
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
      const dur = (Date.now() - start) / 1000;
      if (dur < 1) { toast('太短啦，录一句完整的话吧', '🎙️'); return; }
      addAttBlob('audio', blob, `录音_${hhmm(Date.now())}`, dur);
    };
    rec = { mr, chunks, start, stream };
    mr.start();
    btn.classList.add('on');
    const tick = () => {
      if (!rec || rec.mr !== mr) return;
      btn.innerHTML = `⏺️<span>${clockOf((Date.now() - start) / 1000)} 点我结束</span>`;
      setTimeout(tick, 500);
    };
    tick();
    toast('开始录音啦，再说一遍要点就当复习一遍', '🎙️');
  } catch (e) {
    toast('没拿到麦克风权限，去浏览器地址栏允许一下就好', '🎙️');
  }
}
/* 图片：压到 1600px / 85% 质量再存，别让 IDB 也爆掉 */
function attAddImage(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('这不是图片哦', '🖼️'); return; }
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const MAX = 1600;
    const k = Math.min(1, MAX / Math.max(img.width, img.height));
    const cv = document.createElement('canvas');
    cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
    cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
    cv.toBlob((blob) => {
      URL.revokeObjectURL(url);
      if (blob) addAttBlob('img', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg');
      else addAttBlob('img', file, file.name);
    }, 'image/jpeg', .85);
  };
  img.onerror = () => { URL.revokeObjectURL(url); addAttBlob('img', file, file.name); };
  img.src = url;
}
function attAddDoc(file) {
  if (!file) return;
  if (file.size > 20 * 1048576) { toast('这个文件超过 20MB 啦，挑个小一点的', '📎'); return; }
  addAttBlob('doc', file, file.name);
}
/* 保存复盘：把暂存的 blob 真正写进 IDB */
async function flushAtts() {
  if (!hasIDB) return revAtts.map(({ blob, ...m }) => m);
  const metas = [];
  for (const a of revAtts) {
    if (a.blob) {
      try { await IDB.put(a.id, a.blob, { kind: a.kind, name: a.name }); } catch (e) { }
    }
    const { blob, ...m } = a;
    metas.push(m);
  }
  return metas;
}
/* 点附件：音频播放 / 图片新窗口 / 文档下载 */
let attAudio = null;
async function attOpen(a) {
  const row = hasIDB ? await IDB.get(a.id) : null;
  if (!row || !row.blob) {
    toast(a.backed ? '这个附件已经归档到备份里了，从备份包恢复就能再看' : '这份附件找不到了（可能清了浏览器数据）', a.backed ? '📦' : '🙈');
    return;
  }
  const url = URL.createObjectURL(row.blob);
  if (a.kind === 'audio') {
    if (attAudio) { try { attAudio.pause(); } catch (e) { } }
    attAudio = new Audio(url);
    attAudio.onended = () => URL.revokeObjectURL(url);
    attAudio.play();
    toast('在放啦，听听自己当时怎么说的', '🎙️');
  } else if (a.kind === 'img') {
    const w = window.open('', '_blank');
    if (w) { w.document.write(`<title>${esc(a.name)}</title><body style="margin:0;background:#222;display:grid;place-items:center;min-height:100vh"><img src="${url}" style="max-width:96vw;max-height:96vh"></body>`); w.document.close(); }
  } else {
    const link = document.createElement('a');
    link.href = url; link.download = a.name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
}

/* ---------- 复盘：结束后写一段小结 ---------- */
let revTarget = null;              // 正在复盘的 session id
function openRev(sid) {
  const s = ST().sessions.find((x) => x.id === sid); if (!s) return;
  revTarget = sid;
  const sb = sbjOf(s.sid), v = revOf(s);
  const sec = nowSec(s);
  $('#srevHead').innerHTML = `<div class="srev-meta" style="--sc:${sbjVar(sb ? sb.c : 'pink')}">
      <div><b>${sb ? sb.e : '📚'}</b><span>${sb ? esc(sb.n) : '这个栏目'}</span></div>
      <div><b>${humanSec(sec)}</b><span>${hhmm(s.began)} 开始</span></div>
      <div><b>${s.mode === 'down' ? '倒计时 ' + Math.round(s.plan / 60) + ' 分' : '正计时'}</b><span>${s.pauses ? '中断 ' + s.pauses + ' 次' : '一口气走完'}</span></div>
      <div><b>${s.gain ? '＋' + s.gain + '💧' : '—'}</b><span>这段换来的露珠</span></div>
    </div>`;
  const f = $('#formSrev'); const e = f.elements;
  f.reset();
  e.id.value = v ? v.id : ''; e.sid.value = sid;
  e.learned.value = v ? (v.learned || '') : '';
  e.stuck.value = v ? (v.stuck || '') : '';
  e.next.value = v ? (v.next || '') : '';
  e.qAll.value = v && v.qAll != null ? v.qAll : '';
  e.qRight.value = v && v.qRight != null ? v.qRight : '';
  const rate = v && v.rate != null ? v.rate : 2;
  e.rate.value = rate;
  $$('#srevRate button').forEach((b) => b.classList.toggle('on', Number(b.dataset.rate) === rate));
  $('#btnDelSrev').classList.toggle('hidden', !v);
  $('#srevTitle').textContent = v ? '改改这段的复盘' : '这段学到了什么呀 ~';
  revAtts = (v && v.atts ? v.atts : []).map((a) => ({ ...a }));
  renderAttList();
  const recBtn = $('#attRec'); if (recBtn) { recBtn.classList.remove('on'); recBtn.innerHTML = '🎙️<span>录一段</span>'; }
  openMask('#maskSrev');
  setTimeout(() => e.learned.focus(), 60);
}
/* 从列表里补写（不要求正在跑） */
function openRevOf(sid) { openRev(sid); }
/* 真正的落地逻辑（同步，附件已落盘后由 saveSrev 调用） */
function saveSrevCommit(skip, atts) {
  const f = $('#formSrev'); if (!f) return;
  const e = f.elements;
  const sid = e.sid.value;
  const s = ST().sessions.find((x) => x.id === sid); if (!s) return;
  if (skip) {
    revAtts = [];
    closeMasks(); revTarget = null; patchTimer();
    schedule('view', renderView); schedule('side', renderSide);
    toast('好，晚点想写随时可以回来补 📝');
    return;
  }
  const learned = e.learned.value.trim();
  const stuck = e.stuck.value.trim();
  const next = e.next.value.trim();
  if (!learned && !stuck && !next && !(atts && atts.length)) {
    toast('随便写一句也行呀，或者录一小段声音也可以 ~', '📝');
    e.learned.focus(); return;
  }
  const qAll = e.qAll.value === '' ? null : Math.max(0, Number(e.qAll.value) || 0);
  let qRight = e.qRight.value === '' ? null : Math.max(0, Number(e.qRight.value) || 0);
  if (qAll != null && qRight != null) qRight = Math.min(qRight, qAll);
  const data = {
    id: e.id.value || uid(), date: s.date, sid,
    learned, stuck, next, qAll, qRight, atts,
    rate: Number(e.rate.value) || 2, sec: Math.round(nowSec(s)),
  };
  const i = ST().reviews.findIndex((x) => x.id === data.id);
  const isNew = i < 0;
  if (i >= 0) ST().reviews[i] = data; else ST().reviews.push(data);
  s.rev = data.id;
  /* 复盘加成：结算差值（档位已经在结束时发过了） */
  let extra = 0, extraParts = [];
  if (isNew) {
    const full = settleDrops(s, data);
    const had = s.gain || 0;
    extra = Math.max(0, full.n - had);
    extraParts = full.parts.filter((p) => ['认真写了复盘', '正确率 ≥80%', '留下了声音或影像'].includes(p.t));
    if (extra > 0) {
      state.garden.drops += extra; state.garden.total += extra;
      s.gain = (s.gain || 0) + extra;
    }
  }
  save();
  closeMasks(); revTarget = null; patchTimer();
  const fresh = isNew ? checkBadges() : [];
  schedule('view', renderView); schedule('side', renderSide);
  const acc = qAll && qRight != null ? Math.round(qRight / qAll * 100) : null;
  const praise = REV_PRAISE[data.rate] || REV_PRAISE[2];
  const line = extra > 0 ? `\n＋${extra}💧（${extraParts.map((p) => `＋${p.n} ${p.t}`).join(' · ')}）` : '';
  if (isNew) {
    if (data.rate >= 3) cheer(window.innerWidth / 2, 220, data.rate === 4 ? 2 : 1);
    if (extra > 0) dropFly(extra);
    toast(`${praise.e} ${praise.t}${acc != null ? ` · 正确率 ${acc}%（${qRight}/${qAll}）` : ''}${line}`);
  } else {
    toast(acc != null ? `改好啦 · 正确率 ${acc}%（${qRight}/${qAll}）` : '复盘改好啦', '📝');
  }
  if (fresh.length) setTimeout(() => toast(`解锁徽章「${fresh[0].n}」${fresh[0].e}`), 900);
}
/* 对外的 async 入口：先把附件写进 IndexedDB，再走上面的同步逻辑 */
async function saveSrev(skip) {
  if (rec) { toast('还在录音呢，先点一下结束录音', '🎙️'); return; }
  if (skip) { saveSrevCommit(true, []); return; }
  const atts = revAtts.length ? await flushAtts() : [];
  saveSrevCommit(false, atts);
}
/* 不同状态的复盘文案：先接住情绪，再给肯定 */
const REV_PRAISE = [
  { e: '🫂', t: '没关系，看到没懂就是今天最大的收获，明天换个方式再试一次' },
  { e: '🌱', t: '有点懵是正常的，它说明这地方正是要长根的地方' },
  { e: '📝', t: '收好啦！肯回头总结的人，已经赢了大半' },
  { e: '🌷', t: '挺顺的一段，这个手感记住它，下次接着用' },
  { e: '🤩', t: '通透了！今天这个状态太棒了，给自己一朵大花' },
];
function delSrev() {
  const v = $('#formSrev').elements.id.value; if (!v) return;
  const old = ST().reviews.find((x) => x.id === v);
  if (old && old.atts && hasIDB) old.atts.forEach((a) => IDB.del(a.id).catch(() => { }));
  ST().reviews = ST().reviews.filter((x) => x.id !== v);
  const s = ST().sessions.find((x) => x.rev === v); if (s) s.rev = null;
  revAtts = [];
  save(); closeMasks(); revTarget = null;
  schedule('view', renderView); toast('这段复盘删掉啦');
}

/* ---------- 自定义栏目 ---------- */
const SBJ_EMOJIS = ['📖', '🧩', '📊', '🔢', '🌍', '🚩', '📝', '🔍', '💡', '📋',
  '✍️', '🎧', '🗣️', '🧠', '⏱️', '📎', '🎯', '🪄', '🍀', '🌙'];
function renderSbjPicker(e, c) {
  $('#sbjEmojis').innerHTML = SBJ_EMOJIS.map((x) =>
    `<button type="button" data-sbj-e="${x}" class="bk-emo ${x === e ? 'on' : ''}">${x}</button>`).join('')
    + (SBJ_EMOJIS.includes(e) ? '' : '');
  $('#sbjEmojiFree').value = SBJ_EMOJIS.includes(e) ? '' : e;
  $('#sbjColors').innerHTML = BK_COLORS.map((x) =>
    `<button type="button" data-sbj-c="${x.k}" class="bk-dot ${x.k === c ? 'on' : ''}" title="${x.n}" style="--bk:var(--${x.k})"></button>`).join('');
}
function openSubject(id) {
  const cur = id ? sbjOf(id) : null;
  ui.studyEdit = { old: cur ? cur.id : '', e: cur ? cur.e : '🎯', c: cur ? cur.c : 'pink' };
  $('#sbjTitle').textContent = cur ? `改改「${cur.n}」` : '加一个自己的栏目';
  const f = $('#formSubject'); f.reset();
  f.elements.id.value = cur ? cur.id : '';
  f.elements.n.value = cur ? cur.n : '';
  f.elements.target.value = cur ? cur.target : 30;
  renderSbjPicker(ui.studyEdit.e, ui.studyEdit.c);
  // 内置栏目只允许改目标，不能被收起
  $('#btnDelSubject').classList.toggle('hidden', !cur || !!cur.b);
  f.elements.n.disabled = !!(cur && cur.b);
  openMask('#maskSubject');
  setTimeout(() => { const n = $('#sbjName'); if (!n.disabled) n.focus(); }, 60);
}
function saveSubject() {
  const f = $('#formSubject'); if (!f) return;
  const e = f.elements;
  const old = e.id.value;
  const cur = old ? sbjOf(old) : null;
  const name = (cur && cur.b) ? cur.n : e.n.value.trim();
  if (!name) { $('#sbjName').focus(); toast('先给它起个名字呀', '🎯'); return; }
  const target = Math.max(5, Math.min(480, Number(e.target.value) || 30));
  const free = ($('#sbjEmojiFree').value || '').trim();
  const icon = firstGrapheme(free) || ui.studyEdit.e;
  if (!old) {
    const dup = ST().subjects.some((x) => !x.off && x.n === name);
    if (dup) { toast('已经有同名的栏目啦', '🙈'); return; }
    const nid = 's' + uid();
    ST().subjects.push({ id: nid, n: name, e: icon, c: ui.studyEdit.c, g: 'own', target, tip: '我自己加的栏目' });
    save(); closeMasks(); ui.studyEdit = null;
    ui.studySid = nid; schedule('view', renderView);
    toast(`「${name}」加好啦，现在就可以计时`, icon);
    return;
  }
  if (cur.b) { cur.target = target; }
  else {
    if (ST().subjects.some((x) => x.id !== old && !x.off && x.n === name)) {
      toast('已经有同名的栏目啦', '🙈'); return;
    }
    cur.n = name; cur.e = icon; cur.c = ui.studyEdit.c; cur.target = target;
  }
  save(); closeMasks(); ui.studyEdit = null;
  schedule('view', renderView); schedule('side', renderSide);
  toast('栏目改好啦', icon);
}
function delSubject() {
  const id = $('#formSubject').elements.id.value;
  const s = sbjOf(id); if (!s || s.b) return;
  const n = ST().sessions.filter((x) => x.sid === id && !x.drop).length;
  if (n && !confirm(`「${s.n}」下面记了 ${n} 段学习，收起来后这些记录会保留、只是不再出现在宫格里。要收起来吗？`)) return;
  s.off = true; save(); closeMasks(); ui.studyEdit = null;
  if (ui.studySid === id) ui.studySid = null;
  schedule('view', renderView);
  toast(`「${s.n}」先收起来啦，记录都还在`, '🧺');
}

/* ---------- 汇总导出 ---------- */
const csvCell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
function syRows(from, to) {
  return sessionsIn(from, to).map((s) => {
    const sb = sbjOf(s.sid), v = revOf(s), sec = Math.round(nowSec(s));
    const acc = v && v.qAll ? Math.round((v.qRight || 0) / v.qAll * 100) : '';
    return [s.date, hhmm(s.began), sb ? sb.n : '已删栏目',
      s.mode === 'down' ? '倒计时' : '正计时', Math.round(s.plan / 60) || '',
      sec, Math.round(sec / 60 * 10) / 10, s.pauses || 0,
      v ? (v.learned || '') : '', v ? (v.stuck || '') : '', v ? (v.next || '') : '',
      v && v.qAll != null ? v.qAll : '', v && v.qRight != null ? v.qRight : '', acc,
      v ? RATE_NAME[v.rate] || '' : '', s.gain || ''];
  });
}
const SY_HEAD = ['日期', '开始', '栏目', '模式', '计划(分)', '秒', '分钟', '中断',
  '学到什么', '卡在哪', '下一步', '做了', '对了', '正确率%', '状态', '露珠'];
function exportSyCsv() {
  const r = rangeOf(ui.studyRange);
  const rows = syRows(r.from, r.to);
  if (!rows.length) { toast('这段时间还没有记录呢', '🌱'); return; }
  const csv = '\uFEFF' + [SY_HEAD].concat(rows).map((x) => x.map(csvCell).join(',')).join('\r\n');
  download(`备考记录_${r.from}_${r.to}.csv`, csv, 'text/csv;charset=utf-8');
}
function exportSyJson() {
  download(`备考备份_${today()}.json`, JSON.stringify(state.study, null, 2), 'application/json');
}
function exportSyMd() {
  const r = rangeOf(ui.studyRange), list = sessionsIn(r.from, r.to);
  if (!list.length) { toast('这段时间还没有记录呢', '🌱'); return; }
  const total = secTotal(list);
  const bySbj = sbjLive().map((s) => ({ s, sec: secTotal(list.filter((x) => x.sid === s.id)) }))
    .filter((x) => x.sec > 0).sort((a, b) => b.sec - a.sec);
  const revs = ST().reviews.filter((v) => v.date >= r.from && v.date <= r.to);
  let md = `# ${state.me.name} 的备考记录 · ${r.n}\n\n> ${r.from} ~ ${r.to}\n\n`;
  md += `- 总时长：**${humanSec(total)}**\n- 专注段数：**${list.length}**\n- 平均每段：${humanSec(total / list.length)}\n- 复盘率：${ratioOf(list, revs.length)}\n\n`;
  md += `## ⏳ 各栏目投入\n\n| 栏目 | 时长 | 占比 |\n| --- | --- | --- |\n`;
  bySbj.forEach((x) => md += `| ${x.s.e} ${x.s.n} | ${humanSec(x.sec)} | ${Math.round(x.sec / total * 100)}% |\n`);
  md += '\n## 📝 复盘流水\n\n';
  for (let d = r.to; d >= r.from; d = addDays(d, -1)) {
    const day = sessionsIn(d, d); if (!day.length) continue;
    md += `### ${d} 周${CN[dow(d)]} · ${humanSec(secTotal(day))}\n\n`;
    day.forEach((s) => {
      const sb = sbjOf(s.sid), v = revOf(s);
      md += `- **${sb ? sb.n : '已删'}** ${hhmm(s.began)} · ${humanSec(nowSec(s))}`
        + `${v ? ` · ${RATE_EMO[v.rate] || ''}` : ' · 未复盘'}\n`;
      if (v) {
        if (v.learned) md += `  - 学到：${v.learned.replace(/\n/g, ' ')}\n`;
        if (v.stuck) md += `  - 卡住：${v.stuck.replace(/\n/g, ' ')}\n`;
        if (v.next) md += `  - 下一步：${v.next}\n`;
        if (v.qAll) md += `  - 做题：${v.qRight || 0}/${v.qAll}${v.qAll ? `（${Math.round((v.qRight || 0) / v.qAll * 100)}%）` : ''}\n`;
      }
    });
    md += '\n';
  }
  download(`备考周报_${r.from}_${r.to}.md`, md, 'text/markdown;charset=utf-8');
}
/* AI 出口：结构化 Markdown，以后接模型只换这一处 */
function buildAIPrompt(range) {
  const k = range || ui.studyRange;
  const r = rangeOf(k), list = sessionsIn(r.from, r.to);
  const total = secTotal(list);
  const bySbj = sbjLive().map((s) => ({ s, sec: secTotal(list.filter((x) => x.sid === s.id)) }))
    .filter((x) => x.sec > 0).sort((a, b) => b.sec - a.sec);
  const revs = ST().reviews.filter((v) => v.date >= r.from && v.date <= r.to);
  const days = Math.max(1, diff(r.from, r.to) + 1);
  const prev = secTotal(sessionsIn(addDays(r.from, -days), addDays(r.from, -1)));
  let md = `你是我的备考教练。下面是我的学习数据（${r.from} ~ ${r.to}，共 ${days} 天），`
    + `请先用温柔鼓励的语气说一句开场，然后给出可执行的具体建议。\n\n`;
  md += `## 一、总览\n- 总时长：${humanSec(total)}（平均每天 ${humanSec(total / days)}）\n`;
  md += `- 上一周期：${humanSec(prev)}${prev ? `（${total >= prev ? '+' : '-'}${Math.round(Math.abs(total - prev) / prev * 100)}%）` : ''}\n`;
  md += `- 专注段数：${list.length}（平均每段 ${humanSec(list.length ? total / list.length : 0)}）\n`;
  md += `- 复盘率：${ratioOf(list, revs.length)}（${revs.length}/${list.length}）\n\n`;
  md += `## 二、各栏目投入\n`;
  if (bySbj.length) {
    bySbj.forEach((x) => {
      const rs = list.filter((s) => s.sid === x.s.id && s.rev);
      const rt = rs.length ? rs.reduce((a, s) => a + (revOf(s) ? revOf(s).rate : 0), 0) / rs.length : 0;
      md += `- ${x.s.n}：${humanSec(x.sec)}（占 ${Math.round(x.sec / total * 100)}%）`
        + `，目标 ${x.s.target} 分/天${rs.length ? `，自评 ${rt.toFixed(1)}/4` : ''}\n`;
    });
  } else md += '- 暂无记录\n';
  md += '\n## 三、复盘要点（原文）\n';
  if (revs.length) {
    revs.slice().sort((a, b) => a.date < b.date ? 1 : -1).forEach((v) => {
      const sb = sbjOf(v.sid);
      md += `### ${v.date} · ${sb ? sb.n : '—'}${RATE_EMO[v.rate] ? ' ' + RATE_EMO[v.rate] : ''}\n`;
      if (v.learned) md += `- 学到：${v.learned.replace(/\n/g, ' ')}\n`;
      if (v.stuck) md += `- 卡住：${v.stuck.replace(/\n/g, ' ')}\n`;
      if (v.next) md += `- 下一步：${v.next}\n`;
      if (v.qAll) md += `- 做题：${v.qRight || 0}/${v.qAll}（${Math.round((v.qRight || 0) / v.qAll * 100)}%）\n`;
    });
  } else md += '- 暂无复盘\n';
  const stuck = revs.filter((v) => v.stuck).map((v) => v.stuck);
  md += `\n## 四、请你输出\n1. 这${days}天最值得肯定的 1~2 点（要具体，引用上面的内容）\n`;
  md += `2. ${stuck.length ? '我反复卡住的点（如：' + stuck.slice(0, 3).map((x) => x.slice(0, 20)).join('、') + '），给出针对性的拆解法\n' : '我可能的薄弱点，给出排查方法\n'}`;
  md += `3. 按上面的栏目投入，指出是否失衡，给出下一周期的时间分配建议（要有具体分钟数）\n`;
  md += `4. 给我 3 条下一步就能开始做的行动项，每条不超过 20 字\n`;
  md += `\n要求：语气温柔不施压，不要空话，每条都要能落地，用中文。\n`;
  return md;
}
async function copyAI() {
  const md = buildAIPrompt();
  try {
    if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(md);
    else throw new Error('no api');
    toast('已经复制好啦，粘贴给 AI 就能出报告 🤖');
  } catch (e) {
    const ta = document.createElement('textarea');
    ta.value = md; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand && document.execCommand('copy');
    ta.remove();
    toast(ok ? '已经复制好啦，粘贴给 AI 就能出报告 🤖' : '复制不了，给你打开成文本框啦', ok ? '🤖' : '📋');
    if (!ok) download(`给AI的备考数据_${today()}.md`, md, 'text/markdown;charset=utf-8');
  }
}

/* ==========================================================
   开屏动画
   ========================================================== */
function playSplash() {
  const sp = $('#splash');
  $('#spFace').textContent = state.me.face || '🐰';

  // 打招呼：逐字蹦出来，句尾的 ~ 会摇一摇
  paintSplashHi();

  // 上升的小花花
  const petals = ['🌸', '✨', '💗', '⭐', '🌷', '🍬', '🫧', '🍓'];
  $('#spFloat').innerHTML = Array.from({ length: 18 }, (_, i) => {
    const e = petals[i % petals.length];
    return `<b style="left:${(Math.random() * 94).toFixed(1)}%;font-size:${(15 + Math.random() * 16).toFixed(0)}px;`
      + `animation-duration:${(2.2 + Math.random() * 1.8).toFixed(1)}s;animation-delay:${(Math.random() * 1.5).toFixed(2)}s">${e}</b>`;
  }).join('');

  // 飘过的云
  $('#spClouds').innerHTML = Array.from({ length: 5 }, (_, i) =>
    `<b style="top:${(8 + i * 17 + Math.random() * 6).toFixed(0)}%;font-size:${(22 + Math.random() * 22).toFixed(0)}px;`
    + `animation-duration:${(14 + Math.random() * 12).toFixed(0)}s;animation-delay:-${(Math.random() * 16).toFixed(0)}s">☁️</b>`).join('');

  let done = false;
  const finish = () => {
    if (done) return; done = true;
    sp.classList.add('out');
    setTimeout(() => {
      sp.classList.add('gone');
      document.body.classList.add('ready');
      const r = $('#app').getBoundingClientRect();
      cheer(r.width / 2, r.height * .42);
      toast('欢迎回来，今天也要开开心心呀', '🌷');
    }, 560);
  };
  setTimeout(finish, 2600);
  sp.addEventListener('click', finish);
  document.addEventListener('keydown', function once(e) {
    if (e.key === 'Enter' || e.key === 'Escape') { finish(); document.removeEventListener('keydown', once); }
  });
}

/* ==========================================================
   侧边栏
   ========================================================== */
function applySide() {
  const s = state.settings;
  document.documentElement.style.setProperty('--side-w', (s.sideW || 250) + 'px');
  $('#side').classList.toggle('collapsed', !!s.collapsed);
  $('#foldBtn').style.transform = s.collapsed ? 'rotate(180deg)' : '';
  /* 手机上当抽屉用：展开时压一层遮罩 */
  document.body.classList.toggle('drawer-open', !s.collapsed && isMobile());
  // 收起时，顶栏那个小圆按钮显示头像，方便一眼找到「我」
  const mb = $('#menuBtn');
  if (mb) {
    mb.textContent = s.collapsed ? (state.me.face || '🌸') : '☰';
    mb.title = s.collapsed ? '展开侧边栏' : '收起侧边栏';
  }
}
function setCollapsed(v) {
  state.settings.collapsed = v; saveUi(); applySide();
}

function renderSide() {
  const t = today();
  $('#avatar').textContent = state.me.face;
  const nm = $('#meName'); if (nm) nm.textContent = whoName();
  $('#meSub').textContent = state.moods[t] ? `今天心情：${MOOD_NAME[state.moods[t]]}` : '今天也要加油呀';
  $$('.nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.view === ui.view));

  const list = tasksOn(t), done = list.filter((x) => x.done).length;
  const pct = list.length ? Math.round(done / list.length * 100) : 0;
  const C = 2 * Math.PI * 20;
  const st = streakDays();
  const plant = st >= 14 ? '🌳' : st >= 7 ? '🌻' : st >= 3 ? '🌸' : st >= 1 ? '🌿' : '🌱';
  const soon = dueSoon()[0];
  $('#sideStats').innerHTML = `
    <div class="sc-row">
      <div class="sc-ring">
        <svg viewBox="0 0 46 46"><circle class="bg" cx="23" cy="23" r="20"/><circle class="fg" cx="23" cy="23" r="20"
          stroke-dasharray="${C * pct / 100} ${C}"/></svg><b>${pct}%</b>
      </div>
      <div style="min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--ink)">今天 ${done}/${list.length}</div>
        <div>已完成的小事</div>
      </div>
    </div>
    <div class="sc-row"><span class="sc-plant">${plant}</span><div>连续 <b style="color:var(--ink)">${st}</b> 天有完成</div></div>
    <div class="sc-row" data-act="nav" data-view="garden" style="cursor:pointer">
      <span class="sc-plant">🌷</span>
      <div style="min-width:0">Lv.${rankNow().lv} ${rankNow().n} · <b style="color:#3FA9C9">💧${state.garden.drops}</b></div>
    </div>
    ${soon ? `<div class="sc-row" data-act="memo-goto" style="cursor:pointer" title="去日历里看纪念日"><span>${soon.w.icon}</span><div style="min-width:0">${esc(soon.w.title)} · ${soon.d === 0 ? '就是今天' : soon.d + ' 天'}</div></div>` : ''}
    <div class="sc-row" data-act="nav" data-view="study" style="cursor:pointer">
      <span class="sc-plant">📚</span>
      <div style="min-width:0">今天学了 <b style="color:var(--ink)">${humanSec(todayStat().sec)}</b>${ST().sessions.some((x) => x.seg) ? ' ⏳' : ''}</div>
    </div>`;
}

/* 拖拽调宽 / 拖到最左收起 */
function initResizer() {
  const side = $('#side'), rz = $('#resizer');
  let dragging = false, startX = 0, startW = 0, moved = false;

  rz.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false;
    startX = e.clientX; startW = side.getBoundingClientRect().width;
    side.classList.add('no-anim');
    rz.classList.add('dragging');
    document.body.classList.add('resizing');
    try { rz.setPointerCapture(e.pointerId); } catch (err) { }
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const w = startW + (e.clientX - startX);
    moved = true;
    if (w < 132) { side.classList.add('collapsed'); return; }
    side.classList.remove('collapsed');
    document.documentElement.style.setProperty('--side-w', clamp(w, 170, 460) + 'px');
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove('dragging');
    document.body.classList.remove('resizing');
    side.classList.remove('no-anim');
    const collapsed = side.classList.contains('collapsed');
    state.settings.collapsed = collapsed;
    if (!collapsed) state.settings.sideW = Math.round(parseFloat(side.getBoundingClientRect().width));
    saveUi(); applySide();
    if (moved) schedule('side', renderSide);
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  $('#foldBtn').addEventListener('click', () => setCollapsed(!state.settings.collapsed));
  $('#menuBtn').addEventListener('click', () => setCollapsed(!state.settings.collapsed));
  rz.addEventListener('dblclick', () => setCollapsed(!state.settings.collapsed));
}

/* ==========================================================
   主区域渲染
   ========================================================== */
function renderView() {
  const c = $('#content');
  if (ui.view === 'today') c.innerHTML = viewToday();
  else if (ui.view === 'calendar') c.innerHTML = viewCalendar();
  else if (ui.view === 'review') c.innerHTML = viewReview();
  else if (ui.view === 'garden') c.innerHTML = viewGarden();
  else if (ui.view === 'study') c.innerHTML = viewStudy();
  else if (ui.view === 'wish') { ui.view = 'calendar'; c.innerHTML = viewCalendar(); }
  else c.innerHTML = viewCalendar();
  patchTop();
  setTbh();
  patchTimer();
  bindDynamic();
  paintTabs();
}
/* 顶部卡要贴在标题栏下面，高度量一下才准 */
function setTbh() {
  const tb = $('.topbar');
  if (tb) document.documentElement.style.setProperty('--tbh', tb.offsetHeight + 'px');
}
window.addEventListener('resize', () => schedule('tbh', setTbh));
function patchTop() {
  const titles = { calendar: ['日历 · 纪念日', '安排小事，也记住重要的日子'],
    review: ['复盘', '写给自己看就好'],
    garden: ['我的小花园', '做一点小事，花就长大一点'],
    study: ['备考工作台', '点一个栏目，按下开始就好'] };
  let a, b;
  if (ui.view === 'today') {
    a = ui.cur === today() ? '今天' : shortDate(ui.cur);
    b = `${relText(ui.cur)} · ${greet()}`;
  } else if (ui.view === 'study' && ui.studySid) {
    const s = sbjOf(ui.studySid);
    a = s ? `${s.e} ${s.n}` : '备考';
    b = '专心这一会儿，剩下的都先放下';
  } else { [a, b] = titles[ui.view]; }
  $('#viewTitle').textContent = a;
  $('#viewSub').textContent = b;
}
/* 动态绑定（每次渲染后调用） */
function bindDynamic() {
  const joy = $('#joyInput');
  if (joy) joy.addEventListener('change', (e) => {
    const d = ui.cur;
    state.joys[d] = e.target.value.trim(); if (!state.joys[d]) delete state.joys[d];
    save(); toast('小确幸记好啦', '🌈');
  });
  const dp = $('#dpDate');
  if (dp) dp.addEventListener('change', (e) => { if (e.target.value) setCur(e.target.value); });
  const pc = $('#planCustom');
  if (pc) pc.addEventListener('change', (e) => {
    const v = Math.max(1, Math.min(480, Number(e.target.value) || 25));
    ui.studyPlan = v; ui.studyMode = 'down';
    schedule('view', renderView);
    toast(`倒计时设成 ${v} 分钟啦`, '⏳');
  });
}

/* ==========================================================
   顶部固定卡：问候 + 隐式进度条 + 萌萌小图标
   ========================================================== */
const RING_C = 2 * Math.PI * 16;
const WISH_COLOR = { pink: 'var(--pink)', lav: 'var(--lav)', mint: 'var(--mint)', peach: 'var(--peach)', sky: 'var(--sky)' };

const ringSvg = (pct) => `<svg viewBox="0 0 38 38"><circle class="bg" cx="19" cy="19" r="16"/>`
  + `<circle class="fg" cx="19" cy="19" r="16" stroke-dasharray="${(RING_C * pct / 100).toFixed(1)} ${RING_C.toFixed(1)}"/></svg>`;
const pctOf = (d) => {
  const l = tasksOn(d), done = l.filter((x) => x.done).length;
  return { list: l, done, pct: l.length ? Math.round(done / l.length * 100) : 0 };
};
const shortDate = (d) => { const x = parse(d); return `${x.getMonth() + 1}月${x.getDate()}日 周${CN[dow(d)]}`; };
function relText(d) {
  const n = diff(today(), d);
  if (n === 0) return '就是今天呀';
  if (n === -1) return '昨天的事啦';
  if (n === 1) return '明天的安排';
  return n < 0 ? `${-n} 天前` : `还有 ${n} 天`;
}
const dayHead = (d) => {
  const n = diff(today(), d);
  if (n === 0) return '今天要做的事';
  if (n === 1) return '明天要做的事';
  if (n === -1) return '昨天做的事';
  return n < 0 ? `${-n} 天前做的事` : `${n} 天后要做的事`;
};
const countText = (l) => isMobile() ? `共 ${l.length} 件`
  : `共 ${l.length} 件 · 拖住 ⠿ 可以换顺序`;

/* 顶部卡已并入清单卡，这里只是清单卡头上的一小条 */
function heroInline() {
  const d = ui.cur, { pct } = pctOf(d);
  const soon = dueSoon();
  const isToday = d === today();
  return `<div class="lhero" id="hero">
    <div class="hero-row">
      <div class="hero-hi">
        <span class="hi-face">🌷</span>
        <span class="hi-txt">${hiLine()}</span>
      </div>
      <div class="hero-tools">
        <button class="hero-ico date ${isToday ? '' : 'on'}" data-act="hero-pop" data-pop="date" title="换个日子看看">
          <i>📅</i><span>${shortDate(d)}</span>
        </button>
        <button class="hero-ico wishbtn" data-act="hero-pop" data-pop="wish" title="就要到的纪念日">
          <i>🎗️</i>${soon.length ? `<em class="badge">${soon.length}</em>` : ''}
        </button>
        <button class="hero-ico ring" data-act="hero-pop" data-pop="progress" title="看看进度">
          ${ringSvg(pct)}<b>${pct}</b>
        </button>
      </div>
    </div>
    <div class="hero-bar" data-act="hero-pop" data-pop="progress" title="看看最近几天的进度">
      <i style="width:${pct}%"></i><span class="fl" style="left:${pct}%">🌸</span>
    </div>
    <div class="hero-pops" id="heroPops">${heroPopHtml()}</div>
  </div>`;
}
const heroPopHtml = () => ui.heroPop === 'date' ? datePop()
  : ui.heroPop === 'wish' ? wishPop()
    : ui.heroPop === 'progress' ? progressPop() : '';

/* 萌萌的日期按钮面板 */
function datePop() {
  const d = ui.cur, t = today(), ws = weekStart(d);
  return `<div class="hero-pop" data-pop="date">
    <div class="pop-h">想去哪一天看看？</div>
    <div class="dp-quick">
      <button data-act="date-off" data-off="-1">‹ 前一天</button>
      <button data-act="date-off" data-off="0" class="${d === t ? 'on' : ''}">今天</button>
      <button data-act="date-off" data-off="1">后一天 ›</button>
    </div>
    <div class="dp-week">
      ${Array.from({ length: 7 }, (_, i) => {
    const x = addDays(ws, i);
    return `<button class="${x === d ? 'on' : ''} ${x === t ? 'today' : ''}" data-act="date-set" data-date="${x}"
        title="${x}"><b>${parse(x).getDate()}</b>周${CN[i]}</button>`;
  }).join('')}
    </div>
    <div class="dp-pick"><input type="date" id="dpDate" value="${d}" /></div>
    ${d === t ? '' : `<div class="dp-foot"><button class="soft-btn" data-act="date-off" data-off="0">↩ 回到今天</button></div>`}
    <div class="dp-tip">${relText(d)}</div>
  </div>`;
}

/* 最近 7 天的小柱子 */
function days7Html() {
  return Array.from({ length: 7 }, (_, i) => {
    const x = addDays(today(), -6 + i), p = pctOf(x);
    const face = !p.list.length ? '·' : p.pct === 100 ? '🌸' : p.pct >= 50 ? '🌿' : p.pct > 0 ? '🌱' : '·';
    return `<div class="pp-day ${x === today() ? 'today' : ''}" title="${x} · 完成 ${p.done}/${p.list.length}">
      <div class="col"><i style="height:${p.pct}%"></i><span class="fc">${face}</span></div>
      <div class="lb">周${CN[dow(x)]}</div>
    </div>`;
  }).join('');
}
function progressPop() {
  const d = ui.cur, { list, done, pct } = pctOf(d);
  const wk = weekStart(today());
  const weekDone = tasksIn(wk, addDays(wk, 6)).filter((x) => x.done).length;
  return `<div class="hero-pop wide" data-pop="progress">
    <div class="pop-h">${d === today() ? '今日进度' : shortDate(d) + ' 的进度'}</div>
    <div class="pp-now">
      <span class="big">${pct}%</span>
      <span class="s">完成 ${done} / ${list.length} 件${list.length ? `　还剩 ${list.length - done} 件` : ''}</span>
    </div>
    <div class="pp-bar"><i style="width:${pct}%"></i></div>
    <div class="pop-h2">最近 7 天</div>
    <div class="pp-days">${days7Html()}</div>
    <div class="pp-sum">本周已完成 ${weekDone} 件 · 连续 ${streakDays()} 天有完成 🌱</div>
    <button class="wp-more" data-act="nav" data-view="calendar">去日历里看看 📅</button>
  </div>`;
}

/* 纪念日小图标面板 */
function wishPop() {
  const t = today();
  let show = dueSoon();
  let head = '快要到啦 🎗️';
  if (!show.length) {
    head = '接下来会来 🎗️';
    show = state.wishes.map((w) => ({ w, d: diff(t, nextDate(w)) }))
      .filter((x) => x.d >= 0).sort((a, b) => a.d - b.d).slice(0, 4);
  }
  return `<div class="hero-pop" data-pop="wish">
    <div class="pop-h">${head}</div>
    ${show.length ? show.map((x) => `<button class="wp-item" data-act="wish-jump" data-id="${x.w.id}" title="${nextDate(x.w)}">
        <span class="ico">${x.w.icon}</span>
        <span class="t">${esc(x.w.title)}</span>
        <span class="d">${x.d === 0 ? '就是今天' : x.d + ' 天'}</span>
      </button>`).join('')
      : '<div class="pop-empty"><span>🎗️</span>暂时没有临近的日子呀</div>'}
    <button class="wp-more" data-act="memo-goto">去日历里看看纪念日 🎗️</button>
  </div>`;
}

/* ---------- 今天：以清单为主体 ---------- */
function viewToday() {
  return `<div id="todayBody">${todayBody()}</div>`;
}
function todayBody() {
  const d = ui.cur, list = tasksOn(d), isToday = d === today();
  return `<section class="card list-card">
    ${heroInline()}
    <div class="card-head">
      <div><h3>${dayHead(d)}</h3><div class="sub" id="listCount">${countText(list)}</div></div>
      <div style="display:flex;gap:6px">
        <button class="round-btn" data-act="cur-prev" title="前一天">‹</button>
        <button class="round-btn" data-act="cur-next" title="后一天">›</button>
        <button class="soft-btn" data-act="new-task" data-date="${d}">＋ 详细添加</button>
      </div>
    </div>
    <div class="add-row">
      <input type="text" id="quickAdd" placeholder="想做点什么？写完按回车~" />
      <button class="soft-btn primary" data-act="quick-add">记下</button>
    </div>
    ${listBox(d, list)}
  </section>
  <section class="card">
    <div class="card-head"><h3>${isToday ? '今天' : '这天'}的心情</h3><span class="sub">点一点，记下来</span></div>
    <div class="mood-strip">
      ${Object.keys(MOODS).map((k) => `<button class="mood-chip ${state.moods[d] === k ? 'on' : ''}" data-act="mood" data-mood="${k}">${MOODS[k]} ${MOOD_NAME[k]}</button>`).join('')}
    </div>
    <div style="margin-top:14px" class="field">
      <span>${isToday ? '今天' : '这天'}的一件小确幸 🌈</span>
      <input type="text" id="joyInput" placeholder="写下一件让你开心的小事~" value="${esc(state.joys[d] || '')}" />
    </div>
  </section>
  ${isToday ? gardenCard() : ''}`;
}
function listBox(date, list) {
  return `<div class="tlist" id="tlist" data-date="${date}">
    ${list.length ? list.map(taskRow).join('')
      : `<div class="empty-guide">
          <span class="eg-face">🌱</span>
          <div class="eg-t">${date === today() ? '今天还是空白的一天' : '这天还没有安排'}</div>
          <div class="eg-s">写一句你想完成的事，或者先看看怎么用</div>
          <button class="soft-btn" data-act="guide-open">🎓 看一遍引导</button>
        </div>`}
  </div>`;
}
/* ---------- 我的小花园 ---------- */
function gardenCard() {
  const g = state.garden, st = gardenStat(), r = rankNow();
  const alive = g.plots.filter(Boolean);
  const bloom = alive.filter((p) => p.stage >= 2).length;
  const dots = alive.slice(0, 6).map((p) => plantOf(p.k).emo[p.stage]).join('');
  return `<section class="card garden-teaser" data-act="nav" data-view="garden" role="button" tabindex="0">
    <div class="gt-left">
      <div class="gt-title">我的小花园 <em>Lv.${r.lv} ${r.n}</em></div>
      <div class="gt-sub">${alive.length ? `${alive.length} 株在长，${bloom} 朵开啦` : '还是一片空地，等你来种'}</div>
      <div class="gt-dots">${dots || '🪴'}</div>
    </div>
    <div class="gt-right">
      <div class="gt-drop"><span>💧</span><b>${st.drops}</b></div>
      <div class="gt-go">去花园 →</div>
    </div>
  </section>`;
}

/* ---------- 花园页 ---------- */
function viewGarden() {
  const g = state.garden, st = gardenStat(), r = rankNow();
  const w = weatherOf(today());
  const next = RANKS.find((x) => x.lv === r.lv + 1);
  const pct = next ? Math.min(100, Math.round((st.total - r.need) / (next.need - r.need) * 100)) : 100;
  const plots = gardenPlots();
  const room = plots.filter((p) => !p).length;

  return `<section class="card garden-main" data-w="${w.k}">
    <div class="gd-sky">
      <i class="gd-cloud a"></i><i class="gd-cloud b"></i><i class="gd-cloud c"></i>
      <div class="gd-hud">
        <div class="gd-lv"><b>Lv.${r.lv}</b><span>${r.n}</span></div>
        <div class="gd-drops"><span>💧</span><b id="gdDrops">${st.drops}</b></div>
      </div>
      <div class="gd-weather">${w.e} ${w.n} · ${w.tip}</div>
      <div class="gd-rain">${Array.from({ length: 12 }, (_, i) => `<i style="left:${6 + i * 8}%;animation-delay:${(i * .17).toFixed(2)}s"></i>`).join('')}</div>
    </div>
    <div class="gd-soil">
      <div class="gd-plots">${plots.map(plotCell).join('')}</div>
      <div class="gd-pet">
        <div class="gd-say" id="gdSay">${botLine()}</div>
        <div class="gd-rabbit"><span>${g.bot.face || '🐰'}</span><i class="blush"></i></div>
      </div>
    </div>
    <div class="gd-foot">
      <div class="gd-bar"><i style="width:${pct}%"></i></div>
      <div class="gd-bar-txt">${next ? `再攒 <b>${Math.max(0, next.need - st.total)}</b> 滴露珠升到 ${next.n}` : '已经是最高等级啦，花园归你管 🌳'}</div>
      <div class="gd-quick">
        <button class="soft-btn" data-act="water-all">💧 挨个浇一遍</button>
        <button class="soft-btn" data-act="garden-dex">📖 花之图鉴</button>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-head"><h3>种子小铺</h3><span class="sub">${room ? `还有 ${room} 块空地` : '先把花开出来，地就空出来啦'}</span></div>
    <div class="seed-row">
      ${PLANTS.map((p, i) => {
        const got = g.dex[p.k] || 0;
        const poor = st.drops < p.cost;
        return `<button class="seed ${poor ? 'poor' : ''} ${got ? 'got' : ''}" data-act="sow" data-kind="${p.k}" title="${p.tip}">
          <span class="sd-emo">${p.emo[2]}</span>
          <span class="sd-n">${p.n}</span>
          <span class="sd-c">${p.cost ? `${p.cost} 💧` : '免费'}</span>
          ${got ? `<i class="sd-got">×${got}</i>` : ''}
        </button>`;
      }).join('')}
    </div>
  </section>

  <section class="card">
    <div class="card-head"><h3>花之图鉴</h3><span class="sub">收获过的花会一直留在这里</span></div>
    <div class="dex-row">
      ${PLANTS.map((p) => {
        const n = g.dex[p.k] || 0;
        return `<div class="dex ${n ? 'on' : ''}" title="${p.tip}">
          <div class="dx-emo">${n ? p.emo[2] : '❔'}</div>
          <div class="dx-n">${p.n}</div>
          <div class="dx-c">${n ? `已收 ${n} 朵` : `${p.cost} 滴可种`}</div>
        </div>`;
      }).join('')}
    </div>
    <div class="gd-split"></div>
    <div class="card-head" style="margin-bottom:8px"><h3>小小徽章</h3><span class="sub">${g.seen.length}/${BADGES.length} 枚</span></div>
    <div class="badge-row">
      ${BADGES.map((b) => {
        const on = g.seen.includes(b.k);
        return `<div class="badge ${on ? 'on' : ''}" title="${b.d}">
          <div class="bd-e">${on ? b.e : '🔒'}</div>
          <div class="bd-n">${b.n}</div>
          <div class="bd-d">${b.d}</div>
        </div>`;
      }).join('')}
    </div>
  </section>

  <section class="card drop-rule">
    <div class="card-head"><h3>💧 露珠从哪儿来</h3><span class="sub">每一滴都有名字</span></div>
    <div class="sy-dr-h">做小事 · 每件 3 滴</div>
    <div class="sy-dr-more">🌶️ 先做这个 ＋2 · 🌼 慢慢来 ＋1 · 🔁 重复坚持 ＋1 · 取消勾选会退回当次的露珠（花园已经升过的等级不会降）</div>
    <div class="sy-dr-h" style="margin-top:14px">学备考 · 按时长给</div>
    <div class="sy-dr-tiers">${DROP_TIERS.slice().reverse().map((x) =>
      `<div class="sy-dr-tier"><b>＋${x.n}</b><span>${x.n2}</span></div>`).join('')}</div>
    <div class="sy-dr-more">加成：倒计时说到做到 ＋1 · 连续学习 ≥3 天 连击 ＋15% · ☔ 雨天学习 ＋1 · 认真写复盘 ＋2 · 正确率 ≥80% 再 ＋2 · 留下声音/影像 ＋1</div>
    <div class="sy-dr-more mut">中断 ≥3 次 －1（就一点点，别心疼）· 不到 10 分钟不算一段 · 低于 1 分钟自动丢弃</div>
    <div class="sy-dr-h" style="margin-top:14px">收花 · 回一笔</div>
    <div class="sy-dr-more">每收一朵花 ＋8~21 滴，越贵的花回得越多；☔ 雨天每株免费浇一次水。</div>
  </section>`;
}

function plotCell(p, i) {
  if (!p) {
    return `<button class="plot empty" data-act="plot" data-i="${i}">
      <span class="pl-plus">＋</span><span class="pl-hint">种点什么</span></button>`;
  }
  const d = plantOf(p.k);
  const full = p.stage >= 2;
  const need = full ? 1 : d.need[p.stage];
  const pct = full ? 100 : Math.round(p.water / need * 100);
  return `<button class="plot grow s${p.stage}" data-act="plot" data-i="${i}" style="--pc:${d.c}" title="${d.tip}">
    <span class="pl-emo">${d.emo[p.stage]}</span>
    <span class="pl-bar"><i style="width:${pct}%"></i></span>
    <span class="pl-name">${d.n}</span>
    <span class="pl-tag">${full ? '点我收获' : `${p.water}/${need} 滴`}</span>
  </button>`;
}
function taskRow(t) {
  const tg = tagOf(t.tag);
  const bkStyle = tg && tg.c ? ` style="background:var(--${tg.c}-s);color:var(--${tg.c})"` : '';
  return `<div class="task-wrap" data-id="${t.id}">
    <div class="sw-act sw-right">
      <button class="sw-btn done" data-act="toggle" data-id="${t.id}" tabindex="-1"><i>✓</i><span>${t.done ? '撤销' : '完成'}</span></button>
      <button class="sw-btn del" data-act="del-task" data-id="${t.id}" tabindex="-1"><i>🗑</i><span>删除</span></button>
    </div>
    <div class="sw-act sw-left">
      <button class="sw-btn edit" data-act="edit-task" data-id="${t.id}" tabindex="-1"><i>✏️</i><span>编辑</span></button>
    </div>
    <div class="task ${t.done ? 'done' : ''}" draggable="true" data-id="${t.id}">
      <span class="grip" title="拖我换顺序">⠿</span>
      <button class="tick" data-act="toggle" data-id="${t.id}" title="完成它"></button>
      <div class="t-main">
        <div class="t-title">${esc(t.title)}</div>
        <div class="t-meta">
          ${t.time ? `<span>${t.time}</span>` : ''}
          ${tg ? `<span class="chip"${bkStyle}>${tg.e} ${esc(tg.k)}</span>` : ''}
          ${t.rep && t.rep.unit ? `<span class="chip rep" title="重复的小事">🔁 ${repText(t.rep)}</span>` : ''}
          <span class="chip ${t.priority}">${PRI[t.priority].e} ${PRI[t.priority].t}</span>
          ${!t.done && t.date < today() ? '<span class="chip high">还没做呢</span>' : ''}
        </div>
        ${t.note ? `<div class="t-note">${esc(t.note)}</div>` : ''}
      </div>
      <div class="t-act">
        <button class="ico-btn" data-act="edit-task" data-id="${t.id}">✏️</button>
        <button class="ico-btn" data-act="del-task" data-id="${t.id}">🗑️</button>
      </div>
    </div>
  </div>`;
}

/* 局部刷新：只更新该动的地方，不整页重绘 */
function patchList() {
  const box = $('#tlist'); if (!box) return;
  const date = box.dataset.date;
  const list = tasksOn(date);
  box.innerHTML = list.length ? list.map(taskRow).join('')
    : '<div class="empty"><span class="face">🌷</span>这天还没有安排呢，想到什么就先记下来吧</div>';
  const cnt = document.getElementById('listCount');
  if (cnt) cnt.textContent = countText(list);
}
/* 只更新顶部卡上的文字与进度，不动小面板的结构 */
function patchHero() {
  const el = $('#hero'); if (!el) return;
  const d = ui.cur, { pct } = pctOf(d);
  const dt = el.querySelector('.hero-ico.date');
  if (dt) {
    dt.classList.toggle('on', d !== today());
    const s = dt.querySelector('span'); if (s) s.textContent = shortDate(d);
  }
  const bar = el.querySelector('.hero-bar i'); if (bar) bar.style.width = pct + '%';
  const fl = el.querySelector('.hero-bar .fl'); if (fl) fl.style.left = pct + '%';
  const ring = el.querySelector('.hero-ico.ring');
  if (ring) {
    const fg = ring.querySelector('.fg');
    if (fg) fg.setAttribute('stroke-dasharray', `${(RING_C * pct / 100).toFixed(1)} ${RING_C.toFixed(1)}`);
    const b = ring.querySelector('b'); if (b) b.textContent = pct;
  }
  const n = dueSoon().length;
  const wb = el.querySelector('.hero-ico.wishbtn');
  if (wb) wb.innerHTML = `<i>🎀</i>${n ? `<em class="badge">${n}</em>` : ''}`;
  syncPop();
}
/* 面板开着时，把它里面的数字同步一下 */
function syncPop() {
  const p = document.querySelector('#heroPops .hero-pop'); if (!p) return;
  const d = ui.cur, { list, done, pct } = pctOf(d);
  const kind = p.dataset.pop;
  if (kind === 'progress') {
    const big = p.querySelector('.big'); if (big) big.textContent = pct + '%';
    const s = p.querySelector('.s');
    if (s) s.textContent = `完成 ${done} / ${list.length} 件${list.length ? `　还剩 ${list.length - done} 件` : ''}`;
    const bar = p.querySelector('.pp-bar i'); if (bar) bar.style.width = pct + '%';
    const days = p.querySelector('.pp-days'); if (days) days.innerHTML = days7Html();
    const wk = weekStart(today());
    const sum = p.querySelector('.pp-sum');
    if (sum) sum.textContent = `本周已完成 ${tasksIn(wk, addDays(wk, 6)).filter((x) => x.done).length} 件 · 连续 ${streakDays()} 天有完成 🌱`;
    const h = p.querySelector('.pop-h');
    if (h) h.textContent = d === today() ? '今日进度' : shortDate(d) + ' 的进度';
  } else if (kind === 'date') {
    const tip = p.querySelector('.dp-tip'); if (tip) tip.textContent = relText(d);
    p.querySelectorAll('.dp-week button').forEach((b) => b.classList.toggle('on', b.dataset.date === d));
    p.querySelectorAll('.dp-quick button').forEach((b) => b.classList.toggle('on', +b.dataset.off === 0 && d === today()));
  }
}
/* 花园局部刷新：只换一格 + 顶部数字 */
function patchPlot(i) {
  const box = $('.gd-plots'); if (!box) return;
  const cell = box.children[i]; if (!cell) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = plotCell(state.garden.plots[i], i);
  const nw = tmp.firstElementChild; if (!nw) return;
  cell.replaceWith(nw);
  nw.classList.add('pop');
}
function patchGardenHud() {
  const d = $('#gdDrops'); if (d) d.textContent = state.garden.drops;
  const say = $('#gdSay'); if (say) say.textContent = botLine();
}
function patchTeaser() {
  const el = $('.garden-teaser');
  if (el) el.outerHTML = gardenCard();
}
function patchProgress() { patchHero(); }
/* 换日期：只重建清单区，顶部卡保持不动 */
function patchToday() {
  const box = $('#todayBody');
  if (box) box.innerHTML = todayBody();
  patchHero(); patchTop(); bindDynamic();
}
function setCur(d) {
  if (!d) return;
  ui.cur = d; ui.sel = d; ui.anchor = d;
  schedule('today', patchToday);
}
function renderHeroPops() {
  const pops = $('#heroPops'); if (!pops) return;
  pops.innerHTML = heroPopHtml();
  bindDynamic();
}
function patchRow(id) {
  const t = state.tasks.find((x) => x.id === id);
  const el = document.querySelector(`.task[data-id="${id}"]`);
  if (!t || !el) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = taskRow(t);
  /* 外面包着左滑操作层，整块换掉；没有包裹层时退回直接替换 */
  const wrap = el.closest('.task-wrap');
  (wrap || el).replaceWith(tmp.firstElementChild);
}

/* ---------- 日历 ---------- */
function viewCalendar() {
  const t = today(), a = ui.anchor;
  return `<section class="card">
    <div class="pill-row">
      <button class="pill ${ui.cal === 'month' ? 'on' : ''}" data-act="cal" data-mode="month">月</button>
      <button class="pill ${ui.cal === 'week' ? 'on' : ''}" data-act="cal" data-mode="week">周</button>
    </div>
    <div class="cal-head">
      <button class="round-btn" data-act="prev">‹</button>
      <b>${ui.cal === 'month' ? monthText(a) : `${weekStart(a).slice(5).replace('-', '.')} - ${addDays(weekStart(a), 6).slice(5).replace('-', '.')}`}</b>
      <button class="round-btn" data-act="next">›</button>
    </div>
    ${ui.cal === 'month' ? monthGrid(a) : weekGrid(a)}
    <div class="cal-foot">
      <button class="pill" data-act="today">回到今天</button>
      <span class="cal-tip">${ui.pick ? `${dayText(ui.pick)} 的清单在下面 ↓ 再点一次可收起` : '点一天，看看那天要做什么'}</span>
    </div>
  </section>
  ${memoCard()}
  ${ui.pick ? dayCard() : ''}`;
}
/* 选中的那一天：小事 + 这一天的纪念日 + 复盘 */
function dayCard() {
  const t = today(), d = ui.pick || ui.sel;
  const memos = state.wishes.filter((w) => nextDate(w) === d);
  return `<section class="card" id="dayZone">
    <div class="card-head">
      <div><h3>${dayText(d)}</h3><span class="sub">${d === t ? '就是今天呀' : diff(d, t) > 0 ? `${diff(d, t)} 天前` : `还有 ${-diff(d, t)} 天`}</span></div>
      <div style="display:flex;gap:6px;align-items:center">
        <button class="soft-btn primary" data-act="new-task" data-date="${d}">＋ 加一件</button>
        <button class="round-btn" data-act="day-close" title="收起这一天的清单">✕</button>
      </div>
    </div>
    ${memos.length ? `<div class="memo-strip">${memos.map((w) =>
      `<button class="memo-chip c-${w.color}" data-act="edit-wish" data-id="${w.id}" title="点一下可以改">
        ${w.icon} ${esc(w.title)}${w.yearly ? '<em>每年</em>' : ''}</button>`).join('')}</div>` : ''}
    <div class="add-row">
      <input type="text" id="quickAdd" placeholder="记一件这天的安排~" />
      <button class="soft-btn primary" data-act="quick-add">记下</button>
    </div>
    <div class="tlist" id="tlist" data-date="${d}">
      ${tasksOn(d).length ? tasksOn(d).map(taskRow).join('')
      : '<div class="empty"><span class="face">☁️</span>这天还空着，想安排点什么吗？</div>'}
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="soft-btn" data-act="new-wish" data-date="${d}">🎗️ 把这天记成纪念日</button>
      <button class="soft-btn" data-act="new-review" data-type="day" data-date="${d}">💌 写这天的小复盘</button>
      <button class="soft-btn" data-act="new-review" data-type="week" data-date="${weekStart(d)}">📅 写这周的复盘</button>
    </div>
  </section>`;
}
/* 纪念日管理：融进日历的下半截 */
function memoCard() {
  const list = wishList(), v = ui.wishView;
  const tip = (WISH_VIEWS.find((x) => x.k === v) || WISH_VIEWS[0]).tip;
  const t = today();
  const soon = list.filter((x) => x.d >= 0 && x.d <= 7);
  return `<section class="card" id="memoZone">
    <div class="card-head">
      <div><h3>🎗️ 纪念日</h3>
        <div class="sub">${soon.length ? `最近 7 天有 ${soon.length} 个日子` : '生日、考试、约定…重要的日子都放这里'}</div></div>
      <button class="soft-btn primary" data-act="new-wish">＋ 记一个日子</button>
    </div>
    ${soon.length ? `<div class="memo-soon">${soon.map((x) =>
      `<button class="memo-chip c-${x.w.color}" data-act="edit-wish" data-id="${x.w.id}">
        ${x.w.icon} ${esc(x.w.title)}<em>${x.d === 0 ? '今天' : x.d + ' 天'}</em></button>`).join('')}</div>` : ''}
    ${list.length ? `<div class="wish-bar in-card">
        <div class="vswitch">
          ${WISH_VIEWS.map((x) => `<button class="${v === x.k ? 'on' : ''}" data-act="wish-view" data-view="${x.k}" title="${x.tip}"><i>${x.e}</i>${x.n}</button>`).join('')}
        </div>
      </div>
      ${wishBody(list, v)}`
      : '<div class="empty"><span class="face">🎗️</span>还没有记下重要的日子，点右上角加一个吧</div>'}
  </section>`;
}
function monthGrid(a) {
  const t = today();
  const start = weekStart(monthStart(a));
  const cells = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  return `<div class="cal-grid">
    ${CN.map((d) => `<div class="cal-dow">${d}</div>`).join('')}
    ${cells.map((d) => {
    const l = tasksOn(d);
    const out = parse(d).getMonth() !== parse(a).getMonth();
    const wishes = state.wishes.filter((w) => nextDate(w) === d);
    const mood = state.moods[d];
    const tip = wishes.length ? wishes.map((w) => w.icon + ' ' + w.title).join(' · ') : '';
    return `<button class="cell ${out ? 'out' : ''} ${d === t ? 'today' : ''} ${d === ui.sel ? 'sel' : ''} ${wishes.length ? 'has-memo' : ''}" data-act="sel" data-date="${d}"${tip ? ` title="${esc(tip)}"` : ''}>
        <span class="num">${parse(d).getDate()}</span>
        ${wishes.length ? `<span class="mini">${wishes.slice(0, 2).map((w) => w.icon).join('')}</span>` : ''}
        <span class="dots">${l.slice(0, 3).map((x) => `<i class="${x.done ? 'd' : ''}"></i>`).join('')}</span>
        ${mood ? `<span class="mini">${MOODS[mood]}</span>` : ''}
      </button>`;
  }).join('')}
  </div>`;
}
function weekGrid(a) {
  const s = weekStart(a), t = today();
  return `<div class="week-grid">${Array.from({ length: 7 }, (_, i) => {
    const d = addDays(s, i), l = tasksOn(d);
    const w = state.wishes.filter((x) => nextDate(x) === d);
    return `<div class="wcol ${d === t ? 'today' : ''} ${d === ui.sel ? 'sel' : ''}" data-act="sel" data-date="${d}">
      <div class="wd"><b>${parse(d).getDate()}</b>周${CN[dow(d)]}</div>
      ${w.map((x) => `<div class="witem">${x.icon} ${esc(x.title)}</div>`).join('')}
      ${l.map((x) => `<div class="witem ${x.done ? 'done' : ''}" data-act="edit-task" data-id="${x.id}">${esc(x.title)}</div>`).join('')}
    </div>`;
  }).join('')}</div>`;
}

/* ---------- 复盘 ---------- */
function viewReview() {
  const tabs = ['day', 'week', 'month', 'stage'];
  const names = { day: '今天', week: '这一周', month: '这个月', stage: '一个阶段' };
  const list = state.reviews.filter((r) => r.type === ui.reviewTab).sort((a, b) => a.date < b.date ? 1 : -1);
  return `<div class="pill-row">
      ${tabs.map((t) => `<button class="pill ${ui.reviewTab === t ? 'on' : ''}" data-act="rtab" data-tab="${t}">${names[t]}</button>`).join('')}
    </div>
    <div style="text-align:center;margin-bottom:14px">
      <button class="soft-btn primary" data-act="new-review" data-type="${ui.reviewTab}"
        data-date="${ui.reviewTab === 'week' ? weekStart(today()) : ui.reviewTab === 'month' ? monthStart(today()) : today()}">
        💌 写${names[ui.reviewTab]}的复盘</button>
    </div>
    ${list.length ? list.map(letterCard).join('')
      : '<div class="card"><div class="empty"><span class="face">💌</span>还没有写给自己的信，点上面写第一封吧~</div></div>'}`;
}
function letterCard(r) {
  const range = r.type === 'day' ? dayText(r.date)
    : r.type === 'week' ? `${r.date.slice(5)} - ${r.endDate.slice(5)}`
      : r.type === 'month' ? monthText(r.date) : `${r.date} - ${r.endDate || '进行中'}`;
  const { a, b } = reviewRange(r);
  const all = tasksIn(a, b), dn = all.filter((x) => x.done);
  return `<div class="letter">
    <div class="letter-top">
      <span class="face">${MOODS[r.mood] || '😊'}</span>
      <div><div class="when">${range}</div><div class="sub">完成了 ${dn.length} 件小事 · ${typeName(r.type)}</div></div>
      <div class="letter-act">
        <button class="ico-btn" data-act="edit-review" data-id="${r.id}">✏️</button>
        <button class="ico-btn" data-act="del-review" data-id="${r.id}">🗑️</button>
      </div>
    </div>
    <div class="letter-body">
      <p><span class="lb">做得不错的：</span>${esc(r.good || '—')}</p>
      <p><span class="lb">想对自己说：</span>${esc(r.words || '—')}</p>
    </div>
    ${r.next ? `<div class="next-line">🌱 接下来先做：${esc(r.next)}</div>` : ''}
    ${dn.length ? `<div class="sub" style="margin-top:8px;font-size:12px">这段时间做完：${dn.slice(0, 4).map((x) => esc(x.title)).join('、')}${dn.length > 4 ? ' 等 ' + dn.length + ' 件' : ''}</div>` : ''}
  </div>`;
}
const typeName = (t) => ({ day: '日复盘', week: '周复盘', month: '月复盘', stage: '阶段复盘' }[t]);
function reviewRange(r) {
  if (r.type === 'day') return { a: r.date, b: r.date };
  if (r.type === 'week') return { a: weekStart(r.date), b: addDays(weekStart(r.date), 6) };
  if (r.type === 'month') return { a: monthStart(r.date), b: monthEnd(r.date) };
  return { a: r.date, b: r.endDate || today() };
}

/* ---------- 纪念日：四种展示样式（嵌在日历页里） ---------- */
const WISH_VIEWS = [
  { k: 'grid', e: '🗂️', n: '平铺', tip: '大卡片，信息一眼看全' },
  { k: 'list', e: '📃', n: '列表', tip: '一行一条，扫一眼就够' },
  { k: 'fold', e: '📦', n: '折叠', tip: '按远近分组，点开才展开' },
  { k: 'mini', e: '🔲', n: '迷你', tip: '小磁贴，一屏装下好多' },
];
function wishList() {
  const t = today();
  return state.wishes.map((w) => ({ w, d: diff(t, nextDate(w)), nd: nextDate(w) }))
    .sort((a, b) => (a.d >= 0 ? a.d : 9999) - (b.d >= 0 ? b.d : 9999));
}
function viewWish() {
  const list = wishList(), v = ui.wishView;
  const tip = (WISH_VIEWS.find((x) => x.k === v) || WISH_VIEWS[0]).tip;
  return `<div class="wish-bar">
      <div class="vswitch">
        ${WISH_VIEWS.map((x) => `<button class="${v === x.k ? 'on' : ''}" data-act="wish-view" data-view="${x.k}"><i>${x.e}</i>${x.n}</button>`).join('')}
      </div>
      <span class="wish-tip">${tip}</span>
      <div class="spacer"></div>
      <button class="soft-btn primary" data-act="new-wish">🎗️ 记一个日子</button>
    </div>
    ${list.length ? wishBody(list, v)
      : '<div class="card"><div class="empty"><span class="face">🎗️</span>还没有记下重要的日子</div></div>'}`;
}
function wishBody(list, v) {
  if (v === 'list') return `<div class="wish-list">${list.map(wishRow).join('')}</div>`;
  if (v === 'mini') return `<div class="wish-mini">${list.map(wishMini).join('')}</div>`;
  if (v === 'fold') return wishFold(list);
  return `<div class="wish-grid">${list.map(wishCard).join('')}</div>`;
}
/* 折叠视图：按远近分组 */
function wishFold(list) {
  const gs = [
    { k: 'soon', e: '🌶️', n: '7 天内', test: (x) => x.d >= 0 && x.d <= 7 },
    { k: 'month', e: '🌼', n: '30 天内', test: (x) => x.d > 7 && x.d <= 30 },
    { k: 'later', e: '🍃', n: '更远的日子', test: (x) => x.d > 30 },
    { k: 'past', e: '💗', n: '已经过去', test: (x) => x.d < 0 },
  ].map((g) => ({ ...g, items: list.filter(g.test) })).filter((g) => g.items.length);

  // 第一次进来：默认展开「7 天内」，没有的话展开第一组
  gs.forEach((g, i) => { if (ui.wishFold[g.k] == null) ui.wishFold[g.k] = g.k === 'soon' || i === 0; });

  return gs.map((g) => {
    const open = ui.wishFold[g.k];
    return `<div class="wgroup ${open ? 'open' : ''}">
      <button class="wgroup-h" data-act="wish-fold" data-group="${g.k}">
        <span class="ar">▶</span><span>${g.e} ${g.n}</span><span class="n">${g.items.length} 个${open ? '' : ' · 点开看看'}</span>
      </button>
      <div class="wgroup-b">${open ? `<div class="wish-list">${g.items.map(wishRow).join('')}</div>` : ''}</div>
    </div>`;
  }).join('');
}
const wishProg = (x) => {
  const total = Math.max(1, Math.abs(diff(x.w.createdAt || x.nd, x.nd)));
  const gone = Math.min(total, Math.max(0, diff(x.w.createdAt || x.nd, today())));
  return Math.round(gone / total * 100);
};
const wishDays = (x) => x.d === 0 ? '今天' : x.d > 0 ? `${x.d} 天后` : `${-x.d} 天前`;
function wishDetail(x) {
  const { w, nd } = x;
  return `<div class="wish-det">
    <div><span class="k">日子：</span>${nd}${w.yearly ? '（每年都有一次）' : ''}</div>
    <div><span class="k">提醒：</span>${w.remind == 0 ? '就当天提醒我' : `提前 ${w.remind} 天提醒我`}${x.d >= 0 && x.d <= Number(w.remind) ? ' · 已经在提醒啦' : ''}</div>
    ${w.note ? `<div><span class="k">备注：</span>${esc(w.note)}</div>` : ''}
  </div>`;
}
/* 大卡片 */
function wishCard(x) {
  const { w, d, nd } = x, past = d < 0;
  const cv = WISH_COLOR[w.color] || 'var(--pink)';
  const open = !!ui.wishOpen[w.id];
  return `<div class="wish c-${w.color}" data-act="wish-open" data-id="${w.id}" title="点一下看详情">
    <div class="wish-act">
      <button class="ico-btn" data-act="edit-wish" data-id="${w.id}">✏️</button>
      <button class="ico-btn" data-act="del-wish" data-id="${w.id}">🗑️</button>
    </div>
    <div class="ico">${w.icon}</div>
    <div class="wt">${esc(w.title)}</div>
    <div class="wm">${nd}${w.yearly ? ' · 每年' : ''}</div>
    <div class="dd">${past ? -d : d}<small>${past ? '天前啦' : d === 0 ? '就是今天！' : '天后'}</small></div>
    <div class="wbar"><i style="width:${past ? 100 : wishProg(x)}%;background:${cv}"></i></div>
    <div class="wf"><span>${w.remind == 0 ? '当天提醒' : `提前 ${w.remind} 天提醒`}${!past && d <= Number(w.remind) ? ' · 已提醒' : ''}</span>
      <span style="text-align:right">${esc(w.note || '')}</span></div>
    ${open ? wishDetail(x) : ''}
  </div>`;
}
/* 一行一条 */
function wishRow(x) {
  const { w, d, nd } = x, past = d < 0;
  const cv = WISH_COLOR[w.color] || 'var(--pink)';
  const open = !!ui.wishOpen[w.id];
  return `<div class="wrow c-${w.color}" data-act="wish-open" data-id="${w.id}" title="点一下看详情">
      <span class="ico">${w.icon}</span>
      <div class="wm">
        <div class="tt">${esc(w.title)}</div>
        <div class="ss">${nd}${w.yearly ? ' · 每年' : ''} · ${w.remind == 0 ? '当天提醒' : `提前${w.remind}天`}</div>
      </div>
      ${past ? '' : `<div class="pb"><i style="width:${wishProg(x)}%;background:${cv}"></i></div>`}
      <div class="dd2">${past ? -d : d}<small>${past ? '天前' : d === 0 ? '今天' : '天后'}</small></div>
      <div class="t-act">
        <button class="ico-btn" data-act="edit-wish" data-id="${w.id}">✏️</button>
        <button class="ico-btn" data-act="del-wish" data-id="${w.id}">🗑️</button>
      </div>
    </div>
    ${open ? wishDetail(x) : ''}`;
}
/* 小磁贴 */
function wishMini(x) {
  const { w, d } = x, past = d < 0;
  return `<button class="wmini c-${w.color}" data-act="edit-wish" data-id="${w.id}" title="${esc(w.title)} · ${x.nd} · ${wishDays(x)}">
    <div class="ico">${w.icon}</div>
    <div class="n">${past ? -d : d}</div>
    <div class="u">${past ? '天前' : d === 0 ? '今天' : '天后'}</div>
    <div class="tt">${esc(w.title)}</div>
  </button>`;
}

/* ==========================================================
   弹窗
   ========================================================== */
const editing = { task: null, review: null, wish: null };
function openMask(s) {
  const m = $(s); if (!m) return;
  closeSwipes();
  const mo = m.querySelector('.modal');
  if (mo) { mo.scrollTop = 0; mo.style.transform = ''; mo.classList.remove('sheet-down'); }
  m.classList.add('open');
  lockScroll();          /* 弹层打开时别让背后的页面跟着手指跑 */
  autoGrow(mo);
}
/* 关弹窗：手机上是底部弹层，先往下滑走再关 */
function closeMasks() {
  /* 关掉弹层顺手收键盘，否则 iOS 的键盘会一直停在屏幕上 */
  try {
    const a = document.activeElement;
    if (a && a.closest && a.closest('.mask') && a.blur) a.blur();
  } catch (e) { }
  $$('.mask.open').forEach((m) => {
    const mo = m.querySelector('.modal');
    if (mo && isMobile()) {
      mo.classList.add('sheet-down');
      setTimeout(() => {
        m.classList.remove('open'); mo.classList.remove('sheet-down'); mo.style.transform = '';
        syncScrollLock();
      }, 190);
    } else {
      m.classList.remove('open');
      if (mo) mo.style.transform = '';
      setTimeout(syncScrollLock, 0);
    }
  });
  if (!anyMaskOpen()) setTimeout(syncScrollLock, 200);
}

function openTask(id, date) {
  const t = id ? state.tasks.find((x) => x.id === id) : null;
  editing.task = id || null;
  $('#taskTitle').textContent = t ? '改一改这件事' : '添加一件小事';
  $('#btnDelTask').classList.toggle('hidden', !t);
  const f = $('#formTask'); f.reset();
  const e = f.elements;
  e.id.value = t ? t.id : '';
  e.title.value = t ? t.title : '';
  e.date.value = t ? t.date : (date || (ui.view === 'calendar' ? ui.sel : ui.cur));
  e.time.value = t ? t.time || '' : '';
  e.note.value = t ? t.note || '' : '';
  let tag = t ? t.tag : (state.settings.lastTag || '生活'), pri = t ? t.priority : 'mid';
  if (!tagOf(tag)) tag = '生活';
  e.tag.value = tag; e.priority.value = pri;
  closeBasketBox();
  renderTagRow(tag);
  $$('#priRow button').forEach((b) => b.classList.toggle('on', b.dataset.pri === pri));
  ui.rep = t && t.rep ? { unit: t.rep.unit, every: t.rep.every } : null;
  renderRepRow();
  openMask('#maskTask');
  setTimeout(() => e.title.focus(), 40);
}

/* ---------- 重复频率 ---------- */
function renderRepRow() {
  const r = ui.rep;
  const preset = !r ? 'none' : (r.every === 1 ? r.unit : 'custom');
  const items = [['none', '🌙 只做一次'], ['day', '每天'], ['week', '每周'], ['month', '每月'], ['custom', '自己定']];
  $('#repRow').innerHTML = items.map(([k, n]) =>
    `<button type="button" data-rep="${k}" class="${k === preset ? 'on' : ''}">${n}</button>`).join('');
  const custom = preset === 'custom';
  $('#repEveryBox').classList.toggle('hidden', !custom);
  if (custom) { $('#repEvery').value = r.every; $('#repUnit').value = r.unit; }
  updateRepHint();
}
function updateRepHint() {
  const r = ui.rep, box = $('#repHint');
  if (!box) return;
  if (!r) { box.innerHTML = '只在选中的这天出现一次'; return; }
  const base = $('#formTask').elements.date.value || today();
  const nxt = nextRep(base, r);
  box.innerHTML = `从 <b>${shortDate(base)}</b> 开始，${repText(r)}一次，下一次是 <b>${shortDate(nxt)}</b>`;
}
function readRep() {
  if (!ui.rep) return null;
  const every = clamp(Math.round(Number(ui.rep.every) || 1), 1, 30);
  return { unit: ui.rep.unit, every };
}
$('#repRow').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-rep]'); if (!b) return;
  const k = b.dataset.rep;
  if (k === 'none') ui.rep = null;
  else if (k === 'custom') ui.rep = { unit: ($('#repUnit').value || 'day'), every: clamp(Number($('#repEvery').value) || 2, 1, 30) };
  else ui.rep = { unit: k, every: 1 };
  renderRepRow();
});
['repEvery', 'repUnit'].forEach((n) => {
  const el = document.getElementById(n);
  if (el) el.addEventListener('input', () => {
    if (!ui.rep) return;
    ui.rep.every = clamp(Math.round(Number($('#repEvery').value) || 1), 1, 30);
    ui.rep.unit = $('#repUnit').value;
    updateRepHint();
  });
});
$('#formTask').elements.date.addEventListener('change', updateRepHint);

/* ---------- 自定义小篮子 ---------- */
function renderTagRow(cur) {
  const html = allTags().map((x) => {
    const own = !!(x.c || x.own);
    const st = x.c ? ` style="--bk:var(--${x.c});--bks:var(--${x.c}-s)"` : '';
    return `<button type="button" data-tag="${esc(x.k)}" class="bk-tag ${own ? 'own' : ''} ${x.k === cur ? 'on' : ''}"${st}>`
      + `${x.e} ${esc(x.k)}`
      + (own ? `<i class="bk-op edit" data-bk-edit="${esc(x.k)}" title="改一改">✏️</i>`
        + `<i class="bk-op del" data-bk-del="${esc(x.k)}" title="收起来">✕</i>` : '')
      + `</button>`;
  }).join('') + '<button type="button" class="bk-tag add" data-bk-add="1">＋ 新篮子</button>';
  $('#tagRow').innerHTML = html;
}
function closeBasketBox() { ui.basket = null; $('#basketBox').classList.add('hidden'); }
function openBasketBox(k) {
  const cur = k ? (state.baskets || []).find((x) => x.k === k) : null;
  ui.basket = { old: k || '', e: cur ? cur.e : '🧺', c: cur ? cur.c : 'pink' };
  $('#bkTitle').textContent = cur ? `改改「${cur.k}」这个篮子` : '做一个新篮子';
  $('#bkName').value = cur ? cur.k : '';
  $('#bkDel').classList.toggle('hidden', !cur);
  $('#bkColors').innerHTML = BK_COLORS.map((x) =>
    `<button type="button" data-bk-c="${x.k}" class="bk-dot ${x.k === ui.basket.c ? 'on' : ''}" title="${x.n}" style="--bk:var(--${x.k})"></button>`).join('');
  $('#bkEmojis').innerHTML = BK_EMOJIS.map((x) =>
    `<button type="button" data-bk-e="${x}" class="bk-emo ${x === ui.basket.e ? 'on' : ''}">${x}</button>`).join('')
    + `<input type="text" id="bkEmojiFree" class="bk-emo-free" maxlength="4" placeholder="自定义" value="${cur && !BK_EMOJIS.includes(cur.e) ? cur.e : ''}" />`;
  $('#basketBox').classList.remove('hidden');
  setTimeout(() => {
    $('#bkName').focus();
    $('#basketBox').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, 40);
}
function saveBasket() {
  const b = ui.basket; if (!b) return;
  const name = $('#bkName').value.trim();
  const free = ($('#bkEmojiFree').value || '').trim();
  const e = firstGrapheme(free) || b.e || '🧺';
  if (!name) { $('#bkName').focus(); toast('先给篮子起个名字呀', '🧺'); return; }
  const dup = (b.old && b.old === name) ? false : allTags().some((x) => x.k === name);
  if (dup) { toast('已经有同名的小篮子啦', '🙈'); return; }
  if (b.old) {
    const it = state.baskets.find((x) => x.k === b.old);
    it.k = name; it.e = e; it.c = b.c;
    if (b.old !== name) {
      state.tasks.forEach((t) => { if (t.tag === b.old) t.tag = name; });
      const sel = $('#formTask').elements.tag.value === b.old;
      if (sel) $('#formTask').elements.tag.value = name;
    }
  } else {
    state.baskets.push({ k: name, e, c: b.c });
    $('#formTask').elements.tag.value = name;
  }
  state.settings.lastTag = name;
  save();
  closeBasketBox();
  renderTagRow($('#formTask').elements.tag.value);
  schedule('view', renderView); schedule('side', renderSide);
  toast(b.old ? '篮子改好啦' : `新篮子做好啦，${e}`, '🧺');
}
function delBasket(k) {
  const used = state.tasks.filter((t) => t.tag === k).length;
  state.baskets = (state.baskets || []).filter((x) => x.k !== k);
  if (used) state.tasks.forEach((t) => { if (t.tag === k) t.tag = '生活'; });
  if ($('#formTask').elements.tag.value === k) $('#formTask').elements.tag.value = '生活';
  state.settings.lastTag = '生活';
  save();
  closeBasketBox();
  if ($('#maskTask').classList.contains('open')) renderTagRow($('#formTask').elements.tag.value);
  schedule('view', renderView); schedule('side', renderSide);
  toast(used ? `篮子收起来啦，里面 ${used} 件搬去了「生活」` : '篮子收起来啦', '🧺');
}
function openReview(id, type, date) {
  const r = id ? state.reviews.find((x) => x.id === id) : null;
  editing.review = id || null;
  $('#reviewTitle').textContent = r ? '改改这封信' : '给自己的一封信';
  $('#btnDelReview').classList.toggle('hidden', !r);
  const f = $('#formReview'); f.reset();
  const e = f.elements;
  e.id.value = r ? r.id : '';
  e.type.value = r ? r.type : (type || 'day');
  e.date.value = r ? r.date : (date || today());
  e.endDate.value = r ? r.endDate || '' : '';
  e.good.value = r ? r.good || '' : '';
  e.words.value = r ? r.words || '' : '';
  e.next.value = r ? r.next || '' : '';
  e.mood.value = r ? r.mood : (state.moods[today()] || 'happy');
  $$('#reviewMood button').forEach((b) => b.classList.toggle('on', b.dataset.mood === e.mood.value));
  $('#endField').classList.toggle('hidden', e.type.value !== 'stage');
  updateAuto();
  openMask('#maskReview');
}
function updateAuto() {
  const e = $('#formReview').elements;
  const type = e.type.value, d = e.date.value || today();
  let a = d, b = d;
  if (type === 'week') { a = weekStart(d); b = addDays(a, 6); }
  else if (type === 'month') { a = monthStart(d); b = monthEnd(d); }
  else if (type === 'stage') { b = e.endDate.value || today(); }
  if (b < a) b = a;
  const all = tasksIn(a, b), dn = all.filter((x) => x.done);
  $('#reviewAuto').innerHTML = `<b>这段时间（${a} ~ ${b}）</b>一共 ${all.length} 件小事，已经完成 ${dn.length} 件 🌸`
    + (dn.length ? `<br>${dn.slice(0, 5).map((x) => esc(x.title)).join('、')}${dn.length > 5 ? ' …' : ''}` : '');
}
function openWish(id, date) {
  const w = id ? state.wishes.find((x) => x.id === id) : null;
  editing.wish = id || null;
  $('#wishTitle').textContent = w ? '改一改这个日子' : '记一个重要的日子';
  $('#btnDelWish').classList.toggle('hidden', !w);
  const f = $('#formWish'); f.reset();
  const e = f.elements;
  e.id.value = w ? w.id : '';
  e.title.value = w ? w.title : '';
  e.date.value = w ? w.date : (date || ui.sel || today());
  e.icon.value = w ? w.icon : '🎂';
  e.color.value = w ? w.color : 'pink';
  e.remind.value = w ? String(w.remind) : '3';
  e.yearly.checked = w ? !!w.yearly : false;
  e.note.value = w ? w.note || '' : '';
  openMask('#maskWish');
}

$('#formTask').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const e = ev.target.elements;
  const data = {
    id: e.id.value || uid(), title: e.title.value.trim(), date: e.date.value || today(),
    time: e.time.value, tag: e.tag.value, priority: e.priority.value, note: e.note.value.trim(), done: false,
  };
  if (!data.title) return;
  let i = state.tasks.findIndex((x) => x.id === data.id);
  state.settings.lastTag = data.tag;
  data.rep = readRep();
  let made = 0;
  if (i >= 0) {
    const old = state.tasks[i];
    data.sid = old.sid || (data.rep ? old.id : undefined);
    data.done = old.done;
    // 规则变了：清掉这条之后还没做的重复，再重新铺
    if (data.rep) {
      state.tasks = state.tasks.filter((x) => !(x.sid === data.sid && x.id !== data.id && x.date > data.date && !x.done));
      made = expandRep(data, 90);
    } else if (old.sid) {
      state.tasks = state.tasks.filter((x) => !(x.sid === old.sid && x.id !== data.id && !x.done));
    }
    const j = state.tasks.findIndex((x) => x.id === data.id);
    if (j >= 0) state.tasks[j] = data;
  } else {
    if (data.rep) data.sid = data.id;
    state.tasks.push(data);
    if (data.rep) made = expandRep(data);
  }
  save(); closeBasketBox(); closeMasks();
  schedule('view', renderView); schedule('side', renderSide);
  toast(i >= 0 ? '改好啦' : (made ? `记下啦，已经排到 ${made + 1} 次 🌷` : '记下啦，加油~'), '🌷');
});
$('#formSrev').addEventListener('submit', (ev) => { ev.preventDefault(); saveSrev(false); });
$('#attRec').addEventListener('click', attToggleRec);
$('#attImg').addEventListener('click', () => $('#attImgIn').click());
$('#attDoc').addEventListener('click', () => $('#attDocIn').click());
$('#attImgIn').addEventListener('change', (e) => { attAddImage(e.target.files[0]); e.target.value = ''; });
$('#attDocIn').addEventListener('change', (e) => { attAddDoc(e.target.files[0]); e.target.value = ''; });
$('#attList').addEventListener('click', (e) => {
  const del = e.target.closest('[data-att-del]');
  if (del) {
    const a = revAtts.splice(Number(del.dataset.attDel), 1)[0];
    if (a && !a.blob && hasIDB) IDB.del(a.id).catch(() => { });
    renderAttList(); toast('拿掉啦'); return;
  }
  const play = e.target.closest('[data-att-play]');
  if (play) {
    const a = revAtts[Number(play.dataset.attPlay)];
    if (a) attOpen(a);
  }
});
$('#formSubject').addEventListener('submit', (ev) => { ev.preventDefault(); saveSubject(); });
$('#sbjEmojiFree').addEventListener('input', (ev) => {
  if (!ui.studyEdit) return;
  const v = firstGrapheme(ev.target.value);
  if (v) { ui.studyEdit.e = v; $$('#sbjEmojis .bk-emo').forEach((x) => x.classList.remove('on')); }
});
$('#sbjEmojis').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-sbj-e]'); if (!b || !ui.studyEdit) return;
  ui.studyEdit.e = b.dataset.sbjE;
  $$('#sbjEmojis .bk-emo').forEach((x) => x.classList.toggle('on', x === b));
  $('#sbjEmojiFree').value = '';
});
$('#sbjColors').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-sbj-c]'); if (!b || !ui.studyEdit) return;
  ui.studyEdit.c = b.dataset.sbjC;
  $$('#sbjColors .bk-dot').forEach((x) => x.classList.toggle('on', x === b));
});
$('#srevRate').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-rate]'); if (!b) return;
  $$('#srevRate button').forEach((x) => x.classList.toggle('on', x === b));
  $('#formSrev').elements.rate.value = b.dataset.rate;
});

$('#formReview').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const e = ev.target.elements;
  const data = {
    id: e.id.value || uid(), type: e.type.value, date: e.date.value, endDate: e.endDate.value,
    mood: e.mood.value, good: e.good.value.trim(), words: e.words.value.trim(), next: e.next.value.trim(),
  };
  const i = state.reviews.findIndex((x) => x.id === data.id);
  if (i >= 0) state.reviews[i] = data; else state.reviews.push(data);
  save(); closeMasks(); schedule('view', renderView); toast('这封信收好啦', '💌');
});
$('#formWish').addEventListener('submit', (ev) => {
  ev.preventDefault();
  const e = ev.target.elements;
  const data = {
    id: e.id.value || uid(), title: e.title.value.trim(), date: e.date.value, icon: e.icon.value,
    color: e.color.value, remind: +e.remind.value, yearly: e.yearly.checked, note: e.note.value.trim(),
    createdAt: e.id.value ? (state.wishes.find((x) => x.id === e.id.value).createdAt || today()) : today(),
  };
  if (!data.title) return;
  const i = state.wishes.findIndex((x) => x.id === data.id);
  if (i >= 0) state.wishes[i] = data; else state.wishes.push(data);
  save(); closeMasks(); schedule('view', renderView); schedule('side', renderSide); toast('记下这个日子啦', '🎀');
});

$('#tagRow').addEventListener('click', (e) => {
  const ed = e.target.closest('[data-bk-edit]');
  if (ed) { openBasketBox(ed.dataset.bkEdit); return; }
  const dl = e.target.closest('[data-bk-del]');
  if (dl) { delBasket(dl.dataset.bkDel); return; }
  if (e.target.closest('[data-bk-add]')) { openBasketBox(null); return; }
  const b = e.target.closest('[data-tag]'); if (!b) return;
  pickTag(b);
});
function pickTag(b) {
  $$('#tagRow button[data-tag]').forEach((x) => x.classList.toggle('on', x === b));
  $('#formTask').elements.tag.value = b.dataset.tag;
  closeBasketBox();
}
$('#basketBox').addEventListener('click', (e) => {
  const c = e.target.closest('[data-bk-c]');
  if (c && ui.basket) {
    ui.basket.c = c.dataset.bkC;
    $$('#bkColors .bk-dot').forEach((x) => x.classList.toggle('on', x === c));
    return;
  }
  const m = e.target.closest('[data-bk-e]');
  if (m && ui.basket) {
    ui.basket.e = m.dataset.bkE;
    $$('#bkEmojis .bk-emo').forEach((x) => x.classList.toggle('on', x === m));
    $('#bkEmojiFree').value = '';
    return;
  }
});
$('#bkName').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); saveBasket(); } });
$('#bkSave').addEventListener('click', saveBasket);
$('#bkDel').addEventListener('click', () => { if (ui.basket && ui.basket.old) delBasket(ui.basket.old); });
$('#basketBox').addEventListener('input', (e) => {
  if (e.target.id !== 'bkEmojiFree' || !ui.basket) return;
  const v = firstGrapheme(e.target.value);
  if (v) { ui.basket.e = v; $$('#bkEmojis .bk-emo').forEach((x) => x.classList.remove('on')); }
});
$('#priRow').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pri]'); if (!b) return;
  $$('#priRow button').forEach((x) => x.classList.toggle('on', x === b));
  $('#formTask').elements.priority.value = b.dataset.pri;
});
$('#reviewMood').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mood]'); if (!b) return;
  $$('#reviewMood button').forEach((x) => x.classList.toggle('on', x === b));
  $('#formReview').elements.mood.value = b.dataset.mood;
});
$('#reviewType').addEventListener('change', () => {
  $('#endField').classList.toggle('hidden', $('#formReview').elements.type.value !== 'stage');
  updateAuto();
});
['date', 'endDate'].forEach((n) => $('#formReview').elements[n].addEventListener('change', updateAuto));

/* ==========================================================
   交互（事件委托）
   ========================================================== */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id;

  if (a === 'mood') {
    state.moods[ui.cur] = el.dataset.mood; save();
    $('#moodPop').classList.remove('show');      /* 选完就收起浮条 */
    schedule('today', patchToday); schedule('side', renderSide);
    toast('心情记好啦', MOODS[el.dataset.mood]); return;
  }

  switch (a) {
    /* 顶部卡的小图标 */
    case 'hero-pop': {
      const p = el.dataset.pop;
      ui.heroPop = ui.heroPop === p ? null : p;
      renderHeroPops(); return;
    }
    /* 换日期 */
    case 'date-off': setCur(addDays(today(), +el.dataset.off)); return;
    case 'date-set': setCur(el.dataset.date); return;
    case 'cur-prev': setCur(addDays(ui.cur, -1)); return;
    case 'cur-next': setCur(addDays(ui.cur, 1)); return;

    /* 纪念日展示样式 */
    case 'wish-view':
      ui.wishView = el.dataset.view; state.settings.wishView = ui.wishView; saveUi();
      schedule('view', renderView); return;
    case 'wish-fold': {
      const g = el.dataset.group;
      ui.wishFold[g] = !ui.wishFold[g];
      schedule('view', renderView); return;
    }
    case 'wish-open':
      ui.wishOpen[id] = !ui.wishOpen[id];
      schedule('view', renderView); return;
    case 'wish-jump': {
      const w = state.wishes.find((x) => x.id === id);
      ui.view = 'calendar'; ui.heroPop = null;
      if (w) { ui.sel = nextDate(w); ui.anchor = ui.sel; ui.cal = 'month'; ui.pick = ui.sel; }
      ui.wishOpen[id] = true; ui.wishView = 'grid';
      schedule('view', renderView); schedule('side', renderSide);
      setTimeout(() => { const m = $('#memoZone'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return;
    }
    case 'memo-goto':
      ui.view = 'calendar'; ui.heroPop = null;
      schedule('view', renderView); schedule('side', renderSide);
      setTimeout(() => { const m = $('#memoZone'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return;

    case 'nav': haptic(6); goView(el.dataset.view); break;
    case 'theme':
      state.settings.theme = state.settings.theme === 'night' ? 'day' : 'night'; save();
      document.documentElement.dataset.theme = state.settings.theme;
      paintThemeColor(); haptic(10);
      toast(state.settings.theme === 'night' ? '晚安模式，注意眼睛休息~' : '早安模式回来啦', '🌙');
      break;

    case 'new-task': openTask(null, el.dataset.date); break;
    case 'edit-task': openTask(id); break;
    case 'del-task': delTask(id); break;
    case 'del-task-modal': {
      const id0 = editing.task;
      closeMasks();
      setTimeout(() => delTask(id0), 180);
      break;
    }

    case 'toggle': {
      const t = state.tasks.find((x) => x.id === id); if (!t) return;
      t.done = !t.done;
      let gain = 0;
      if (t.done) {
        gain = dropsFor(t);
        t.gain = gain;
        state.garden.drops += gain;
        state.garden.total += gain;
      } else if (t.gain) {
        state.garden.drops = Math.max(0, state.garden.drops - t.gain);
        t.gain = 0;
      }
      save();
      patchRow(id);                      // 只替换这一行
      schedule('prog', patchProgress);   // 异步刷新进度
      schedule('side', renderSide);      // 异步刷新侧边栏
      schedule('teaser', patchTeaser);   // 首页花园速览
      if (t.done) {
        const r = el.getBoundingClientRect();
        cheer(r.left + r.width / 2, r.top);
        const fresh = checkBadges();
        save();
        toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `${PRAISE[Math.floor(Math.random() * PRAISE.length)]} ＋${gain}💧`, fresh.length ? '' : '');
      }
      break;
    }

    /* ---------- 花园 ---------- */
    case 'plot': {
      const i = Number(el.dataset.i), g = state.garden, p = g.plots[i];
      if (!p) {
        const row = $('.seed-row');
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('挑一颗种子，种下去吧', '🌱'); return;
      }
      if (p.stage >= 2) {
        const got = harvestPlot(i);
        const fresh = checkBadges();
        save();
        schedule('view', renderView); schedule('side', renderSide);
        cheer(window.innerWidth / 2, window.innerHeight / 2);
        toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `收下「${plantOf(got.kind).n}」啦，＋${got.gain}💧`, '🌸');
        return;
      }
      const res = waterPlot(i, 1);
      if (!res) return;
      if (res.dry) { toast('露珠不够啦，去完成一件小事吧', '💧'); return; }
      save();
      patchPlot(i); patchGardenHud();
      if (res.bloom) {
        toast(`「${plantOf(p.k).n}」开花了！点它可以收下来`, '🌸');
        const c = el.getBoundingClientRect();
        cheer(c.left + c.width / 2, c.top);
      }
      schedule('side', renderSide);
      return;
    }
    case 'sow': {
      const kind = el.dataset.kind, def = plantOf(kind);
      const g = state.garden;
      const idx = g.plots.findIndex((x) => !x);
      if (idx < 0 || idx >= plotCount()) { toast('没有空地啦，收一朵花就会空出来', '🪴'); return; }
      if (g.drops < def.cost) { toast(`还差 ${def.cost - g.drops} 滴露珠才买得起`, '💧'); return; }
      if (!sowPlot(idx, kind)) return;
      const fresh = checkBadges();
      save();
      schedule('view', renderView);
      toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `种下「${def.n}」啦，记得浇它 🌱`, fresh.length ? '' : '');
      return;
    }
    case 'water-all': {
      const g = state.garden;
      let used = 0, blooms = 0;
      g.plots.forEach((p, i) => {
        if (!p || p.stage >= 2 || g.drops <= 0) return;
        const r = waterPlot(i, Math.min(3, g.drops));
        if (r && r.used) used += r.used;
        if (r && r.bloom) blooms++;
      });
      if (!used) { toast('没有需要浇水的小苗，或者露珠用完啦', '💧'); return; }
      save();
      schedule('view', renderView); schedule('side', renderSide);
      toast(blooms ? `浇了 ${used} 滴，有 ${blooms} 朵开花啦 🌸` : `挨个浇了 ${used} 滴，它们都在长`, '💧');
      return;
    }
    case 'garden-dex': {
      const d = $('.dex-row');
      if (d) d.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    case 'quick-add': quickAdd(); break;

    case 'cal': ui.cal = el.dataset.mode; schedule('view', renderView); break;
    case 'sel': {
      const d = el.dataset.date;
      const same = ui.pick === d;
      ui.sel = d; ui.anchor = d; ui.cur = d;
      ui.pick = same ? null : d;      // 再点同一天就收起
      schedule('view', renderView);
      if (!same) setTimeout(() => { const z = $('#dayZone'); if (z) z.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      break;
    }
    case 'day-close': ui.pick = null; schedule('view', renderView); break;
    case 'prev': shift(-1); break;
    case 'next': shift(1); break;
    case 'today': ui.sel = today(); ui.anchor = ui.sel; ui.cur = ui.sel; ui.pick = ui.sel;
      schedule('view', renderView); break;

    case 'rtab': ui.reviewTab = el.dataset.tab; schedule('view', renderView); break;
    case 'new-review': openReview(null, el.dataset.type, el.dataset.date); break;
    case 'edit-review': openReview(id); break;
    case 'del-review':
      state.reviews = state.reviews.filter((x) => x.id !== id); save();
      schedule('view', renderView); toast('删掉啦'); break;
    case 'del-review-modal':
      state.reviews = state.reviews.filter((x) => x.id !== editing.review); save(); closeMasks();
      schedule('view', renderView); toast('删掉啦'); break;

    case 'new-wish': openWish(null, el.dataset.date); break;
    case 'edit-wish': openWish(id); break;
    case 'del-wish':
      state.wishes = state.wishes.filter((x) => x.id !== id); save();
      schedule('view', renderView); schedule('side', renderSide); toast('删掉啦'); break;
    case 'del-wish-modal':
      state.wishes = state.wishes.filter((x) => x.id !== editing.wish); save(); closeMasks();
      schedule('view', renderView); schedule('side', renderSide); toast('删掉啦'); break;

    case 'close-task': case 'close-review': case 'close-wish':
    case 'close-srev': case 'close-sbj':
      closeBasketBox(); closeMasks(); ui.studyEdit = null; revTarget = null; break;
    case 'bk-cancel': closeBasketBox(); break;

    case 'sbj-open': ui.view = 'study'; ui.studySid = el.dataset.id;
      schedule('view', renderView); schedule('slide', () => slideContent(1)); paintTabs(); break;
    case 'sbj-back': ui.studySid = null;
      schedule('view', renderView); schedule('slide', () => slideContent(-1)); break;
    case 'sbj-new': openSubject(null); return;
    case 'sbj-edit': e.stopPropagation(); openSubject(el.dataset.id); return;
    case 'sbj-set-goal': {
      const v = prompt('每天想学多少分钟？', String(ST().goal || 180));
      if (v == null) return;
      const n = Math.max(10, Math.min(960, Number(v) || 180));
      ST().goal = n; save(); schedule('view', renderView);
      toast(`每日目标设成 ${n} 分钟啦`, '🎯'); return;
    }
    case 'sy-range': ui.studyRange = el.dataset.range; schedule('view', renderView); break;
    case 'sy-help': ui.dropHelp = !ui.dropHelp; schedule('view', renderView); break;
    case 'sy-csv': exportSyCsv(); break;
    case 'sy-md': exportSyMd(); break;
    case 'sy-json': exportSyJson(); break;
    case 'sy-ai': copyAI(); break;

    case 'tm-mode': ui.studyMode = el.dataset.mode; patchTimer(); schedule('view', renderView); break;
    case 'tm-plan': ui.studyPlan = Number(el.dataset.min); ui.studyMode = 'down';
      patchTimer(); schedule('view', renderView); break;
    case 'tm-start': tmStart(el.dataset.id); break;
    case 'tm-pause': tmPause(); return;
    case 'tm-resume': tmResume(el.dataset.id); return;
    case 'tm-finish': tmFinish(false); return;
    case 'tm-end': tmFinish(false, el.dataset.id); return;
    case 'tm-drop': tmDrop(); return;
    case 'tm-drop-id': tmDrop(el.dataset.id); return;

    case 'rev-new': openRevOf(el.dataset.id); return;
    case 'rev-edit': {
      const v = ST().reviews.find((x) => x.id === el.dataset.id);
      if (v) openRev(v.sid); return;
    }
    case 'del-srev-modal': delSrev(); return;

    case 'export-md': exportMd(); break;
    case 'open-profile': openProfile(); break;
    case 'close-profile': closeMasks(); break;
    case 'pf-upload': $('#pfFile').click(); break;
    case 'pf-random': pfRandomFace(); break;
    case 'pf-save': saveProfile(); break;
    case 'pf-chpass': changePass(); break;
    case 'guide-next': guideNext(); break;
    case 'guide-prev': guidePrev(); break;
    case 'guide-skip': closeGuide(true); break;
    case 'guide-open': openGuide(0); break;
    case 'srv-report': srvReport(el.dataset.range); break;
    case 'backup': openBackup(); break;
    case 'restore': doRestore(); break;
    case 'close-backup': closeMasks(); break;
    case 'bk-text': bkText(); break;
    case 'bk-atts': bkAtts(); break;
    case 'bk-all': bkAll(); break;
    case 'bk-clean': bkClean(); break;
    case 'print': doPrint(); break;
    case 'clear':
      if (confirm('真的要清空全部记录吗？清空后就找不回来啦~')) {
        const s = state.settings;
        state = seed(); state.tasks = []; state.reviews = []; state.wishes = [];
        state.moods = {}; state.joys = {}; state.settings = s; save();
        schedule('view', renderView); schedule('side', renderSide); toast('都清空啦，重新开始~');
      }
      break;
    case 'reseed':
      state = seed(); state.settings.sideW = state.settings.sideW || 250; save();
      schedule('view', renderView); schedule('side', renderSide); toast('示例数据回来啦', '🌷'); break;
  }
});

function quickAdd() {
  const i = $('#quickAdd'); if (!i) return;
  const v = i.value.trim(); if (!v) return;
  const date = ui.view === 'calendar' ? ui.sel : ui.cur;
  const last = state.settings.lastTag;
  const t = { id: uid(), title: v, date, time: '', tag: tagOf(last) ? last : '生活', priority: 'mid', done: false, note: '' };
  state.tasks.push(t); save();
  i.value = '';
  if (ui.view === 'today' || ui.view === 'calendar') {
    schedule('list', patchList); schedule('prog', patchProgress); schedule('side', renderSide);
  } else { schedule('view', renderView); }
  toast('记下啦，加油~', '🌷');
}
function shift(n) {
  if (ui.view !== 'calendar') { ui.sel = addDays(ui.sel, n); ui.anchor = ui.sel; }
  else if (ui.cal === 'month') {
    const d = parse(ui.anchor);
    ui.anchor = fmt(new Date(d.getFullYear(), d.getMonth() + n, 1));
  } else ui.anchor = addDays(ui.anchor, n * 7);
  schedule('view', renderView);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeBasketBox(); closeMasks(); $('#moodPop').classList.remove('show'); }
  if (e.key === 'Enter' && e.target.id === 'quickAdd') quickAdd();
});
$$('.mask').forEach((m) => m.addEventListener('mousedown', (e) => { if (e.target === m) closeMasks(); }));

/* 心情气泡 */
$('#btnMood').addEventListener('click', (e) => {
  e.stopPropagation();
  const p = $('#moodPop');
  p.classList.toggle('show');
  $$('#moodPop button').forEach((b) => b.classList.toggle('on', b.dataset.mood === state.moods[ui.cur]));
});
$('#moodPop').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mood]'); if (!b) return;
  state.moods[ui.cur] = b.dataset.mood; save();
  $('#moodPop').classList.remove('show');
  schedule('today', patchToday); schedule('side', renderSide);
  toast('心情记好啦', MOODS[b.dataset.mood]);
});
$('#pfFile').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('要选一张图片哦', '🖼️'); return; }
  if (file.size > 8 * 1048576) { toast('图片太大了，8MB 以内', '🖼️'); return; }
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const S = 256;
    const k = Math.max(S / img.width, S / img.height);
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d');
    const w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    URL.revokeObjectURL(url);
    pfAvatar = cv.toDataURL('image/jpeg', .84);
    pfPaint();
    toast('头像裁好啦，点保存生效', '🖼️');
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('这张读不出来，换一张试试', '🖼️'); };
  img.src = url;
});

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id;

  if (a === 'mood') {
    state.moods[ui.cur] = el.dataset.mood; save();
    $('#moodPop').classList.remove('show');      /* 选完就收起浮条 */
    schedule('today', patchToday); schedule('side', renderSide);
    toast('心情记好啦', MOODS[el.dataset.mood]); return;
  }

  switch (a) {
    /* 顶部卡的小图标 */
    case 'hero-pop': {
      const p = el.dataset.pop;
      ui.heroPop = ui.heroPop === p ? null : p;
      renderHeroPops(); return;
    }
    /* 换日期 */
    case 'date-off': setCur(addDays(today(), +el.dataset.off)); return;
    case 'date-set': setCur(el.dataset.date); return;
    case 'cur-prev': setCur(addDays(ui.cur, -1)); return;
    case 'cur-next': setCur(addDays(ui.cur, 1)); return;

    /* 纪念日展示样式 */
    case 'wish-view':
      ui.wishView = el.dataset.view; state.settings.wishView = ui.wishView; saveUi();
      schedule('view', renderView); return;
    case 'wish-fold': {
      const g = el.dataset.group;
      ui.wishFold[g] = !ui.wishFold[g];
      schedule('view', renderView); return;
    }
    case 'wish-open':
      ui.wishOpen[id] = !ui.wishOpen[id];
      schedule('view', renderView); return;
    case 'wish-jump': {
      const w = state.wishes.find((x) => x.id === id);
      ui.view = 'calendar'; ui.heroPop = null;
      if (w) { ui.sel = nextDate(w); ui.anchor = ui.sel; ui.cal = 'month'; ui.pick = ui.sel; }
      ui.wishOpen[id] = true; ui.wishView = 'grid';
      schedule('view', renderView); schedule('side', renderSide);
      setTimeout(() => { const m = $('#memoZone'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return;
    }
    case 'memo-goto':
      ui.view = 'calendar'; ui.heroPop = null;
      schedule('view', renderView); schedule('side', renderSide);
      setTimeout(() => { const m = $('#memoZone'); if (m) m.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      return;

    case 'nav': haptic(6); goView(el.dataset.view); break;
    case 'theme':
      state.settings.theme = state.settings.theme === 'night' ? 'day' : 'night'; save();
      document.documentElement.dataset.theme = state.settings.theme;
      paintThemeColor(); haptic(10);
      toast(state.settings.theme === 'night' ? '晚安模式，注意眼睛休息~' : '早安模式回来啦', '🌙');
      break;

    case 'new-task': openTask(null, el.dataset.date); break;
    case 'edit-task': openTask(id); break;
    case 'del-task': delTask(id); break;
    case 'del-task-modal': {
      const id0 = editing.task;
      closeMasks();
      setTimeout(() => delTask(id0), 180);
      break;
    }

    case 'toggle': {
      const t = state.tasks.find((x) => x.id === id); if (!t) return;
      t.done = !t.done;
      let gain = 0;
      if (t.done) {
        gain = dropsFor(t);
        t.gain = gain;
        state.garden.drops += gain;
        state.garden.total += gain;
      } else if (t.gain) {
        state.garden.drops = Math.max(0, state.garden.drops - t.gain);
        t.gain = 0;
      }
      save();
      patchRow(id);                      // 只替换这一行
      schedule('prog', patchProgress);   // 异步刷新进度
      schedule('side', renderSide);      // 异步刷新侧边栏
      schedule('teaser', patchTeaser);   // 首页花园速览
      if (t.done) {
        const r = el.getBoundingClientRect();
        cheer(r.left + r.width / 2, r.top);
        const fresh = checkBadges();
        save();
        toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `${PRAISE[Math.floor(Math.random() * PRAISE.length)]} ＋${gain}💧`, fresh.length ? '' : '');
      }
      break;
    }

    /* ---------- 花园 ---------- */
    case 'plot': {
      const i = Number(el.dataset.i), g = state.garden, p = g.plots[i];
      if (!p) {
        const row = $('.seed-row');
        if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toast('挑一颗种子，种下去吧', '🌱'); return;
      }
      if (p.stage >= 2) {
        const got = harvestPlot(i);
        const fresh = checkBadges();
        save();
        schedule('view', renderView); schedule('side', renderSide);
        cheer(window.innerWidth / 2, window.innerHeight / 2);
        toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `收下「${plantOf(got.kind).n}」啦，＋${got.gain}💧`, '🌸');
        return;
      }
      const res = waterPlot(i, 1);
      if (!res) return;
      if (res.dry) { toast('露珠不够啦，去完成一件小事吧', '💧'); return; }
      save();
      patchPlot(i); patchGardenHud();
      if (res.bloom) {
        toast(`「${plantOf(p.k).n}」开花了！点它可以收下来`, '🌸');
        const c = el.getBoundingClientRect();
        cheer(c.left + c.width / 2, c.top);
      }
      schedule('side', renderSide);
      return;
    }
    case 'sow': {
      const kind = el.dataset.kind, def = plantOf(kind);
      const g = state.garden;
      const idx = g.plots.findIndex((x) => !x);
      if (idx < 0 || idx >= plotCount()) { toast('没有空地啦，收一朵花就会空出来', '🪴'); return; }
      if (g.drops < def.cost) { toast(`还差 ${def.cost - g.drops} 滴露珠才买得起`, '💧'); return; }
      if (!sowPlot(idx, kind)) return;
      const fresh = checkBadges();
      save();
      schedule('view', renderView);
      toast(fresh.length ? `解锁徽章「${fresh[0].n}」${fresh[0].e}` : `种下「${def.n}」啦，记得浇它 🌱`, fresh.length ? '' : '');
      return;
    }
    case 'water-all': {
      const g = state.garden;
      let used = 0, blooms = 0;
      g.plots.forEach((p, i) => {
        if (!p || p.stage >= 2 || g.drops <= 0) return;
        const r = waterPlot(i, Math.min(3, g.drops));
        if (r && r.used) used += r.used;
        if (r && r.bloom) blooms++;
      });
      if (!used) { toast('没有需要浇水的小苗，或者露珠用完啦', '💧'); return; }
      save();
      schedule('view', renderView); schedule('side', renderSide);
      toast(blooms ? `浇了 ${used} 滴，有 ${blooms} 朵开花啦 🌸` : `挨个浇了 ${used} 滴，它们都在长`, '💧');
      return;
    }
    case 'garden-dex': {
      const d = $('.dex-row');
      if (d) d.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    case 'quick-add': quickAdd(); break;

    case 'cal': ui.cal = el.dataset.mode; schedule('view', renderView); break;
    case 'sel': {
      const d = el.dataset.date;
      const same = ui.pick === d;
      ui.sel = d; ui.anchor = d; ui.cur = d;
      ui.pick = same ? null : d;      // 再点同一天就收起
      schedule('view', renderView);
      if (!same) setTimeout(() => { const z = $('#dayZone'); if (z) z.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      break;
    }
    case 'day-close': ui.pick = null; schedule('view', renderView); break;
    case 'prev': shift(-1); break;
    case 'next': shift(1); break;
    case 'today': ui.sel = today(); ui.anchor = ui.sel; ui.cur = ui.sel; ui.pick = ui.sel;
      schedule('view', renderView); break;

    case 'rtab': ui.reviewTab = el.dataset.tab; schedule('view', renderView); break;
    case 'new-review': openReview(null, el.dataset.type, el.dataset.date); break;
    case 'edit-review': openReview(id); break;
    case 'del-review':
      state.reviews = state.reviews.filter((x) => x.id !== id); save();
      schedule('view', renderView); toast('删掉啦'); break;
    case 'del-review-modal':
      state.reviews = state.reviews.filter((x) => x.id !== editing.review); save(); closeMasks();
      schedule('view', renderView); toast('删掉啦'); break;

    case 'new-wish': openWish(null, el.dataset.date); break;
    case 'edit-wish': openWish(id); break;
    case 'del-wish':
      state.wishes = state.wishes.filter((x) => x.id !== id); save();
      schedule('view', renderView); schedule('side', renderSide); toast('删掉啦'); break;
    case 'del-wish-modal':
      state.wishes = state.wishes.filter((x) => x.id !== editing.wish); save(); closeMasks();
      schedule('view', renderView); schedule('side', renderSide); toast('删掉啦'); break;

    case 'close-task': case 'close-review': case 'close-wish':
    case 'close-srev': case 'close-sbj':
      closeBasketBox(); closeMasks(); ui.studyEdit = null; revTarget = null; break;
    case 'bk-cancel': closeBasketBox(); break;

    case 'sbj-open': ui.view = 'study'; ui.studySid = el.dataset.id;
      schedule('view', renderView); schedule('slide', () => slideContent(1)); paintTabs(); break;
    case 'sbj-back': ui.studySid = null;
      schedule('view', renderView); schedule('slide', () => slideContent(-1)); break;
    case 'sbj-new': openSubject(null); return;
    case 'sbj-edit': e.stopPropagation(); openSubject(el.dataset.id); return;
    case 'sbj-set-goal': {
      const v = prompt('每天想学多少分钟？', String(ST().goal || 180));
      if (v == null) return;
      const n = Math.max(10, Math.min(960, Number(v) || 180));
      ST().goal = n; save(); schedule('view', renderView);
      toast(`每日目标设成 ${n} 分钟啦`, '🎯'); return;
    }
    case 'sy-range': ui.studyRange = el.dataset.range; schedule('view', renderView); break;
    case 'sy-help': ui.dropHelp = !ui.dropHelp; schedule('view', renderView); break;
    case 'sy-csv': exportSyCsv(); break;
    case 'sy-md': exportSyMd(); break;
    case 'sy-json': exportSyJson(); break;
    case 'sy-ai': copyAI(); break;

    case 'tm-mode': ui.studyMode = el.dataset.mode; patchTimer(); schedule('view', renderView); break;
    case 'tm-plan': ui.studyPlan = Number(el.dataset.min); ui.studyMode = 'down';
      patchTimer(); schedule('view', renderView); break;
    case 'tm-start': tmStart(el.dataset.id); break;
    case 'tm-pause': tmPause(); return;
    case 'tm-resume': tmResume(el.dataset.id); return;
    case 'tm-finish': tmFinish(false); return;
    case 'tm-end': tmFinish(false, el.dataset.id); return;
    case 'tm-drop': tmDrop(); return;
    case 'tm-drop-id': tmDrop(el.dataset.id); return;

    case 'rev-new': openRevOf(el.dataset.id); return;
    case 'rev-edit': {
      const v = ST().reviews.find((x) => x.id === el.dataset.id);
      if (v) openRev(v.sid); return;
    }
    case 'del-srev-modal': delSrev(); return;

    case 'export-md': exportMd(); break;
    case 'open-profile': openProfile(); break;
    case 'close-profile': closeMasks(); break;
    case 'pf-upload': $('#pfFile').click(); break;
    case 'pf-random': pfRandomFace(); break;
    case 'pf-save': saveProfile(); break;
    case 'pf-chpass': changePass(); break;
    case 'guide-next': guideNext(); break;
    case 'guide-prev': guidePrev(); break;
    case 'guide-skip': closeGuide(true); break;
    case 'guide-open': openGuide(0); break;
    case 'srv-report': srvReport(el.dataset.range); break;
    case 'backup': openBackup(); break;
    case 'restore': doRestore(); break;
    case 'close-backup': closeMasks(); break;
    case 'bk-text': bkText(); break;
    case 'bk-atts': bkAtts(); break;
    case 'bk-all': bkAll(); break;
    case 'print': doPrint(); break;
    case 'clear':
      if (confirm('真的要清空全部记录吗？清空后就找不回来啦~')) {
        const s = state.settings;
        state = seed(); state.tasks = []; state.reviews = []; state.wishes = [];
        state.moods = {}; state.joys = {}; state.settings = s; save();
        schedule('view', renderView); schedule('side', renderSide); toast('都清空啦，重新开始~');
      }
      break;
    case 'reseed':
      state = seed(); state.settings.sideW = state.settings.sideW || 250; save();
      schedule('view', renderView); schedule('side', renderSide); toast('示例数据回来啦', '🌷'); break;
  }
});

function quickAdd() {
  const i = $('#quickAdd'); if (!i) return;
  const v = i.value.trim(); if (!v) return;
  const date = ui.view === 'calendar' ? ui.sel : ui.cur;
  const last = state.settings.lastTag;
  const t = { id: uid(), title: v, date, time: '', tag: tagOf(last) ? last : '生活', priority: 'mid', done: false, note: '' };
  state.tasks.push(t); save();
  i.value = '';
  if (ui.view === 'today' || ui.view === 'calendar') {
    schedule('list', patchList); schedule('prog', patchProgress); schedule('side', renderSide);
  } else { schedule('view', renderView); }
  toast('记下啦，加油~', '🌷');
}
function shift(n) {
  if (ui.view !== 'calendar') { ui.sel = addDays(ui.sel, n); ui.anchor = ui.sel; }
  else if (ui.cal === 'month') {
    const d = parse(ui.anchor);
    ui.anchor = fmt(new Date(d.getFullYear(), d.getMonth() + n, 1));
  } else ui.anchor = addDays(ui.anchor, n * 7);
  schedule('view', renderView);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeBasketBox(); closeMasks(); $('#moodPop').classList.remove('show'); }
  if (e.key === 'Enter' && e.target.id === 'quickAdd') quickAdd();
});
$$('.mask').forEach((m) => m.addEventListener('mousedown', (e) => { if (e.target === m) closeMasks(); }));

/* 心情气泡 */
$('#btnMood').addEventListener('click', (e) => {
  e.stopPropagation();
  const p = $('#moodPop');
  p.classList.toggle('show');
  $$('#moodPop button').forEach((b) => b.classList.toggle('on', b.dataset.mood === state.moods[ui.cur]));
});
$('#moodPop').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mood]'); if (!b) return;
  state.moods[ui.cur] = b.dataset.mood; save();
  $('#moodPop').classList.remove('show');
  schedule('today', patchToday); schedule('side', renderSide);
  toast('心情记好啦', MOODS[b.dataset.mood]);
});
$('#pfFile').addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) { toast('要选一张图片哦', '🖼️'); return; }
  if (file.size > 8 * 1048576) { toast('图片太大了，8MB 以内', '🖼️'); return; }
  const img = new Image(), url = URL.createObjectURL(file);
  img.onload = () => {
    const S = 256;
    const k = Math.max(S / img.width, S / img.height);
    const cv = document.createElement('canvas');
    cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d');
    const w = img.width * k, h = img.height * k;
    ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    URL.revokeObjectURL(url);
    pfAvatar = cv.toDataURL('image/jpeg', .84);
    pfPaint();
    toast('头像裁好啦，点保存生效', '🖼️');
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('这张读不出来，换一张试试', '🖼️'); };
  img.src = url;
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#moodPop') && !e.target.closest('#btnMood')) $('#moodPop').classList.remove('show');
  // 点顶部卡以外的地方，收起小面板
  if (ui.heroPop && !e.target.closest('.lhero')) { ui.heroPop = null; renderHeroPops(); }
});

/* 导入备份 */
$('#restoreFile').addEventListener('change', async (e) => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  let parsed;
  try {
    parsed = await Backup.readFile(f);
  } catch (err) {
    toast('读不出来：' + err.message, '⚠️');
    return;
  }
  const has = (state.tasks || []).length || (state.reviews || []).length;
  if (has && !confirm('导入会覆盖当前数据。\n\n建议先点「导出备份」留一份。继续导入吗？')) return;
  try {
    if (parsed.state) {
      const keep = state.settings;
      state = Object.assign(seed(), parsed.state);
      state.settings = Object.assign(keep || {}, parsed.state.settings || {});
      state = Migrate.run(state);
    }
    let n = 0;
    if (parsed.atts && parsed.atts.length) n = await Backup.writeAtts(parsed.atts);
    localStorage.setItem(KEY, JSON.stringify(state));
    toast(`导入完成${n ? '，恢复 ' + n + ' 个附件' : ''}，正在重新载入`, '📥');
    setTimeout(() => location.reload(), 800);
  } catch (err) {
    toast('导入失败：' + err.message, '⚠️');
  }
});

/* 侧边栏个人信息 */
$('#avatar').addEventListener('click', () => { haptic(6); openProfile(); });
/* 侧栏名字 = 登录账号（用户名），点一下去看资料 */
$('#meName').addEventListener('click', () => { haptic(6); openProfile(); });

/* ---------- 清单拖拽排序 ---------- */
let dragId = null;
document.addEventListener('dragstart', (e) => {
  const el = e.target.closest('.task'); if (!el) return;
  dragId = el.dataset.id;
  el.classList.add('dragging');
  try { e.dataTransfer.setData('text/plain', dragId); e.dataTransfer.effectAllowed = 'move'; } catch (err) { }
});
document.addEventListener('dragover', (e) => {
  if (!dragId) return;
  const list = document.querySelector('.tlist'); if (!list) return;
  const over = e.target.closest('.task-wrap');
  if (!over || over.dataset.id === dragId) return;
  e.preventDefault();
  const r = over.getBoundingClientRect();
  const after = (e.clientY - r.top) > r.height / 2;
  const node = list.querySelector(`.task-wrap[data-id="${dragId}"]`);
  if (!node) return;
  list.insertBefore(node, after ? over.nextSibling : over);
});
document.addEventListener('drop', (e) => { if (dragId) e.preventDefault(); });
document.addEventListener('dragend', () => {
  const node = document.querySelector('.task.dragging');
  if (node) node.classList.remove('dragging');
  if (dragId) { persistOrder(); dragId = null; }
});
function persistOrder() {
  const list = document.querySelector('.tlist'); if (!list) return;
  const date = list.dataset.date;
  const ids = [...list.querySelectorAll('.task')].map((el) => el.dataset.id);
  let i = 0;
  state.tasks = state.tasks.map((t) => {
    if (t.date !== date) return t;
    const id = ids[i++];
    return id ? (state.tasks.find((x) => x.id === id) || t) : t;
  });
  save(); toast('顺序调好啦', '🌿');
}

/* ---------- 导出 ---------- */
function download(name, content, type) {
  const blob = new Blob([content], { type: type || 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('已导出 ' + name, '📝');
}
function exportMd() {
  const t = today();
  const ds = state.tasks.map((x) => x.date).sort();
  const from = ds[0] || t, to = ds[ds.length - 1] || t;
  let md = `# ${state.me.name} 的小日子\n\n> 导出于 ${t} · ${from} ~ ${to}\n\n## 🌷 我的安排\n\n`;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const l = tasksOn(d); if (!l.length) continue;
    md += `### ${d} 周${CN[dow(d)]}${state.moods[d] ? ' ' + MOODS[state.moods[d]] : ''}\n`;
    l.forEach((x) => md += `- [${x.done ? 'x' : ' '}] ${x.title}${x.time ? `（${x.time}）` : ''}${x.tag ? ` · ${x.tag}` : ''}${x.note ? ` — ${x.note}` : ''}\n`);
    if (state.joys[d]) md += `- 🌈 小确幸：${state.joys[d]}\n`;
    md += '\n';
  }
  md += '## 💌 给自己的信\n\n';
  state.reviews.slice().sort((a, b) => a.date < b.date ? 1 : -1).forEach((r) => {
    md += `### ${typeName(r.type)} · ${r.date}${r.endDate ? ' ~ ' + r.endDate : ''} ${MOODS[r.mood] || ''}\n`;
    md += `- 做得不错：${r.good || '—'}\n- 想对自己说：${r.words || '—'}\n- 接下来：${r.next || '—'}\n\n`;
  });
  md += '## 🎀 重要的日子\n\n';
  state.wishes.forEach((w) => {
    const d = diff(t, nextDate(w));
    md += `- ${w.icon} ${w.title}（${nextDate(w)}）：${d >= 0 ? (d === 0 ? '就是今天' : `还有 ${d} 天`) : `已经 ${-d} 天啦`}\n`;
  });
  download(`小日子_${t}.md`, md, 'text/markdown;charset=utf-8');
}
/* ---------- 备份：导出 / 导入 ---------- */
function attList() {
  const out = [];
  for (const r of state.reviews || []) {
    for (const a of r.atts || []) out.push(Object.assign({ date: r.date, reviewId: r.id }, a));
  }
  return out;
}
function whenText(ts) {
  if (!ts) return '—';
  const d = new Date(ts), now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days <= 0) return '今天 ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  if (days === 1) return '昨天';
  if (days < 30) return days + ' 天前';
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
function markBackup() {
  state.lastBackup = Date.now();
  save();
  paintStore();
}
function openBackup() {
  openMask('#maskBackup');
  renderBackup();
}
async function renderBackup() {
  const box = $('#backupBody'); if (!box) return;
  const atts = attList();
  const pending = atts.filter((a) => !a.backed);
  const pendingBytes = pending.reduce((n, a) => n + (a.size || 0), 0);
  const allBytes = atts.reduce((n, a) => n + (a.size || 0), 0);
  box.innerHTML = `
    <div class="bk-stat">
      <div><b>${(state.tasks || []).length}</b><span>件小事</span></div>
      <div><b>${(state.reviews || []).length}</b><span>篇复盘</span></div>
      <div><b>${atts.length}</b><span>个附件</span></div>
      <div><b>${Backup.fmtBytes(allBytes)}</b><span>附件体积</span></div>
    </div>
    <div class="bk-when">上次备份：${state.lastBackup ? whenText(state.lastBackup) : '还没有备份过'}</div>
    <button class="bk-item" data-act="bk-text">
      <i>📄</i>
      <div><b>文字数据</b><span>任务、复盘、纪念日、备考 · 几十 KB</span></div>
    </button>
    <button class="bk-item" data-act="bk-atts">
      <i>📎</i>
      <div><b>附件${pending.length ? `（${pending.length} 个 · ${Backup.fmtBytes(pendingBytes)}）` : '（都备份过了）'}</b>
        <span>录音和图片打包成 zip</span></div>
    </button>
    <button class="bk-item" data-act="bk-all">
      <i>🗂️</i>
      <div><b>全部打包</b><span>文字 + 所有附件，换手机时用</span></div>
    </button>
    <div class="bk-tip">导出后会弹出系统分享面板，选「存储到文件」就能放进 iCloud 或网盘。</div>
    ${atts.some((a) => a.backed)
      ? `<button class="soft-btn danger bk-clean" data-act="bk-clean">清理已备份的附件（${atts.filter((a) => a.backed).length} 个 · ${Backup.fmtBytes(atts.filter((a) => a.backed).reduce((n, a) => n + (a.size || 0), 0))}）</button>` : ''}`;
}
async function bkText() {
  const blob = Backup.exportText(state, whoName());
  const r = await Backup.share(blob, Backup.textName());
  if (r === 'cancel') return;
  markBackup();
  closeMasks();
  toast(r === 'shared' ? '已经发出去了，选个地方存好' : '已下载，记得放进网盘', '📤');
}
async function bkAtts() {
  const all = attList();
  const list = all.filter((a) => !a.backed);
  const pick = list.length ? list : all;
  if (!pick.length) { toast('还没有附件呢', '📎'); return; }
  toast('正在打包，稍等一下…', '⏳');
  try {
    const r = await Backup.exportAtts(pick, Backup.stamp(new Date()));
    if (!r.count) { toast('这些附件不在这台设备上', '📎'); return; }
    const res = await Backup.share(r.blob, Backup.attsName());
    if (res === 'cancel') return;
    const ids = new Set(pick.map((a) => a.id));
    for (const rev of state.reviews || []) {
      for (const a of rev.atts || []) if (ids.has(a.id)) a.backed = Date.now();
    }
    markBackup();
    closeMasks();
    toast(`打包好了：${r.count} 个 · ${Backup.fmtBytes(r.bytes)}`, '📎');
  } catch (e) { toast('打包失败：' + e.message, '⚠️'); }
}
async function bkAll() {
  toast('正在打包全部内容…', '⏳');
  try {
    const r = await Backup.exportAll(state, attList(), whoName());
    const res = await Backup.share(r.blob, Backup.allName());
    if (res === 'cancel') return;
    const ids = new Set(attList().map((a) => a.id));
    for (const rev of state.reviews || []) {
      for (const a of rev.atts || []) if (ids.has(a.id)) a.backed = Date.now();
    }
    markBackup();
    closeMasks();
    toast(`全部打包好了：${Backup.fmtBytes(r.blob.size)}`, '🗂️');
  } catch (e) { toast('打包失败：' + e.message, '⚠️'); }
}
async function bkClean() {
  const atts = attList().filter((a) => a.backed);
  if (!atts.length) { toast('还没有备份过的附件', '📎'); return; }
  const bytes = atts.reduce((n, a) => n + (a.size || 0), 0);
  if (!confirm(`清理 ${atts.length} 个已备份的附件（${Backup.fmtBytes(bytes)}）？\n\n它们已经在你导出的包里了，本机只留记录。`)) return;
  for (const a of atts) { try { await Backup.IDB.del(a.id); } catch (e) { } }
  toast(`清掉了 ${atts.length} 个附件，释放 ${Backup.fmtBytes(bytes)}`, '🧹');
  paintStore();
  renderBackup();
}
function doRestore() { const i = $('#restoreFile'); if (i) i.click(); }
async function paintStore() {
  const el = $('#storeInfo'); if (!el) return;
  try {
    const u = await Backup.usage();
    el.textContent = u.files ? `${u.files} 个 · ${Backup.fmtBytes(u.bytes)}` : '本机';
  } catch (e) { }
}
function backupNudge() {
  const last = state.lastBackup || 0;
  const days = last ? Math.floor((Date.now() - last) / 86400000) : 999;
  if (days < 7) return;
  const k = 'xiaorizi.nudge';
  const t = today();
  try { if (localStorage.getItem(k) === t) return; localStorage.setItem(k, t); } catch (e) { }
  setTimeout(() => {
    toast(last ? `已经 ${days} 天没备份了，存一份到网盘吧` : '数据只在这台设备上，建议先备份一次', '📤');
  }, 4200);
}

function doPrint() {
  const from = weekStart(today()), to = addDays(from, 6);
  const l = tasksIn(from, to);
  $('#printArea').innerHTML = `<h2>${esc(state.me.name)} 的这一周 ${from} ~ ${to}</h2>
    <p>完成 ${l.filter((x) => x.done).length} / ${l.length} 件小事</p>
    ${Array.from({ length: 7 }, (_, i) => {
    const d = addDays(from, i), day = tasksOn(d);
    return `<h4>${d} 周${CN[dow(d)]} ${state.moods[d] ? MOODS[state.moods[d]] : ''}</h4>` +
      (day.length ? `<ul>${day.map((x) => `<li>[${x.done ? 'x' : ' '}] ${esc(x.title)}${x.time ? ' · ' + x.time : ''}</li>`).join('')}</ul>`
        : '<p>休息一下~</p>') + (state.joys[d] ? `<p>🌈 ${esc(state.joys[d])}</p>` : '');
  }).join('')}`;
  window.print();
}

/* ==========================================================
   手机手感层 · 手势 / 过渡 / 触感
   ----------------------------------------------------------
   出发点：iPhone 上手指比鼠标快，所有"能转场的地方"都要跟手。
   原则：① 跟手（位移 1:1 映射）② 松手吸附（距离或速度任一达标就翻页）
        ③ 到头有阻尼（橡皮筋）④ 竖滑永远优先给页面滚动
   ========================================================== */
const VIEW_ORDER = ['today', 'calendar', 'review', 'study', 'garden'];
const isMobile = () => window.matchMedia('(max-width: 860px)').matches;
const haptic = (ms = 8) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } };
const anyMaskOpen = () => !!document.querySelector('.mask.open');
const drawerOpen = () => isMobile() && !state.settings.collapsed;
const EASE = 'cubic-bezier(.22,.9,.28,1)';
const SPRING = 'cubic-bezier(.22,1.12,.36,1)';
const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
const RM = (() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
const dur = (fast, slow) => (RM ? Math.min(fast, 90) : slow);
/* 横滑时剪掉横向溢出：clip 不会产生滚动容器，顶栏 sticky 不受影响 */
const panClip = (on) => document.documentElement.classList.toggle('pan-clip', !!on);

/* ---------- 新页面从滑动的方向进场（点按钮切页时用） ---------- */
function slideContent(dir) {
  const c = $('#content'); if (!c || ui.panBusy) return;
  c.classList.remove('sl-in-r', 'sl-in-l');
  void c.offsetWidth;
  c.classList.add(dir >= 0 ? 'sl-in-r' : 'sl-in-l');
  clearTimeout(c._sl);
  c._sl = setTimeout(() => c.classList.remove('sl-in-r', 'sl-in-l'), 360);
}
/* 只让某张卡左右晃一下（点箭头换日期 / 翻周用） */
function nudge(el, dir) {
  if (!el) return;
  const cls = dir >= 0 ? 'nd-r' : 'nd-l';
  el.classList.remove('nd-r', 'nd-l'); void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 340);
}
function paintTabs() {
  $$('.tb-item').forEach((b) => b.classList.toggle('is-active', b.dataset.view === ui.view));
}
/* 切页：方向感过渡 + 收起抽屉 + 每个标签各记各的滚动位置 */
function goView(v) {
  v = v === 'wish' ? 'calendar' : v;
  if (!v) return;
  const from = ui.view;
  if (from === v) {                                   // 再点一次当前标签 = 回到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    schedule('view', renderView);
    return;
  }
  ui.scroll = ui.scroll || {};
  ui.scroll[from] = window.scrollY || 0;              // 记下这一页看到哪儿了
  const dir = VIEW_ORDER.indexOf(v) >= VIEW_ORDER.indexOf(from) ? 1 : -1;
  ui.view = v; ui.heroPop = null;
  if (v === 'calendar') { ui.anchor = ui.sel; ui.cur = ui.sel; }
  try { history.replaceState(null, '', '#' + v); } catch (e) { }
  if (isMobile() && !state.settings.collapsed) setCollapsed(true);   // 抽屉随页关掉
  try { window.scrollTo(0, 0); } catch (e) { }
  schedule('view', renderView); schedule('side', renderSide);
  if (!ui.panBusy) schedule('slide', () => slideContent(dir));       // 先换内容，再从滑动的方向进场
  const back = ui.scroll[v] || 0;                     // 回到上次离开的位置（跟手翻页时不跳）
  if (back) schedule('scroll', () => { try { window.scrollTo(0, back); } catch (e) { } });
  paintTabs();
}

/* ---------- 跟手翻页的收尾：先滑出去 → 换内容 → 从另一侧滑进来 ---------- */
function panSwap(dir, apply) {
  const c = $('#content');
  if (!c || ui.panBusy) return;
  ui.panBusy = true;
  const w = Math.max(300, c.clientWidth || window.innerWidth);
  c.classList.remove('sl-in-r', 'sl-in-l');
  panClip(true);
  c.style.willChange = 'transform';
  c.style.transition = `transform ${dur(90, 190)}ms cubic-bezier(.32,.06,.68,1)`;
  c.style.transform = `translateX(${-dir * w}px)`;
  clearTimeout(ui._pan1); clearTimeout(ui._pan2);
  ui._pan1 = setTimeout(() => {
    try { apply(); } catch (e) { console.error(e); }
    c.style.transition = 'none';
    c.style.transform = `translateX(${dir * w * .92}px)`;   // 新内容先站在另一侧
    raf2(() => {
      c.style.transition = `transform ${dur(80, 320)}ms ${EASE}`;
      c.style.transform = '';
      ui._pan2 = setTimeout(() => {
        c.style.transition = ''; c.style.transform = ''; c.style.willChange = '';
        c.classList.remove('pan-live');
        panClip(false); ui.panBusy = false;
      }, dur(80, 330));
    });
  }, dur(90, 185));
}
/* 万一中途出错，别把页面卡在平移状态 */
function resetPan() {
  const c = $('#content'); if (!c) return;
  clearTimeout(ui._pan1); clearTimeout(ui._pan2);
  c.style.transition = ''; c.style.transform = ''; c.style.willChange = '';
  c.classList.remove('pan-live');
  ui.panBusy = false; panClip(false);
}

/* ---------- 这一步能不能翻：到头的方向给阻尼 ---------- */
function canSwipeTo(dir) {
  const v = ui.view;
  if (v === 'today' || v === 'calendar') return true;      // 日期 / 月份没有尽头
  if (ui.studySid) return dir < 0;                          // 栏目里只有"返回"
  const i = VIEW_ORDER.indexOf(v), j = i + dir;
  if (i < 0 || j < 0 || j >= VIEW_ORDER.length) return false;

  return true;
}
function swipeGo(dir) {
  if (ui.panBusy) return;
  const v = ui.view;
  haptic(10);
  if (v === 'today') return panSwap(dir, () => setCur(addDays(ui.cur, dir)));
  if (v === 'calendar') return panSwap(dir, () => shift(dir));
  if (ui.studySid) {
    if (dir > 0) return;
    return panSwap(-1, () => { ui.studySid = null; schedule('view', renderView); });
  }
  const i = VIEW_ORDER.indexOf(v), j = i + dir;
  if (i < 0 || j < 0 || j >= VIEW_ORDER.length) return;
  panSwap(dir, () => goView(VIEW_ORDER[j]));
}

/* ---------- 主区左右滑：1:1 跟手 ---------- */
function initSwipeViews() {
  const c = $('#content'); if (!c) return;
  /* 输入框、行内左滑、横向滚动条自己处理，别抢 */
  const blockSel = 'input,textarea,select,.task-wrap,.sw-act,.pop,.side,.hero-pop,'
    + '.seed-row,.att-list,.dex-row,.sheet-mask,.mask,.wish-row,[data-noswipe]';
  let s = null;

  c.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || ui.panBusy || anyMaskOpen() || drawerOpen()) { s = null; return; }
    if (e.target.closest(blockSel)) { s = null; return; }
    const t = e.touches[0];
    s = { x: t.clientX, y: t.clientY, dx: 0, axis: 0, t: Date.now(), can: true, hit: false };
  }, { passive: true });

  c.addEventListener('touchmove', (e) => {
    if (!s || e.touches.length !== 1 || ui.panBusy) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.2) { s = null; return; }   // 竖滑：交给页面滚
      s.axis = 1;
      s.can = canSwipeTo(dx < 0 ? 1 : -1);
      c.classList.remove('sl-in-r', 'sl-in-l');
      c.classList.add('pan-live');
      panClip(true);
      c.style.willChange = 'transform';
      c.style.transition = 'none';
    }
    const d = s.can ? dx : dx * .26;                 // 到头：越拉越紧
    s.dx = d;
    c.style.transform = `translateX(${d}px)`;
    if (!s.hit && s.can && Math.abs(d) > 54) { s.hit = true; haptic(6); }
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  const settle = (commit) => {
    const dx = s ? s.dx : 0;
    s = null;
    if (!c.style.transform) { c.classList.remove('pan-live'); panClip(false); return; }
    if (commit) {
      swipeGo(dx < 0 ? 1 : -1);                      // 从当前位置接着滑出去，不回头
    } else {
      c.style.transition = `transform ${dur(90, 360)}ms ${SPRING}`;
      c.style.transform = '';
      clearTimeout(c._pb);
      c._pb = setTimeout(() => {
        c.style.transition = ''; c.style.willChange = '';
        c.classList.remove('pan-live');
        panClip(false);
      }, dur(90, 380));
    }
  };

  c.addEventListener('touchend', () => {
    if (!s) return;
    const w = c.clientWidth || window.innerWidth;
    const dist = Math.abs(s.dx), dt = Math.max(1, Date.now() - s.t);
    const v = dist / dt;
    const commit = s.axis === 1 && s.can && (dist > Math.min(110, w * .2) || (v > .45 && dist > 28));
    settle(commit);
  }, { passive: true });
  c.addEventListener('touchcancel', () => { if (s) settle(false); }, { passive: true });
}

/* ---------- 任务卡：左滑出操作 / 右滑出编辑 / 一滑到底直接完成 / 长按操作表 ---------- */
const SW = {
  wrap: null, task: null, x0: 0, y0: 0, dx: 0, base: 0, axis: 0, t: 0, moved: false,
  w: 0, px: 0, pt: 0, vx: 0,
};
const SW_OPEN = 152, SW_EDIT = 76;      // 两个按钮 / 一个按钮
const LP = { timer: 0 };
const swChild = (w) => (w ? w.querySelector('.task') : null);
function closeSwipes(except) {
  $$('.task-wrap.swiped').forEach((w) => {
    if (w === except) return;
    w.classList.remove('swiped');
    const el = swChild(w);
    if (el) { el.classList.remove('sw-drag'); el.style.transform = ''; }
  });
}
/* 一滑到底：整行飞出去，然后把这件小事完成 / 撤销完成 */
function fullSwipeDone(wrap, el) {
  const id = wrap.dataset.id;
  const wide = wrap.clientWidth || 320;
  el.style.transition = 'transform .2s cubic-bezier(.4,0,.9,.6), opacity .2s ease';
  el.style.transform = `translateX(${-wide}px)`;
  el.style.opacity = '.45';
  haptic(12);
  setTimeout(() => {
    el.style.transition = ''; el.style.transform = ''; el.style.opacity = '';
    wrap.classList.remove('swiped');
    taskSheetAct('toggle', id);
  }, 190);
}
function initTaskGestures() {
  document.addEventListener('touchstart', (e) => {
    const w = e.target.closest('.task-wrap');
    if (!w || e.touches.length !== 1) return;
    const t = e.touches[0];
    SW.wrap = w; SW.task = swChild(w);
    SW.x0 = t.clientX; SW.y0 = t.clientY; SW.dx = 0; SW.axis = 0;
    SW.px = t.clientX; SW.pt = Date.now(); SW.vx = 0;
    SW.base = w.classList.contains('swiped') ? -SW_OPEN : 0;
    SW.w = w.clientWidth || 320;
    SW.t = Date.now(); SW.moved = false;
    clearTimeout(LP.timer);
    if (!isMobile()) return;
    LP.timer = setTimeout(() => {
      if (!SW.moved && SW.wrap) { openTaskSheet(w.dataset.id); haptic(16); }
    }, 520);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!SW.wrap || !SW.task || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - SW.x0, dy = t.clientY - SW.y0;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) { SW.moved = true; clearTimeout(LP.timer); }
    SW.vx = (t.clientX - SW.px) / Math.max(1, Date.now() - SW.pt);
    SW.px = t.clientX; SW.pt = Date.now();
    if (!SW.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      SW.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 1 : 2;
      if (SW.axis === 1) { SW.task.classList.add('sw-drag'); closeSwipes(SW.wrap); }
    }
    if (SW.axis !== 1) return;
    let x = SW.base + dx;
    if (x < -SW_OPEN) x = -SW_OPEN + (x + SW_OPEN) * .28;
    if (x > SW_EDIT) x = SW_EDIT + (x - SW_EDIT) * .28;
    SW.dx = x;
    SW.task.style.transform = `translateX(${x}px)`;
  }, { passive: true });

  const end = () => {
    clearTimeout(LP.timer);
    if (!SW.wrap) return;
    const w = SW.wrap, el = SW.task;
    if (SW.axis === 1 && el) {
      el.classList.remove('sw-drag');
      const x = SW.dx, full = -x > SW.w * .55 || (SW.vx < -1.1 && -x > SW.w * .3);
      if (full && !w.classList.contains('swiped')) {
        fullSwipeDone(w, el);
      } else {
        let nx = x;
        if (x < -SW_OPEN * .42) { nx = -SW_OPEN; w.classList.add('swiped'); }
        else if (x > SW_EDIT * .5) { nx = SW_EDIT; w.classList.add('swiped'); }
        else { nx = 0; w.classList.remove('swiped'); }
        if (nx) { el.style.transform = `translateX(${nx}px)`; closeSwipes(w); haptic(8); }
        else el.style.transform = '';
      }
    }
    SW.wrap = null; SW.task = null; SW.axis = 0;
  };
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', end, { passive: true });

  /* 点别处就收回去 */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.task-wrap')) closeSwipes();
  }, true);
}

/* 长按弹的 iOS 操作表 */
function openTaskSheet(id) {
  const t = state.tasks.find((x) => x.id === id); if (!t) return;
  closeSwipes();
  const box = document.createElement('div');
  box.className = 'sheet-mask';
  box.innerHTML = `<div class="sheet">
    <div class="sheet-grab"></div>
    <div class="sheet-h">${esc(t.title)}</div>
    <div class="sheet-grp">
      <button class="sh-it" data-sh="toggle">${t.done ? '↩️ 撤销完成' : '✅ 完成它'}</button>
      <button class="sh-it" data-sh="edit">✏️ 编辑这件小事</button>
      <button class="sh-it" data-sh="tomorrow">➡️ 挪到明天</button>
      <button class="sh-it" data-sh="copy">📋 复制一件</button>
      <button class="sh-it danger" data-sh="del">🗑️ 删除</button>
    </div>
    <button class="sh-it cancel" data-sh="cancel">取消</button>
  </div>`;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add('on'));
  const close = () => { box.classList.remove('on'); setTimeout(() => box.remove(), 240); };
  box.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-sh]');
    if (!b) { if (ev.target === box) close(); return; }
    close();
    const k = b.dataset.sh;
    setTimeout(() => taskSheetAct(k, id), 150);
  });
}
function taskSheetAct(k, id) {
  const t = state.tasks.find((x) => x.id === id); if (!t) return;
  if (k === 'toggle') {
    const b = document.querySelector(`.task[data-id="${id}"] .tick`);
    if (b) b.click();
    return;
  }
  if (k === 'edit') { openTask(id); return; }
  if (k === 'tomorrow') {
    t.date = addDays(t.date, 1); save();
    schedule('view', renderView); schedule('side', renderSide);
    toast(`挪到明天啦 · ${dayText(t.date)}`, '➡️');
    return;
  }
  if (k === 'copy') {
    const c = { ...t, id: uid(), done: false, gain: 0, rep: t.rep ? { ...t.rep } : null };
    state.tasks.push(c); save();
    const inList = !!$('#tlist');
    if (inList) schedule('list', patchList); else schedule('view', renderView);
    schedule('prog', patchProgress); schedule('side', renderSide);
    toast('复制好啦，改成你想要的样子吧', '📋');
    return;
  }
  if (k === 'del') delTask(id);
}

/* ---------- 侧边抽屉：遮罩 / 边缘右滑呼出 / 左滑收起（全程跟手） ---------- */
function initDrawer() {
  const side = $('#side'), scrim = $('#scrim');
  if (scrim) scrim.addEventListener('click', () => { setCollapsed(true); haptic(6); });
  const W = () => side.offsetWidth || 250;
  let s = null;

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || !isMobile() || anyMaskOpen() || ui.panBusy) { s = null; return; }
    const t = e.touches[0];
    if (!state.settings.collapsed && e.target.closest('#side')) {
      s = { x: t.clientX, y: t.clientY, mode: -1, axis: 0, dx: 0, t: Date.now() };
    } else if (state.settings.collapsed && t.clientX <= 26 && !e.target.closest('.side')) {
      s = { x: t.clientX, y: t.clientY, mode: 1, axis: 0, dx: 0, t: Date.now() };
    } else s = null;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!s || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (!s.axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) < Math.abs(dy) * 1.1) { s = null; return; }
      s.axis = 1;
      document.body.classList.add('drawer-drag');
      side.classList.add('dragging');
      scrim.style.transition = 'none';
    }
    const w = W();
    const d = s.mode === 1 ? clamp(dx, 0, w * 1.08) : clamp(dx, -w, 0);
    const p = s.mode === 1 ? clamp(d / w, 0, 1) : 1 - clamp(-d / w, 0, 1);
    s.dx = d;
    side.style.transform = `translateX(${s.mode === 1 ? -(w - d) : d}px)`;
    side.style.opacity = String(.35 + .65 * p);
    side.style.pointerEvents = 'auto';
    scrim.style.opacity = String(p * .95);
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  const end = () => {
    if (!s) return;
    const s0 = s; s = null;
    const w = W(), d = s0.dx, dt = Math.max(1, Date.now() - s0.t), v = Math.abs(d) / dt;
    if (s0.axis !== 1) {                     // 只是点了一下，没在拖动
      side.classList.remove('dragging');
      side.style.transform = ''; side.style.opacity = ''; side.style.pointerEvents = '';
      scrim.style.opacity = ''; scrim.style.transition = '';
      document.body.classList.remove('drawer-drag');
      return;
    }
    const open = s0.mode === 1
      ? (d > w * .32 || (v > .4 && d > 22))
      : !(-d > w * .32 || (v > .4 && -d > 22));
    side.style.transition = `transform .3s ${EASE}, opacity .24s ease`;
    side.style.transform = `translateX(${open ? 0 : -w}px)`;
    side.style.opacity = open ? '1' : '0';
    scrim.style.transition = 'opacity .24s ease';
    scrim.style.opacity = open ? '1' : '0';
    haptic(open ? 8 : 6);
    setTimeout(() => {
      side.classList.remove('dragging');
      side.style.transition = ''; side.style.transform = '';
      side.style.opacity = ''; side.style.pointerEvents = '';
      scrim.style.opacity = ''; scrim.style.transition = '';
      document.body.classList.remove('drawer-drag');
      setCollapsed(!open);
    }, 300);
  };
  window.addEventListener('touchend', end, { passive: true });
  window.addEventListener('touchcancel', end, { passive: true });
}

/* ---------- 下拉刷新 ---------- */
async function refreshAll() {
  renderSide(); renderView();
  toast('刷新好啦，都是最新的', '🌷');
}
function initPullRefresh() {
  const ptr = $('#ptr'); if (!ptr) return;
  const label = ptr.querySelector('b');
  let s = null;
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || anyMaskOpen() || drawerOpen() || !isMobile() || ui.panBusy) return;
    if (window.scrollY > 0) return;
    if (e.target.closest('input,textarea,select,.side,.modal,.sheet-mask,#resizer,.mask')) return;
    s = { y: e.touches[0].clientY, d: 0, on: false };
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!s) return;
    const dy = e.touches[0].clientY - s.y;
    if (dy <= 0) {
      if (s.on) { s.on = false; s.d = 0; ptr.classList.remove('on', 'ready'); ptr.style.height = '0px'; }
      return;
    }
    if (!s.on && dy < 14) return;
    s.on = true;
    /* 越拉越沉，像橡皮筋 */
    s.d = Math.min(88, dy * .52 - Math.min(16, dy * .06));
    ptr.classList.add('on');
    ptr.style.height = s.d + 'px';
    const ready = s.d > 48;
    if (ready !== s.ready) { if (ready) haptic(8); s.ready = ready; }
    ptr.classList.toggle('ready', ready);
    label.textContent = ready ? '松手就刷新' : '下拉刷新';
  }, { passive: true });
  const end = () => {
    if (!s) return;
    const fire = s.on && s.d > 48;
    s = null;
    if (!fire) { ptr.classList.remove('on', 'ready'); ptr.style.height = '0px'; return; }
    haptic(12);
    ptr.classList.add('busy');
    label.textContent = '正在刷新…';
    refreshAll().finally(() => {
      ptr.classList.remove('busy', 'ready');
      label.textContent = '下拉刷新';
      setTimeout(() => { ptr.classList.remove('on'); ptr.style.height = '0px'; }, 200);
    });
  };
  window.addEventListener('touchend', end, { passive: true });
  window.addEventListener('touchcancel', end, { passive: true });
}

/* ---------- 底部弹层 / 操作表：下拉关闭（跟手 + 速度 + 遮罩渐变） ---------- */
function initSheetDrag() {
  let s = null;
  const pick = (t) => {
    const mo = t.closest('.mask.open > .modal');
    if (mo) return { el: mo, bg: mo.closest('.mask'), kind: 'mask' };
    const sh = t.closest('.sheet-mask.on > .sheet');
    if (sh) return { el: sh, bg: sh.closest('.sheet-mask'), kind: 'sheet' };
    return null;
  };
  const reset = (el, bg) => {
    el.style.transition = ''; el.style.transform = '';
    bg.style.background = ''; bg.style.transition = ''; bg.style.opacity = '';
  };
  document.addEventListener('touchstart', (e) => {
    if (!isMobile() || e.touches.length !== 1) return;
    const p = pick(e.target); if (!p) return;
    const head = e.target.closest('.modal-head') || e.target.closest('.sheet-h')
      || e.target.closest('.sheet-grab');
    if (p.kind === 'mask' && !head && p.el.scrollTop > 0) return;
    s = {
      el: p.el, bg: p.bg, kind: p.kind, head: !!head,
      y: e.touches[0].clientY, x: e.touches[0].clientX,
      d: 0, axis: 0, t: Date.now(), py: e.touches[0].clientY, pt: Date.now(), v: 0,
    };
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!s || e.touches.length !== 1) return;
    const t = e.touches[0];
    const dy = t.clientY - s.y, dx = t.clientX - s.x;
    if (!s.axis) {
      if (Math.abs(dy) < 8 && Math.abs(dx) < 8) return;
      s.axis = Math.abs(dy) > Math.abs(dx) * 1.1 ? 1 : 2;
      if (s.axis !== 1) { reset(s.el, s.bg); s = null; return; }
      s.el.style.transition = 'none';
    }
    if (dy <= 0) {
      if (s.d) { s.d = 0; s.el.style.transform = ''; s.bg.style.background = ''; }
      return;
    }
    if (s.kind === 'mask' && !s.head && s.el.scrollTop > 0) return;   /* 抓到标题栏就随时能拖 */
    s.v = (t.clientY - s.py) / Math.max(1, Date.now() - s.pt);
    s.py = t.clientY; s.pt = Date.now();
    s.d = dy;
    s.el.style.transform = `translateY(${dy}px)`;
    const p = 1 - Math.min(1, dy / (s.el.offsetHeight || 420));
    s.bg.style.background = `rgba(60,40,55,${((s.kind === 'mask' ? .38 : .42) * p).toFixed(3)})`;
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
  const end = () => {
    if (!s) return;
    const { el, bg, d, v, kind } = s;
    s = null;
    if (!d) { reset(el, bg); return; }
    const close = d > 92 || (v > .55 && d > 24);
    if (!close) {
      el.style.transition = `transform .34s ${SPRING}`;
      el.style.transform = '';
      bg.style.transition = 'background .3s ease';
      bg.style.background = '';
      setTimeout(() => reset(el, bg), 350);
      return;
    }
    haptic(10);
    el.style.transition = 'transform .22s cubic-bezier(.4,0,.9,.6)';
    el.style.transform = `translateY(${el.offsetHeight || 420}px)`;
    bg.style.transition = 'background .22s ease';
    bg.style.background = 'rgba(60,40,55,0)';
    setTimeout(() => {
      if (kind === 'mask') closeMasks();
      else {
        const m = el.closest('.sheet-mask');
        if (m) { m.classList.remove('on'); setTimeout(() => m.remove(), 340); }
      }
      reset(el, bg);
    }, 170);
  };
  document.addEventListener('touchend', end, { passive: true });
  document.addEventListener('touchcancel', end, { passive: true });
}

/* ---------- 第一次用：左滑提示 ---------- */
let hintDone = false;
function maybeSwipeHint() {
  if (hintDone || !isMobile() || ui.view !== 'today') return;
  try { if (localStorage.getItem('xiaorizi.swhint') === '1') return; } catch (e) { }
  const row = document.querySelector('#tlist .task-wrap');
  if (!row) return;
  hintDone = true;
  try { localStorage.setItem('xiaorizi.swhint', '1'); } catch (e) { }
  const box = document.createElement('div');
  box.className = 'sw-hint';
  box.textContent = '← 左滑这一行，可以秒完成或删除';
  document.body.appendChild(box);
  const r = row.getBoundingClientRect();
  box.style.top = Math.max(76, r.top - 48) + 'px';
  setTimeout(() => {
    const el = swChild(row);
    if (!el) return;
    el.style.transform = 'translateX(-54px)';
    setTimeout(() => { el.style.transform = ''; }, 640);
  }, 380);
  setTimeout(() => box.remove(), 4200);
}

/* ==========================================================
   iOS 细节层 · 滚动 / 键盘 / 手感反馈
   ========================================================== */

/* ---------- 顶栏随滚动收缩、＋ 球自动避让 ---------- */
function initScrollChrome() {
  let last = window.scrollY || 0, raf = 0;
  const run = () => {
    raf = 0;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.classList.toggle('scrolled', y > 6);
    const dy = y - last;
    if (Math.abs(dy) > 6) {
      document.body.classList.toggle('scroll-down', dy > 0 && y > 120);
      last = y;
    } else if (y <= 48) {
      document.body.classList.remove('scroll-down');
      last = y;
    }
  };
  window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
  run();
}

/* ---------- 键盘弹起：把底部弹层抬到键盘上方，并保证输入框看得见 ---------- */
const KB = { h: 0 };
function ensureFieldVisible(el) {
  const m = el.closest('.modal'); if (!m || !m.offsetHeight) return;
  const er = el.getBoundingClientRect();
  const mr = m.getBoundingClientRect();
  const limit = mr.bottom - 64;                    // 给吸底按钮留位置
  if (er.bottom > limit) m.scrollTop += (er.bottom - limit + 14);
  else if (er.top < mr.top + 58) m.scrollTop -= (mr.top + 58 - er.top);
}
function applyKb() {
  const vv = window.visualViewport;
  if (!vv) return;
  const h = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
  const on = h > 110;
  KB.h = on ? h : 0;
  document.body.classList.toggle('kbd-open', on);
  document.documentElement.style.setProperty('--kb', KB.h + 'px');
  if (on) {
    const a = document.activeElement;
    if (a && a.closest && a.closest('.modal')) setTimeout(() => ensureFieldVisible(a), 40);
  }
}
function initKeyboardFit() {
  const vv = window.visualViewport;
  if (vv) { vv.addEventListener('resize', applyKb); vv.addEventListener('scroll', applyKb); }
  window.addEventListener('orientationchange', () => setTimeout(applyKb, 260));
  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (t.matches && t.matches('input,textarea,select') && t.closest('.modal')) {
      setTimeout(() => { applyKb(); ensureFieldVisible(t); }, 280);
    }
  });
  document.addEventListener('focusout', () => setTimeout(applyKb, 120));
}

/* ---------- 弹层打开时锁住背后页面（iOS 只有 position:fixed 真的锁得住） ---------- */
const LOCK = { y: 0, on: false };
function lockScroll() {
  if (LOCK.on || !isMobile()) return;
  LOCK.y = window.scrollY || 0;
  LOCK.on = true;
  document.body.style.top = `-${LOCK.y}px`;
  document.body.classList.add('lock-scroll');
}
function unlockScroll() {
  if (!LOCK.on) return;
  LOCK.on = false;
  document.body.classList.remove('lock-scroll');
  document.body.style.top = '';
  try { window.scrollTo(0, LOCK.y); } catch (e) { }
}
function syncScrollLock() { if (!anyMaskOpen()) unlockScroll(); }

/* ---------- 点按手感：轻触反馈 ---------- */
function initTapFeedback() {
  const sel = '.tb-item,.nav-item,.pill,.cell,.wcol,.sh-it,.mood-chip,.seed,.plot';
  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest(sel)) haptic(4);
  }, { passive: true });
  /* 点顶栏标题 = 回到顶部 */
  document.addEventListener('click', (e) => {
    if (e.target.closest('.tb-title')) window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 小备注随内容长高 ---------- */
function autoGrow(root) {
  (root ? root.querySelectorAll('textarea') : $$('.modal textarea')).forEach((t) => {
    t.style.height = 'auto';
    t.style.height = Math.min(220, Math.max(46, t.scrollHeight + 2)) + 'px';
  });
}
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.tagName === 'TEXTAREA' && t.closest('.mask')) {
    t.style.height = 'auto';
    t.style.height = Math.min(220, Math.max(46, t.scrollHeight + 2)) + 'px';
  }
});

/* ---------- 表单项没填：抖一下，别只靠红字 ---------- */
function initFormShake() {
  document.addEventListener('invalid', (e) => {
    const m = e.target.closest('.mask'); if (!m) return;
    const mo = m.querySelector('.modal') || m;
    mo.classList.remove('shake'); void mo.offsetWidth; mo.classList.add('shake');
    setTimeout(() => mo.classList.remove('shake'), 420);
  }, true);
}

/* ---------- 提示条：点一下 / 往上滑就收起来 ---------- */
function hideToast() {
  const el = $('#toast'); if (!el) return;
  clearTimeout(el._t);
  el.classList.remove('show', 'has-act');
  el.innerHTML = '';
}
function initToastDismiss() {
  const el = $('#toast'); if (!el) return;
  let d = null;
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.tst-act')) { d = null; return; }
    d = { y: e.clientY, x: e.clientX };
  }, { passive: true });
  el.addEventListener('pointerup', (e) => {
    if (!d) return;
    const dy = e.clientY - d.y, dx = e.clientX - d.x;
    d = null;
    if (dy < -10 || (Math.abs(dy) < 10 && Math.abs(dx) < 10)) hideToast();
  });
  el.addEventListener('pointercancel', () => { d = null; });
}

/* ---------- 撤销提示（删东西可以后悔） ---------- */
function toastUndo(msg, undo, face) {
  const el = $('#toast');
  el.innerHTML = `<span class="tst-txt">${esc((face ? face + ' ' : '') + msg)}</span>`
    + `<button class="tst-act" type="button">撤销</button>`;
  el.classList.add('show', 'has-act');
  clearTimeout(el._t);
  const hide = () => { el.classList.remove('show', 'has-act'); el.innerHTML = ''; };
  const b = el.querySelector('.tst-act');
  if (b) b.onclick = (ev) => { ev.stopPropagation(); hide(); try { undo(); } catch (err) { } haptic(10); };
  el._t = setTimeout(hide, 4200);
}
/* 删除一件小事：真的删，但给一次吃后悔药的机会 */
function delTask(id) {
  const t = state.tasks.find((x) => x.id === id); if (!t) return;
  const gone = [t];
  if (t.sid) {
    state.tasks.forEach((x) => {
      if (x.sid === t.sid && x.date >= t.date && !x.done && x.id !== t.id) gone.push(x);
    });
  }
  const ids = new Set(gone.map((x) => x.id));
  state.tasks = state.tasks.filter((x) => !ids.has(x.id));
  save();
  if ($('#tlist')) schedule('list', patchList); else schedule('view', renderView);
  schedule('prog', patchProgress); schedule('side', renderSide); schedule('teaser', patchTeaser);
  haptic(12);
  toastUndo(gone.length > 1 ? `已删除，后面 ${gone.length - 1} 次重复也一起取消` : '已删除',
    () => {
      state.tasks = state.tasks.concat(gone);
      save();
      schedule('view', renderView); schedule('side', renderSide); schedule('teaser', patchTeaser);
    });
}

/* 主题色跟着晚安模式走（iOS 状态栏颜色） */

function paintThemeColor() {
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = state.settings.theme === 'night' ? '#292238' : '#FFD9E4';
}


/* ---------- 启动 ---------- */
state = load();
state.me = state.me || { name: '小樱', face: '🌸' };
state.moods = state.moods || {};
state.joys = state.joys || {};
state.settings = Object.assign({ theme: 'day', sideW: 250, collapsed: true }, state.settings || {});
state.baskets = state.baskets || [];
/* 老用户（已经有内容）不再弹新手引导；新用户从引导开始 */
state.onboard = state.onboard || { v: 1, done: (state.tasks || []).length > 0 };
state.garden = Object.assign({
  drops: 0, total: 0, harvest: 0,
  plots: [null, null, null, null],
  dex: {}, weather: null, seen: [], bot: { name: '阿露', face: '🐰' },
}, state.garden || {});
state.garden.plots = state.garden.plots || [];
state.garden.dex = state.garden.dex || {};
state.garden.seen = state.garden.seen || [];
state.garden.bot = Object.assign({ name: '阿露', face: '🐰' }, state.garden.bot || {});
state.study = Object.assign(
  { subjects: SBJ_DEF.map((s) => ({ ...s, b: 1 })), sessions: [], reviews: [], goal: 180 },
  state.study || {});
state.study.subjects = state.study.subjects || [];
state.study.sessions = state.study.sessions || [];
state.study.reviews = state.study.reviews || [];
if (state.settings.theme === 'dark') state.settings.theme = 'night';
document.documentElement.dataset.theme = state.settings.theme;
ui.wishView = state.settings.wishView || 'grid';

fillAllRepeats();
studyBoot();
gardenDaily();
checkBadges();
try {
  const hv = String(location.hash || '').replace(/^#/, '');
  const [v0, arg] = hv.split(':');
  if (['today', 'calendar', 'review', 'garden', 'study'].includes(v0)) ui.view = v0;
  if (v0 === 'wish') ui.view = 'calendar';
  // #study:ziliao 可直达某个备考栏目
  if (v0 === 'study' && arg && state.study.subjects.some((x) => x.id === arg)) ui.studySid = arg;
  // #calendar:2026-10-27 可直达某一天并展开清单
  if (v0 === 'calendar' && arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    ui.sel = arg; ui.anchor = arg; ui.pick = arg;
  }
} catch (e) { }
/* 手机上侧栏当抽屉用：每次打开都是收起状态 */
if (isMobile()) state.settings.collapsed = true;
applySide();
initResizer();
initSwipeViews();
initTaskGestures();
initDrawer();
initPullRefresh();
initSheetDrag();
initScrollChrome();
initKeyboardFit();
initTapFeedback();
initFormShake();
initToastDismiss();
paintThemeColor();
renderSide();
renderView();
playSplash();
bootLocal();
setTimeout(maybeGuide, 2800);
setTimeout(maybeSwipeHint, 3600);
/* 转屏 / 窗口变化时重新对齐遮罩与安全区，别把页面卡在翻页中途 */
window.addEventListener('resize', () => {
  applySide(); schedule('tbh', setTbh);
  if (ui.panBusy) resetPan();
  applyKb();
});
window.addEventListener('orientationchange', () => { if (ui.panBusy) resetPan(); });
window.addEventListener('orientationchange', () => setTimeout(() => { applySide(); setTbh(); }, 260));
