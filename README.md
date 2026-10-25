# 小日子 · 本地优先的计划本

待办清单 · 日历纪念日 · 复盘 · 备考计时 · 小花园养成。

**没有服务器、没有账号** —— 打开就能用，数据只存在你自己的设备里。
需要换设备或想留个底，就把数据导出成文件，用系统分享面板存进 iCloud / 网盘。

## 怎么打开

| 方式 | 步骤 |
| --- | --- |
| 在线（推荐） | 打开 `https://<你的用户名>.github.io/<仓库名>/` |
| 手机上 | Safari 打开上面的地址 → 分享 → **添加到主屏幕**（全屏、有图标） |
| 本地 | 双击 `index.html`（部分功能受限，见下） |

## 部署到 GitHub Pages（一次配置，以后 push 即更新）

1. 新建一个仓库，把本目录推上去（分支 `main`）
2. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
3. 首次 push 后 `.github/workflows/pages.yml` 会自动发布
4. 之后每次 `git push`，几十秒后同一个网址就变成新版

网址永远不变，不需要重新部署、不需要换链接。

```bash
git init && git add -A
git commit -m "小日子 v3"
git remote add origin https://github.com/<你>/<仓库>.git
git push -u origin main
```

> 想让用户立刻拿到新版：把 `sw.js` 顶部的 `VERSION` 改一下（比如 `v3.0.1`）。
> Service Worker 会自动更新缓存，用户下次打开就是新的。

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
npm run serve     # http://127.0.0.1:8080
npm test          # 28 项：zip 打包/解包、导出/导入、数据迁移
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
tools/gen-icons.js    图标生成器
test/unit.test.js     单元测试
```

## 已知限制

- **两台设备不互通**：数据在各自设备上，互看只能靠导出文件互发
- **`file://` 打开**（直接双击 html）时：Service Worker 不生效，麦克风不可用（浏览器安全策略），建议始终用 https 网址
- 附件体积受浏览器配额限制（iOS 约 1 GB），定期导出 + 清理
