# 文档部署

文档由原仓库 `LittleTurtle2333/z-paging-wevu` 的 GitHub Actions 发布。两套工作流独立构建和发布，一边失败不会阻断另一边。

| 平台 | 地址 | `DOCS_BASE` |
| --- | --- | --- |
| Cloudflare Workers 主站 | <https://paging.weapp.dev/> | `/` |
| GitHub Pages 备用站 | <https://littleturtle2333.github.io/z-paging-wevu/> | `/z-paging-wevu/` |

`DOCS_BASE` 默认保留 GitHub Pages 子路径。每个平台都从源码单独构建 `docs/.vitepress/dist`，不能把其中一份产物直接用于另一个平台。备用站是可独立访问的旧地址，不提供主域名自动故障切换。

## 首次启用 Workers

以下设置由原仓库管理员完成。PR 的构建验收不需要 Cloudflare 凭据；Workers 发布默认关闭。

1. 确认 Cloudflare 中的 `weapp.dev` zone 处于 Active 状态，并选用拥有该 zone 的账号。确认 `z-paging-wevu-docs` Worker 名称未被其他项目占用，且 `paging.weapp.dev` 没有冲突的 DNS 记录。
2. 为该账号创建 API token。首次创建 Worker 需要 Workers 产品级 **Admin**；配置 Custom Domain 还需要 **Zone → Workers Routes → Write**，zone 范围限定为 `weapp.dev`。Custom Domain 自动处理 DNS 和证书，无需授予 DNS Edit，也无需 KV、R2 等存储权限。账号 ID 必须与该 token 的账号一致。
3. 在原仓库的 **Settings → Environments** 创建 `cloudflare-production`，为该环境添加两个 secrets：

   | Secret | 内容 |
   | --- | --- |
   | `CLOUDFLARE_ACCOUNT_ID` | 拥有 `weapp.dev` 的 Cloudflare 账号 ID |
   | `CLOUDFLARE_API_TOKEN` | 上一步创建的 API token |

4. 在 **Settings → Secrets and variables → Actions → Variables** 添加仓库级变量 `CLOUDFLARE_DEPLOY_ENABLED`，值为 `true`。它必须是仓库变量；发布 job 的启用判断不会读取环境级变量。
5. 将部署改动合并到 `main`，或合并后在 **Actions** 手动运行 Workers 部署工作流，分支选择 `main`。确认发布 job 完成，再检查 Cloudflare 中的 Worker、Custom Domain 和证书状态。

部署使用锁定的 Wrangler `4.158.0` 和 `cloudflare/wrangler-action@v4.1.3`。配置中的 `paging.weapp.dev` 是 Workers **Custom Domain**，Cloudflare 会自动创建 DNS 记录并签发 HTTPS 证书。不要手工添加指向 GitHub Pages、`workers.dev` 或 `pages.dev` 的 CNAME。GitHub Pages 继续保留原默认域名，不绑定 `paging.weapp.dev`。

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

首次部署需要等待 DNS 和证书激活。若主域名尚未就绪，检查 Worker 的 **Settings → Domains & Routes** 中 Custom Domain 状态，再核对权威 DNS 和 HTTPS 响应；不要通过反复新增域名记录来重试。

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
