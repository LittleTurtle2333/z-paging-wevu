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

function scrollNode(screen: { queryAllByAttribute: (name: string, value?: RegExp) => any[] }) {
  const nodes = screen.queryAllByAttribute('class', /z-paging-wevu__scroll/)
  expect(nodes.length).toBeGreaterThan(0)
  return nodes[0]
}

describe('ZPagingWevu 组件', () => {
  it('关闭 auto 时不发 query，仍渲染刷新层与末尾哨兵', async () => {
    const comp = await project.renderComponent('components/z-paging-wevu/index', {
      properties: { auto: false },
      events: ['query', 'reload'],
    })

    expect(comp.emitted('query')).toEqual([])
    expect(comp.emitted('reload')).toEqual([])

    scrollNode(comp.screen)
    expect(comp.screen.queryAllByAttribute('class', /z-paging-wevu__refresher/).length).toBeGreaterThan(0)
    expect(comp.screen.queryAllByAttribute('class', /z-paging-wevu__sentinel/).length).toBeGreaterThan(0)
    expect(comp.diagnostics()).toEqual([])
  })

  it('属性变更会映射到产物节点属性', async () => {
    const comp = await project.renderComponent('components/z-paging-wevu/index', {
      properties: { auto: false },
    })

    expect(scrollNode(comp.screen).getAttribute('lower-threshold')).toBe('50')
    expect(scrollNode(comp.screen).getAttribute('refresher-threshold')).toBe('40')

    await comp.setProperties({ 'lower-threshold': 120, 'refresher-threshold': 80 })

    expect(scrollNode(comp.screen).getAttribute('lower-threshold')).toBe('120')
    expect(scrollNode(comp.screen).getAttribute('refresher-threshold')).toBe('80')
  })

  it('卸载后释放渲染会话且不产生诊断信息', async () => {
    const comp = await project.renderComponent('components/z-paging-wevu/index', {
      properties: { auto: false },
    })

    scrollNode(comp.screen)
    await comp.unmount()

    expect(comp.diagnostics()).toEqual([])
  })
})
