import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { chromium } from 'playwright'

const base = process.env.DOCS_BASE ?? '/z-paging-wevu/'
assert(base.startsWith('/') && base.endsWith('/'), 'DOCS_BASE 必须以 / 开头和结尾')
const serverOrigin = 'http://127.0.0.1:4173'
const origin = new URL(base, serverOrigin).href
const url = path => new URL(path, origin).href
const readyMessages = [serverOrigin, 'http://localhost:4173']
  .map(reportedOrigin => `Built site served at ${new URL(base, reportedOrigin).href}`)
const target = base === '/' ? 'root' : 'github-pages'
const outputDir = new URL(`../.tmp/${target}/`, import.meta.url)
await mkdir(outputDir, { recursive: true })

let server
let serverClosed
let serverState
let serverError
let serverOutput = ''
let browser
let result
const failures = []

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (serverError) throw serverError
    if (serverState) throw new Error(`文档预览服务提前退出：${JSON.stringify(serverState)}\n${serverOutput}`)
    // VitePress logs this from its listen callback, after binding the exact port.
    // Only test our child's ready server, even if another service owns the port.
    if (readyMessages.some(message => serverOutput.includes(message))) {
      try {
        const response = await fetch(origin, { signal: AbortSignal.timeout(1000) })
        if (response.ok) return
      }
      catch {}
    }
    await delay(250)
  }
  throw new Error(`文档预览服务启动失败：\n${serverOutput}`)
}

async function waitForExit(timeout) {
  let timer
  try {
    return await Promise.race([
      serverClosed.then(() => true),
      new Promise(resolve => { timer = setTimeout(() => resolve(false), timeout) }),
    ])
  }
  finally {
    clearTimeout(timer)
  }
}

function stopServer(signal) {
  if (!server?.pid) return
  try {
    process.kill(-server.pid, signal)
  }
  catch (error) {
    if (error.code !== 'ESRCH') throw error
  }
}

try {
  server = spawn('pnpm', ['docs:preview', '--port', '4173'], {
    cwd: new URL('..', import.meta.url),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.on('error', error => { serverError = error })
  serverClosed = new Promise(resolve => {
    server.once('close', (code, signal) => {
      serverState = { code, signal }
      resolve()
    })
  })
  server.stdout.on('data', chunk => { serverOutput += chunk })
  server.stderr.on('data', chunk => { serverOutput += chunk })
  await waitForServer()

  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
  const errors = []
  const badResponses = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', response => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`)
  })
  page.on('requestfailed', request => {
    errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`)
  })

  assert((await page.goto(origin, { waitUntil: 'networkidle' }))?.ok(), '首页请求失败')
  assert.equal(page.url(), origin)
  await page.locator('.VPHero').waitFor()
  const favicon = await page.locator('link[rel="icon"]').getAttribute('href')
  assert.equal(new URL(favicon, origin).href, url('logo.svg'), 'favicon 未使用当前 base')
  const logo = await page.request.get(url('logo.svg'))
  assert(logo.ok() && logo.headers()['content-type']?.includes('image/svg+xml'), 'logo 资源请求失败')
  assert(await page.locator('.VPHero img').evaluate(image => image.complete && image.naturalWidth > 0), '首页 logo 未加载')
  await page.screenshot({ path: new URL('home-desktop.png', outputDir).pathname, fullPage: true })

  await page.getByRole('link', { name: '快速开始', exact: true }).click()
  await page.waitForURL(url('guide/getting-started'))
  await page.locator('h1').filter({ hasText: '安装与快速开始' }).waitFor()

  await page.getByRole('link', { name: '功能', exact: true }).click()
  await page.waitForURL(url('advanced/virtual-list'))
  await page.locator('h1').filter({ hasText: '虚拟列表' }).waitFor()
  await page.screenshot({ path: new URL('virtual-list-desktop.png', outputDir).pathname, fullPage: true })

  await page.getByRole('link', { name: 'API', exact: true }).click()
  await page.waitForURL(url('api/props'))
  await page.locator('h1').filter({ hasText: 'Props' }).waitFor()
  await page.locator('table').first().waitFor()
  assert(await page.locator('table').count() >= 5, 'Props 表格未完整渲染')

  assert((await page.goto(url('guide/getting-started'), { waitUntil: 'networkidle' }))?.ok(), '深层文档直达请求失败')
  assert.equal(page.url(), url('guide/getting-started'))
  await page.locator('h1').filter({ hasText: '安装与快速开始' }).waitFor()
  assert((await page.reload({ waitUntil: 'networkidle' }))?.ok(), '深层文档刷新请求失败')
  assert.equal(page.url(), url('guide/getting-started'))
  await page.locator('h1').filter({ hasText: '安装与快速开始' }).waitFor()

  await page.getByRole('button', { name: '搜索文档', exact: true }).click()
  await page.getByRole('searchbox').fill('虚拟列表')
  const searchResult = page.locator(`.VPLocalSearchBox a.result[href^="${base}advanced/virtual-list"]`).first()
  await searchResult.waitFor()
  const searchUrl = new URL(await searchResult.getAttribute('href'), origin)
  assert.equal(searchUrl.origin, serverOrigin)
  assert.equal(searchUrl.pathname, new URL(url('advanced/virtual-list')).pathname, '搜索结果未使用当前 base')
  await searchResult.click()
  await page.waitForURL(searchUrl.href)
  await page.locator('h1').filter({ hasText: '虚拟列表' }).waitFor()
  await page.locator('.VPLocalSearchBox').waitFor({ state: 'hidden' })

  await page.getByRole('switch').first().click()
  await page.waitForFunction(() => document.documentElement.classList.contains('dark'))
  assert(await page.locator('html.dark').count(), '深色主题切换失败')
  await page.getByRole('switch').first().click()
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'))
  assert.equal(await page.locator('html.dark').count(), 0, '浅色主题切换失败')

  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(origin, { waitUntil: 'networkidle' })
  await page.screenshot({ path: new URL('home-mobile.png', outputDir).pathname, fullPage: true })
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }))
  assert(dimensions.content <= dimensions.viewport, `移动端存在横向滚动：${JSON.stringify(dimensions)}`)
  assert.equal(errors.length + badResponses.length, 0, JSON.stringify({ errors, badResponses }, null, 2))
  result = { ok: true, base, headless: true, errors, badResponses, mobile: dimensions }
}
catch (error) {
  failures.push(error)
}
finally {
  try {
    await browser?.close()
  }
  catch (error) {
    failures.push(new Error('测试浏览器关闭失败', { cause: error }))
  }
  if (server) {
    try {
      stopServer('SIGTERM')
      if (!await waitForExit(5000)) {
        stopServer('SIGKILL')
        if (!await waitForExit(2000)) throw new Error('文档预览服务收到 SIGKILL 后仍未退出')
        throw new Error('文档预览服务未及时退出，已使用 SIGKILL 清理')
      }
    }
    catch (error) {
      failures.push(new Error('文档预览服务清理失败', { cause: error }))
    }
  }
}

if (failures.length) throw new AggregateError(failures, '文档验收失败')
console.log(JSON.stringify(result, null, 2))
