import { beforeEach, describe, expect, it, vi } from 'vitest'
import { zPagingWevuDefaults } from '../../src/components/z-paging-wevu/props'
import { createPagingController } from '../../src/components/z-paging-wevu/types'
import { wxsBridge } from '../../src/components/z-paging-wevu/wxs-bridge'

function createMockApi() {
  return {
    reload: vi.fn(() => Promise.resolve({ totalList: [], noMore: false })),
    refresh: vi.fn(() => Promise.resolve({ totalList: [], noMore: false })),
    complete: vi.fn(() => Promise.resolve({ totalList: [], noMore: false })),
    completeByTotal: vi.fn(() => Promise.resolve({ totalList: [], noMore: false })),
    scrollToTop: vi.fn(),
    scrollToBottom: vi.fn(),
    doLoadMore: vi.fn(),
  }
}

describe('createPagingController', () => {
  it('未绑定时调用不抛错并返回空结果', async () => {
    const controller = createPagingController()

    await expect(controller.reload()).resolves.toEqual({ totalList: [], noMore: false })
    expect(() => controller.scrollToTop()).not.toThrow()
  })

  it('绑定后把调用转发给组件实例', async () => {
    const controller = createPagingController()
    const api = createMockApi()
    controller.bind(api as any)

    await controller.reload(true)
    await controller.complete([{ id: 1 }], true)
    controller.scrollToTop(false)
    controller.doLoadMore('click')

    expect(api.reload).toHaveBeenCalledWith(true)
    expect(api.complete).toHaveBeenCalledWith([{ id: 1 }], true)
    expect(api.scrollToTop).toHaveBeenCalledWith(false)
    expect(api.doLoadMore).toHaveBeenCalledWith('click')
  })

  it('解绑后回到空实现', async () => {
    const controller = createPagingController()
    const api = createMockApi()
    controller.bind(api as any)
    await controller.reload()

    controller.unbind(api as any)
    await controller.reload()

    expect(api.reload).toHaveBeenCalledTimes(1)
  })

  it('解绑非当前实例不影响绑定关系', async () => {
    const controller = createPagingController()
    const api = createMockApi()
    const other = createMockApi()

    controller.bind(api as any)
    controller.unbind(other as any)
    await controller.reload()

    expect(api.reload).toHaveBeenCalledTimes(1)
  })

  it('value 指向自身，便于模板里按 ref 语义传参', () => {
    const controller = createPagingController()
    expect(controller.value).toBe(controller)
  })

  it('重新绑定会替换目标实例', async () => {
    const controller = createPagingController()
    const first = createMockApi()
    const second = createMockApi()

    controller.bind(first as any)
    controller.bind(second as any)
    await controller.reload()

    expect(first.reload).not.toHaveBeenCalled()
    expect(second.reload).toHaveBeenCalledTimes(1)
  })
})

describe('wxsBridge', () => {
  beforeEach(() => {
    wxsBridge.unregister('owner-test')
  })

  it('按 ownerId 转发 WXS 事件', () => {
    const handlers = { scrollBounce: vi.fn(), pullStatus: vi.fn() }
    wxsBridge.register('owner-test', handlers)

    wxsBridge.scrollBounce({ ownerId: 'owner-test', bounce: true })
    wxsBridge.pullStatus({ ownerId: 'owner-test', status: 'loading', height: 40, dy: 60 })

    expect(handlers.scrollBounce).toHaveBeenCalledWith({ ownerId: 'owner-test', bounce: true })
    expect(handlers.pullStatus).toHaveBeenCalledWith({
      ownerId: 'owner-test',
      status: 'loading',
      height: 40,
      dy: 60,
    })
  })

  it('注销后不再转发且不抛错', () => {
    const handlers = { scrollBounce: vi.fn(), pullStatus: vi.fn() }
    wxsBridge.register('owner-test', handlers)
    wxsBridge.unregister('owner-test')

    expect(() => wxsBridge.scrollBounce({ ownerId: 'owner-test' })).not.toThrow()
    expect(handlers.scrollBounce).not.toHaveBeenCalled()
  })

  it('未知 ownerId 调用被忽略', () => {
    expect(() => wxsBridge.pullStatus({
      ownerId: 'not-registered',
      status: 'default',
      height: 0,
      dy: 0,
    })).not.toThrow()
  })
})

describe('zPagingWevuDefaults', () => {
  it('分页默认值对齐 z-paging 心智模型', () => {
    expect(zPagingWevuDefaults.defaultPageNo).toBe(1)
    expect(zPagingWevuDefaults.defaultPageSize).toBe(10)
    expect(zPagingWevuDefaults.auto).toBe(true)
    expect(zPagingWevuDefaults.concat).toBe(true)
  })

  it('数组型默认值使用工厂函数，避免实例间共享引用', () => {
    expect(typeof zPagingWevuDefaults.modelValue).toBe('function')
    const first = zPagingWevuDefaults.modelValue()
    const second = zPagingWevuDefaults.modelValue()

    expect(first).toEqual([])
    expect(first).not.toBe(second)
  })
})
