import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_CLI = '/Applications/wechatwebdevtools.app/Contents/MacOS/cli'
const PROJECT_CONFIG = 'demo/project.config.json'

/**
 * DevTools e2e 的前置条件：
 * 1. `demo/dist` 是最新产物（`project.config.json` 的 miniprogramRoot 指向 `dist/`）
 * 2. 有真实 appid —— 仓库默认的 `touristappid` 会被 DevTools 的 `/v2/auto`
 *    拒绝，返回 `{"code":"APPID_ERROR"}`。优先读环境变量 `WEAPP_DEVTOOLS_APPID`，
 *    其次读被 gitignore 的 `.env.local`；测试结束后恢复原配置文件。
 */
async function resolveAppId(): Promise<string> {
  const fromEnv = process.env.WEAPP_DEVTOOLS_APPID?.trim()
  if (fromEnv) {
    return fromEnv
  }
  try {
    const raw = await readFile('.env.local', 'utf8')
    const line = raw
      .split('\n')
      .map(item => item.trim())
      .find(item => item.startsWith('WEAPP_DEVTOOLS_APPID='))
    if (!line) {
      return ''
    }
    return line.slice('WEAPP_DEVTOOLS_APPID='.length).trim().replace(/^['"]|['"]$/g, '')
  }
  catch {
    return ''
  }
}

export default async function setup(project: { provide: (key: string, value: unknown) => void }) {
  const appId = await resolveAppId()
  project.provide('devtoolsAppId', appId)
  project.provide('devtoolsProjectPath', path.resolve('demo'))
  project.provide('devtoolsCliPath', process.env.WEAPP_DEVTOOLS_CLI ?? DEFAULT_CLI)

  if (!appId) {
    process.stderr.write(
      '\n[devtools-e2e] 未设置 WEAPP_DEVTOOLS_APPID，用例将被跳过。\n'
      + '              仓库里的 touristappid 无法用于自动化（DevTools 返回 APPID_ERROR）。\n'
      + '              请设置为你自己的小程序或测试号 appid 后重试。\n\n',
    )
    return
  }

  execFileSync(process.execPath, ['demo/scripts/sync-source.mjs'], { stdio: 'inherit' })
  execFileSync(process.execPath, ['node_modules/weapp-vite/bin/weapp-vite.js', 'build', 'demo'], {
    stdio: 'inherit',
  })

  const configPath = path.resolve(PROJECT_CONFIG)
  const original = await readFile(configPath, 'utf8')
  const config = JSON.parse(original)
  config.appid = appId
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  // 恢复仓库里的占位 appid，避免把本地 appid 提交进仓库
  return async () => {
    await writeFile(configPath, original, 'utf8')
  }
}
