# 文档部署

文档由原仓库 `LittleTurtle2333/z-paging-wevu` 的 GitHub Actions 发布。两套工作流独立构建和发布，一边失败不会阻断另一边。

| 平台 | 地址 | `DOCS_BASE` |
| --- | --- | --- |
| Cloudflare Workers 主站 | <https://paging.weapp.dev/> | `/` |
| GitHub Pages 备用站 | <https://littleturtle2333.github.io/z-paging-wevu/> | `/z-paging-wevu/` |

`DOCS_BASE` 默认保留 GitHub Pages 子路径。每个平台都从源码单独构建 `docs/.vitepress/dist`，不能把其中一份产物直接用于另一个平台。备用站是可独立访问的旧地址，不提供主域名自动故障切换。

## 首次启用 Workers

Cloudflare 账号所有者负责创建 Worker 和绑定域名，原仓库管理员负责配置 GitHub Actions。PR 的构建验收不需要 Cloudflare 凭据；Workers 发布默认关闭。

1. 账号所有者确认 Cloudflare 中的 `weapp.dev` zone 处于 Active 状态，并选用拥有该 zone 的账号。确认 `z-paging-wevu-docs` Worker 名称未被其他项目占用，且 `paging.weapp.dev` 没有冲突的 DNS 记录。
2. 账号所有者预先创建名为 `z-paging-wevu-docs` 的 Worker，并关闭 `workers.dev` 和预览 URL。可以通过 [Create Worker API](https://developers.cloudflare.com/api/resources/workers/subresources/beta/subresources/workers/methods/create/) 先创建尚未部署代码的空 Worker；请求中将 `subdomain.enabled` 和 `subdomain.previews_enabled` 均设为 `false`。创建 Worker 需要账号所有者的 Workers 产品级 Admin 权限；这项权限不交给上游仓库。单 Worker 授权只能选择已经存在的 Worker，不能让 CI 首次创建它。
3. 账号所有者在 **Manage Account → Account API Tokens** 创建专用 token：资源范围选择 **Specified Workers**，仅选择 `z-paging-wevu-docs`，权限仅选择 **Workers → Editor**。不要添加账号范围的 Workers Admin/Editor，也不要添加任何 Zone、Workers Routes、DNS、KV 或 R2 权限。账号 ID 必须与 token 的账号一致。将 Account ID 和 token 通过私密渠道交给原仓库管理员。
4. 原仓库管理员在 **Settings → Environments** 创建 `cloudflare-production`，为该环境添加两个 secrets：

   | Secret | 内容 |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | 拥有 `weapp.dev` 的 Cloudflare 账号 ID |
   | `CLOUDFLARE_API_TOKEN` | 仅限 `z-paging-wevu-docs` 的 Workers Editor token |

5. 原仓库管理员在 **Settings → Secrets and variables → Actions → Variables** 添加仓库级变量 `CLOUDFLARE_DEPLOY_ENABLED`，值为 `true`。它必须是仓库变量；发布 job 的启用判断不会读取环境级变量。
6. 将部署改动合并到 `main`，或合并后在 **Actions** 手动运行 **Deploy documentation to Cloudflare Workers**，分支选择 `main`。确认发布 job 完成。
7. 首次发布成功后，账号所有者在该 Worker 的 **Settings → Domains & Routes → Add → Custom Domain** 中绑定 `paging.weapp.dev`，再检查域名和证书状态。这是一次性设置，后续 CI 仅更新 Worker 内容，不创建或修改域名连接。

CI token 的权限范围是这一个 Worker，允许读取和更新其代码、版本、部署与设置，也允许重命名该 Worker；它不能管理其他 Workers 或任何 zone 的 DNS、路由及域名绑定。该权限边界由 Cloudflare 的 Worker 资源授权强制执行，不是仅靠工作流中的名称约定。Worker Editor 并非按 HTTP 主机名授权；域名连接始终由账号所有者管理。

部署使用锁定的 Wrangler `4.158.0` 和 `cloudflare/wrangler-action@v4.1.3`。`wrangler.jsonc` 不声明 `routes`，并显式设置 `workers_dev: false`、`preview_urls: false`，因此发布不会管理 Custom Domain，也不会默认新增 `workers.dev` 或预览地址。账号所有者绑定 `paging.weapp.dev` 这个 Workers **Custom Domain** 后，Cloudflare 会自动创建 DNS 记录并签发 HTTPS 证书。不要手工添加指向 GitHub Pages、`workers.dev` 或 `pages.dev` 的 CNAME。GitHub Pages 继续保留原默认域名，不绑定 `paging.weapp.dev`。

发布 job 仅在 `main` 推送或针对 `main` 手动运行时执行，并且要求 `CLOUDFLARE_DEPLOY_ENABLED=true`。其他分支和 PR 只做构建验收。开启发布后，如果环境 secrets 缺失，工作流会明确失败，管理员需补全配置后重新运行。

官方说明：[Workers 角色和权限](https://developers.cloudflare.com/workers/authorization/workers/)、[Custom Domain 与自动 DNS/证书](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)、[GitHub Actions 发布 Workers](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)。

## 构建与上线验收

环境使用 Node.js 22、pnpm `11.20.0`，先安装锁定依赖及 Chromium。Linux CI 需要同时安装浏览器的系统依赖：

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps --only-shell chromium
pnpm typecheck
pnpm test:docs
DOCS_BASE=/ pnpm test:docs
pnpm exec wrangler deploy --dry-run
```

`pnpm test:docs` 先构建，再通过后台浏览器验证真实产物；`DOCS_BASE` 同时控制文档路径、favicon 和验收入口。两次验收分别覆盖子路径和根路径，截图保存在 `.tmp/github-pages/` 和 `.tmp/root/`。验收结束会释放自己的浏览器和预览服务。

Workers 静态资源配置使用 `drop-trailing-slash` 和 `404-page`。上线后检查：

- `https://paging.weapp.dev/` HTTPS 正常，CSS、JavaScript、logo 和 favicon 均能加载。
- 直接访问 `/guide/getting-started`、`/advanced/virtual-list`、`/api/props` 并刷新页面，内容仍然正常；导航和搜索结果留在正确站点路径。
- 不存在的文档路径返回 HTTP 404，不返回首页的 200 状态。
- GitHub Pages 备用站的首页、深层链接和资源仍使用 `/z-paging-wevu/` 并可正常访问。

首次部署完成并由账号所有者绑定 Custom Domain 后，需要等待 DNS 和证书激活。若主域名尚未就绪，请账号所有者检查 Worker 的 **Settings → Domains & Routes** 中 Custom Domain 状态，再核对权威 DNS 和 HTTPS 响应；不要通过反复新增域名记录来重试，也不要扩大 CI token 的权限来处理域名设置。

每次成功上线后，在 GitHub Actions 运行记录或部署记录中保留源码 commit、Worker 版本 ID、主站验收结果。版本 ID 可在 Cloudflare Worker 的 **Deployments** 页面查看，也可通过已授权的本地命令查询：

```bash
pnpm exec wrangler versions list
```

## 暂停发布与回滚

将仓库变量 `CLOUDFLARE_DEPLOY_ENABLED` 改为 `false` 可暂停后续 Workers 发布。构建验收和 GitHub Pages 发布继续运行；这个开关不会下线已经部署的 Worker。

如果新版本存在问题，使用同一 Cloudflare 账号在控制台回滚至已验收版本，或在已授权的本地环境执行：

```bash
pnpm exec wrangler rollback <VERSION_ID>
```

回滚后重新检查主站的首页、深层链接、静态资源和 404。随后修复或回退源码，再恢复自动发布，避免下一次 `main` 推送重新部署故障版本。若仅需向用户提供备用入口，直接使用 GitHub Pages 地址；它的子路径产物不能通过简单修改主域名 DNS 接管根路径。
