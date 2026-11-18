import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'wevu'
import { useVirtualList } from '../../src/components/z-paging-wevu/useVirtualList'

/** 取 mock 的最后一次调用（lib 基线为 ES2020，不能用 Array.prototype.at） */
function lastCall(mock: { mock: { calls: unknown[][] } }) {
  const { calls } = mock.mock
  return calls[calls.length - 1]
}

interface HarnessOptions {
  length?: number
  enabled?: boolean
  mode?: 'fixed' | 'dynamic'
  fixedHeight?: number | string
  preloadPage?: number
  columns?: number
  viewport?: number
}

function createHarness(options: HarnessOptions = {}) {
  const list = ref<unknown[]>(
    Array.from({ length: options.length ?? 100 }, (_, index) => ({ id: index })),
  )
  const scrollTop = ref(0)
  const state = {
    enabled: options.enabled ?? true,
    mode: options.mode ?? ('fixed' as const),
    fixedHeight: options.fixedHeight ?? 100,
    preloadPage: options.preloadPage ?? 1,
    columns: options.columns ?? 1,
    viewport: options.viewport ?? 500,
  }
  const onRenderChange = vi.fn()
  const onPlaceholderTopHeight = vi.fn()
  const onListChange = vi.fn()

  const virtual = useVirtualList({
    list,
    scrollTop: scrollTop as any,
    getEnabled: () => state.enabled,
    getCellHeightMode: () => state.mode,
    getFixedCellHeight: () => state.fixedHeight,
    getPreloadPage: () => state.preloadPage,
    getColumns: () => state.columns,
    getViewportHeight: () => state.viewport,
    onListChange,
    onRenderChange,
    onPlaceholderTopHeight,
  })

  return { list, scrollTop, state, virtual, onRenderChange, onPlaceholderTopHeight, onListChange }
}

describe('useVirtualList 固定高度', () => {
  it('顶部渲染首屏 + 预加载范围，剩余部分作为底部占位', () => {
    const { virtual } = createHarness()
    virtual.update()

    // viewport 500 + preload 500 → 1000px，每行 100px → 11 个 cell
    expect(virtual.renderList.value).toHaveLength(11)
    expect(virtual.renderList.value[0]).toMatchObject({ index: 0, zp_index: 0 })
    expect(virtual.placeholderTop.value).toBe(0)
    expect(virtual.placeholderBottom.value).toBe(8900)
  })

  it('滚动到中段时按偏移量计算起始 index 与顶部占位', () => {
    const { virtual, scrollTop } = createHarness()
    scrollTop.value = 2000
    virtual.update()

    // fromY = 2000 - 500 = 1500 → 起始 15；toY = 2000 + 500 + 500 = 3000 → 结束 31 + 1
    expect(virtual.renderList.value[0]).toMatchObject({ index: 15 })
    expect(virtual.placeholderTop.value).toBe(1500)
    expect(virtual.placeholderBottom.value).toBe(6900)
  })

  it('输出给外部列表的 zp_index 与源索引一致', () => {
    const { virtual, onRenderChange, scrollTop } = createHarness()
    // fromY = 1200 - 500 = 700 → 起始 7
    scrollTop.value = 1200
    virtual.update()

    expect(onRenderChange).toHaveBeenCalled()
    const emitted = lastCall(onRenderChange)[0] as Array<Record<string, unknown>>
    expect(emitted[0].zp_index).toBe(7)
    expect(emitted[0].id).toBe(7)
  })

  it('非对象元素包装为 value 字段', () => {
    const { virtual, list, onRenderChange } = createHarness({ length: 10 })
    list.value = ['a', 'b', 'c']
    virtual.update()

    const emitted = lastCall(onRenderChange)[0] as Array<Record<string, unknown>>
    expect(emitted[0]).toEqual({ value: 'a', zp_index: 0 })
  })

  it('多列时起始索引按整行对齐', () => {
    const { virtual, scrollTop } = createHarness({ columns: 2 })
    scrollTop.value = 1000
    virtual.update()

    // floor(500 / 100) * 2 = 10
    expect(virtual.renderList.value[0]).toMatchObject({ index: 10 })
  })
})

