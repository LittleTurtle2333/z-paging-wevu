import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { chromium } from 'playwright'

const origin = 'http://127.0.0.1:4173/z-paging-wevu/'
const outputDir = new URL('../.tmp/', import.meta.url)
await mkdir(outputDir, { recursive: true })

const server = spawn('pnpm', ['dev', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
  cwd: new URL('..', import.meta.url),
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOutput = ''
server.stdout.on('data', chunk => { serverOutput += chunk })
server.stderr.on('data', chunk => { serverOutput += chunk })

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(origin)
      if (response.ok) return
    }
    catch {}
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`文档服务启动失败：\n${serverOutput}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
const badResponses = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text())
})
page.on('response', response => {
  if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`)
})

try {
  await waitForServer()
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.locator('.VPHero').waitFor()
  await page.screenshot({ path: new URL('home-desktop.png', outputDir).pathname, fullPage: true })

  await page.getByRole('link', { name: '快速开始', exact: true }).click()
  await page.waitForURL('**/guide/getting-started')
  await page.locator('h1').filter({ hasText: '安装与快速开始' }).waitFor()

  await page.getByRole('link', { name: '功能', exact: true }).click()
  await page.waitForURL('**/advanced/virtual-list')
  await page.locator('h1').filter({ hasText: '虚拟列表' }).waitFor()
  await page.screenshot({ path: new URL('virtual-list-desktop.png', outputDir).pathname, fullPage: true })

  await page.getByRole('link', { name: 'API', exact: true }).click()
  await page.waitForURL('**/api/props')
  await page.locator('h1').filter({ hasText: 'Props' }).waitFor()
  await page.locator('table').first().waitFor()
  if (await page.locator('table').count() < 5) throw new Error('Props 表格未完整渲染')

  await page.getByRole('switch').first().click()
  if (!await page.locator('html.dark').count()) throw new Error('深色主题切换失败')
  await page.getByRole('switch').first().click()

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.screenshot({ path: new URL('home-mobile.png', outputDir).pathname, fullPage: true })
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }))
  if (dimensions.content > dimensions.viewport) {
    throw new Error(`移动端存在横向滚动：${JSON.stringify(dimensions)}`)
  }

  if (errors.length || badResponses.length) {
    throw new Error(JSON.stringify({ errors, badResponses }, null, 2))
  }
  console.log(JSON.stringify({ ok: true, errors, badResponses, mobile: dimensions }, null, 2))
}
finally {
  await browser.close()
  try { process.kill(-server.pid, 'SIGTERM') } catch {}
}
