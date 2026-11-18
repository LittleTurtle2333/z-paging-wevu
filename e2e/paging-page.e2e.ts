import type { MiniProgramTestProject } from '@mpcore/test'
import { createTestProject } from '@mpcore/test'
import { afterAll, beforeAll, describe, expect, inject, it } from 'vitest'

declare module 'vitest' {
  interface ProvidedContext {
    mpcoreArtifact: { projectPath: string }
  }
}

let project: MiniProgramTestProject

beforeAll(() => {
  project = createTestProject({ artifact: inject('mpcoreArtifact') })
})

afterAll(async () => {
  await project?.close()
})

/**
 * 页面级断言只覆盖「产物结构与公开契约」。
 *
 * 说明：wevu 的模板事件走 `__weapp_vite_inline` 内联分发，headless 运行时不会执行这条
 * 分发链，因此组件 emit 到页面（例如 `@query`）无法在 mpcore 里闭环。分页数据流转
 * 由 `scripts/refresher*.test.mjs` 直接运行源码覆盖，这里不重复断言。
 */
describe('pages/common-demo 普通模式', () => {
  it('挂载后渲染出分页组件与滚动容器', async () => {
    const page = await project.renderPage('/pages/common-demo/common-demo')

    const host = page.screen.getByAttribute('id', 'common-paging')
    expect(host.tagName).toBe('page')

    const scroll = page.screen.getByAttribute('class', /z-paging-wevu__scroll/)
    expect(scroll.getAttribute('scroll-y')).toBe('true')
    expect(scroll.getAttribute('refresher-enabled')).toBe('false')
    expect(scroll.getAttribute('lower-threshold')).toBe('50')

    expect(page.diagnostics()).toEqual([])

    await page.close()
  })

  it('#top 插槽内容渲染在固定区域内', async () => {
    const page = await project.renderPage('/pages/common-demo/common-demo')

    // Demo 用 tabs 占据 #top 插槽，四个 tab 文案都应出现在逻辑树中
    expect(page.screen.getByText('测试1').textContent).toBe('测试1')
    expect(page.screen.getByText('测试2')).toBeTruthy()
    expect(page.screen.getByText('测试4')).toBeTruthy()

    expect(page.screen.getByAttribute('class', /z-paging-wevu__top/)).toBeTruthy()

    await page.close()
  })

  it('组件对外暴露 z-paging 兼容的 API 方法', async () => {
    const page = await project.renderPage('/pages/common-demo/common-demo')

    const scope = await page.page.selectComponent('#common-paging')
    expect(scope).toBeTruthy()

    const snapshot = await scope!.snapshot()
    expect(snapshot?.type).toBe('component')

    // 这些方法名构成 z-paging 迁移契约，改名属于破坏性变更
    expect(snapshot!.methods).toEqual(
      expect.arrayContaining([
        'reload',
        'refresh',
        'complete',
        'completeByKey',
        'completeByTotal',
        'completeByNoMore',
        'completeByError',
        'scrollToTop',
        'scrollToBottom',
      ]),
    )

    await page.close()
  })
})

describe('pages/virtual-list-demo 虚拟列表模式', () => {
  it('渲染虚拟列表容器与刷新层', async () => {
    const page = await project.renderPage('/pages/virtual-list-demo/virtual-list-demo')

    expect(page.screen.queryAllByAttribute('class', /z-paging-wevu__scroll/).length).toBeGreaterThan(0)
    expect(page.screen.queryAllByAttribute('class', /z-paging-wevu__refresher/).length).toBeGreaterThan(0)
    expect(page.screen.queryAllByAttribute('class', /z-paging-wevu__sentinel/).length).toBeGreaterThan(0)
    expect(page.diagnostics()).toEqual([])

    await page.close()
  })
})

describe('pages/swiper-demo 轮播分页', () => {
  it('渲染 swiper 容器与左右滚动区', async () => {
    const page = await project.renderPage('/pages/swiper-demo/swiper-demo')

    expect(page.screen.queryAllByAttribute('class', /zp-swiper-super/).length).toBeGreaterThan(0)
    // 左右两个列表容器由 z-paging-swiper 提供
    expect(page.screen.queryAllByAttribute('class', /zp-swiper-left/).length).toBeGreaterThan(0)
    expect(page.screen.queryAllByAttribute('class', /zp-swiper-right/).length).toBeGreaterThan(0)
    expect(page.diagnostics()).toEqual([])

    await page.close()
  })
})