describe('useVirtualList 开关', () => {
  it('关闭后清空渲染列表与占位', () => {
    const h = createHarness()
    h.virtual.update()
    expect(h.virtual.renderList.value.length).toBeGreaterThan(0)

    h.state.enabled = false
    h.virtual.update()

    expect(h.virtual.renderList.value).toHaveLength(0)
    expect(h.virtual.placeholderTop.value).toBe(0)
    expect(h.virtual.placeholderBottom.value).toBe(0)
    expect(lastCall(h.onRenderChange)[0]).toEqual([])
  })

  it('已在关闭状态时重复 update 不再回调', () => {
    const h = createHarness({ enabled: false })
    h.virtual.update()
    h.virtual.update()
    expect(h.onRenderChange).not.toHaveBeenCalled()
  })
})

describe('useVirtualList 动态高度', () => {
  it('未测量时用默认 60px 估值', () => {
    const { virtual } = createHarness({ mode: 'dynamic', fixedHeight: 0 })
    virtual.update()

    // toY = 500 + 500 = 1000，每行 60 → 约 17 行
    expect(virtual.renderList.value.length).toBeGreaterThan(10)
    expect(virtual.placeholderBottom.value).toBeGreaterThan(0)
  })

  it('setCellHeights 只接受首次测量结果', () => {
    const { virtual } = createHarness({ mode: 'dynamic' })

    expect(virtual.setCellHeights([{ index: 0, height: 200 }])).toBe(true)
    // 同一 index 重复测量必须被忽略，否则占位会反复重算导致抖动
    expect(virtual.setCellHeights([{ index: 0, height: 300 }])).toBe(false)
    expect(virtual.hasCellHeight(0)).toBe(true)
  })

  it('非法高度被忽略', () => {
    const { virtual } = createHarness({ mode: 'dynamic' })
    expect(virtual.setCellHeights([{ index: 1, height: 0 }])).toBe(false)
    expect(virtual.hasCellHeight(1)).toBe(false)
  })

  it('已测量的高度参与位置计算', () => {
    const { virtual, scrollTop } = createHarness({ mode: 'dynamic' })
    virtual.setCellHeights([{ index: 0, height: 400 }])

    expect(virtual.getCellOffset(1)).toBe(400)

    // fromY = 1000 - 500 = 500 > 首行高度 400，起始行前移到 index 1，顶部占位 400
    scrollTop.value = 1000
    virtual.update()
    expect(virtual.placeholderTop.value).toBe(400)
    expect(virtual.renderList.value[0]).toMatchObject({ index: 1 })
  })
})

describe('useVirtualList 数据变动', () => {
  it('删除 cell 后后续高度前移一位', () => {
    const { virtual } = createHarness({ mode: 'dynamic' })
    virtual.setCellHeights([
      { index: 0, height: 100 },
      { index: 1, height: 200 },
      { index: 2, height: 300 },
    ])
    expect(virtual.hasCellHeight(1)).toBe(true)

    virtual.didDeleteVirtualListCell(1)

    expect(virtual.hasCellHeight(2)).toBe(false)
    // 原 index 2 的高度前移到 1
    expect(virtual.getCellOffset(2)).toBe(100 + 300)
  })

  it('插入数据通过 onListChange 回写并落在指定位置', () => {
    const { virtual, onListChange } = createHarness({ length: 3 })
    virtual.doInsertVirtualListItem({ id: 'new' }, 1)

    const next = lastCall(onListChange)[0] as Array<{ id: unknown }>
    expect(next).toHaveLength(4)
    expect(next[1]).toEqual({ id: 'new' })
  })

  it('插入位置越界时收敛到边界', () => {
    const { virtual, onListChange } = createHarness({ length: 2 })
    virtual.doInsertVirtualListItem('tail', 99)

    const next = lastCall(onListChange)[0] as unknown[]
    expect(next[next.length - 1]).toBe('tail')
  })
})

describe('useVirtualList 其他契约', () => {
  let harness: ReturnType<typeof createHarness>

  beforeEach(() => {
    harness = createHarness()
  })

  it('didUpdateVirtualListCell 带高度时记录测量值', () => {
    harness.virtual.didUpdateVirtualListCell(2, 150)
    expect(harness.virtual.hasCellHeight(2)).toBe(true)
  })

  it('getCellOffset 按行累加高度', () => {
    expect(harness.virtual.getCellOffset(3)).toBe(300)
    expect(harness.virtual.getCellOffset(0)).toBe(0)
  })
})
