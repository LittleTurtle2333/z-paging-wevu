import type { MiniProgram } from '@weapp-vite/miniprogram-automator'
import { Launcher } from '@weapp-vite/miniprogram-automator'
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest'

declare module 'vitest' {
  interface ProvidedContext {
    devtoolsAppId: string
    devtoolsProjectPath: string
    devtoolsCliPath: string
  }
}

const appId = inject('devtoolsAppId')

const COMMON_DEMO = '/pages/common-demo/common-demo'
/** demo 的模拟请求固定延迟 500ms，留出渲染余量 */
const SETTLE = 2500

let miniProgram: MiniProgram

// 没有 appid 时 DevTools 的 /v2/auto 会返回 APPID_ERROR，这里直接跳过而不是给出误导性失败
describe.skipIf(!appId)('pages/common-demo（真实 DevTools）', () => {
  beforeAll(async () => {
    const launcher = new Launcher()
    miniProgram = await launcher.launch({
      platform: 'wechat',
      projectPath: inject('devtoolsProjectPath'),
      cliPath: inject('devtoolsCliPath'),
    })
  })

  afterAll(async () => {
    await miniProgram?.close()
  })

  it('首屏自动加载第一页 10 条数据', async () => {
    const page = await miniProgram.reLaunch(COMMON_DEMO)
    await page.waitFor(SETTLE)

    const list = await page.data('dataList')
    expect(Array.isArray(list)).toBe(true)
    expect(list).toHaveLength(10)
    expect(list[0].detail).toBe('测试信息1')
  })

  it('切换 tab 触发 reload，列表替换为新分页数据', async () => {
    const page = await miniProgram.reLaunch(COMMON_DEMO)
    await page.waitFor(SETTLE)

    const tabs = await page.$$('.demo-tabs__item')
    expect(tabs.length).toBe(4)

    await tabs[1].tap()
    await page.waitFor(SETTLE)

    const list = await page.data('dataList')
    expect(list).toHaveLength(10)
    expect(list[0].detail).toBe('测试信息2')
  })

  it('触底后追加下一页数据', async () => {
    const page = await miniProgram.reLaunch(COMMON_DEMO)
    await page.waitFor(SETTLE)

    expect(await page.data('dataList')).toHaveLength(10)

    // 直接触发 scroll-view 的 scrolltolower，等价于用户触底
    const scroll = await page.$('.z-paging-wevu__scroll')
    expect(scroll).toBeTruthy()
    await scroll!.trigger('scrolltolower')

    await page.waitFor(SETTLE)
    const list = await page.data('dataList')
    expect(list.length).toBeGreaterThan(10)
  })

  it('持续触底加载到底后停止请求并置为 noMore', async () => {
    const page = await miniProgram.reLaunch(COMMON_DEMO)
    await page.waitFor(SETTLE)

    // demo 总数据 24 条，每页 10 条；多触发两次确保越过末页
    for (let i = 0; i < 3; i++) {
      const scroll = await page.$('.z-paging-wevu__scroll')
      await scroll!.trigger('scrolltolower')
      await page.waitFor(SETTLE)
    }

    const list = await page.data('dataList')
    expect(list).toHaveLength(24)

    // 已经到底：继续触底不应再追加，也不应清空已有数据
    const scrollAfterEnd = await page.$('.z-paging-wevu__scroll')
    await scrollAfterEnd!.trigger('scrolltolower')
    await page.waitFor(SETTLE)
    expect(await page.data('dataList')).toHaveLength(24)
  })
})
