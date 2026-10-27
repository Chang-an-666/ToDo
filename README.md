# 小日子 · 本地优先的计划本

待办清单 · 日历纪念日 · 复盘 · 备考计时 · 小花园养成。

**没有服务器、没有账号** —— 打开就能用，数据只存在你自己的设备里。
需要换设备或想留个底，就把数据导出成文件，用系统分享面板存进 iCloud / 网盘。

## 怎么打开

| 方式 | 步骤 |
| --- | --- |
| 在线（推荐） | **https://xiaorizi-362.pages.dev/** |
| 手机上 | Safari 打开上面的地址 → 分享 → **添加到主屏幕**（全屏、有图标） |
| 本地 | 双击 `index.html`（部分功能受限，见下） |

## 部署到 Cloudflare Pages

代码放 GitHub，站点放 Cloudflare Pages。**网址固定不变，改代码只换内容。**

当前线上：
- 站点 **https://xiaorizi-362.pages.dev/**
- 项目名 `xiaorizi`（`xiaorizi.pages.dev` 被别人占了，所以公开子域带 `-362` 后缀）
- 代码仓库 https://github.com/Chang-an-666/ToDo

### 方式 A：后台连 GitHub（推荐，零命令）

一次配置，之后 `git push` 就自动发布：

1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**
2. 选你的仓库，分支 `main`
3. 构建命令**留空**，输出目录填 **`/`**（纯静态，不需要构建）
4. 部署完拿到 `https://<项目名>.pages.dev`

> 为什么构建命令留空：这个项目没有打包步骤，仓库根目录就是最终产物。

### 方式 B：本地一条命令

不想连 GitHub、或者想手动控制发布时机：

```bash
npx wrangler login            # 首次，浏览器点一下授权
npm run ship                  # 打包 + 发布，10 秒
```

首次如果项目还不存在：

```bash
npx wrangler pages project create xiaorizi
```

- `npm run pack` 只打包到 `.publish`，不发布
- 项目名或子域对不上时：`PAGES_PROJECT=xiaorizi PAGES_URL=https://xiaorizi-362.pages.dev npm run ship`
- 无人值守（CI）：

```bash
export CLOUDFLARE_API_TOKEN=...      # 只需 Account · Cloudflare Pages · Edit 权限
export CLOUDFLARE_ACCOUNT_ID=...
export PAGES_URL=https://xiaorizi-362.pages.dev
npm run ship
```
- 项目名被占就换：`PAGES_PROJECT=xiaorizi-changan npm run ship`

### 为什么网址不会变

- Cloudflare Pages 的域名绑在**项目**上，每次部署只替换产物，不动域名
- `_headers` 把所有代码文件设成 `no-cache`，改完推上去用户下次打开就是新版
- Service Worker 用网络优先（1.5 秒超时回落缓存），断网也能开

## 备份（这套方案的核心）

侧边栏 → **导出备份**：

| 选项 | 内容 | 体积 |
| --- | --- | --- |
| 📄 文字数据 | 任务、复盘、纪念日、备考、花园 | 几十 KB |
| 📎 附件 | 录音、图片（未备份的优先） | 按需 |
| 🗂️ 全部打包 | 文字 + 所有附件，换手机用 | 两者之和 |

点完会弹出**系统分享面板**（iOS/Android）：

- 选「存储到文件」→ iCloud Drive / 我的 iPhone
- 或直接选百度网盘、微信、隔空投送

**导入**：侧边栏 → 导入备份 → 从「文件」App 里挑之前的 `.json` 或 `.zip`。
导入前会提示覆盖，并建议先导出一份当前的。

附件导出后会标「已备份」，可以在导出面板里一键清理本机文件，释放空间（记录仍在，从备份包恢复即可再看）。

## 数据放在哪

| 内容 | 位置 |
| --- | --- |
| 全部文字数据 | 浏览器 `localStorage['xiaorizi.v2']` |
| 附件（录音/图片/文档） | IndexedDB `xiaorizi-att` |
| 代码缓存（离线） | Cache Storage（Service Worker） |

**清浏览器数据 = 数据没了**。所以：每次大改之后、换手机之前，导出一份。

## 关于更新

- 改代码 → `git push` → 网址不变、内容更新
- `index.html` / `app.js` / `styles.css` 都是 `no-cache`，不会出现"改了但用户还看旧版"
- Service Worker 用 **网络优先**（1.5 秒超时回落缓存），断网也能打开
- 数据带版本号（`state.schema`），代码更新后旧数据会自动迁移，不会读不出来

## 本地开发

```bash
npm run serve     # http://127.0.0.1:8080（模拟 Pages 的 no-cache）
npm test          # 28 项：zip 打包/解包、导出/导入、数据迁移
npm run pack      # 只打包到 .publish，看看会传哪些文件
npm run ship      # 打包 + 发布到 Cloudflare Pages
node tools/gen-icons.js   # 重新生成图标（改配色时用）
```

## 文件结构

```
index.html            页面骨架
styles.css            全部样式（含 iOS 安全区）
app.js                业务逻辑（待办 / 日历 / 复盘 / 备考 / 花园）
js/zip.js             打包与解包（store-only，省内存）
js/backup.js          导出 / 导入 / 系统分享
js/migrate.js         数据版本与迁移
sw.js                 Service Worker（离线 + 自动更新）
manifest.webmanifest  PWA 清单
icons/                图标（180 / 192 / 512 / 32）
tools/serve.js        本地预览服务
tools/ship.js         一键发布（打包 + wrangler 上传）
tools/gen-icons.js    图标生成器
_headers              Cloudflare 响应头（全 no-cache）
.nojekyll             防止任何静态托管跑 Jekyll
test/unit.test.js     单元测试
```

## 已知限制

- **两台设备不互通**：数据在各自设备上，互看只能靠导出文件互发
- **`file://` 打开**（直接双击 html）时：Service Worker 不生效，麦克风不可用（浏览器安全策略），建议始终用 https 网址
- 附件体积受浏览器配额限制（iOS 约 1 GB），定期导出 + 清理
