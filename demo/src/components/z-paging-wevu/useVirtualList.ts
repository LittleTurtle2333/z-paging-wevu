import { ref, watch } from 'wevu'
import { vpNumber, vpPx } from './utils'

interface VpRef<T> {
  value: T
}

export interface VpVirtualCell {
  item: unknown
  index: number
  zp_index: number
}

interface VpVirtualOptions {
  list: VpRef<unknown[]>
  scrollTop: VpRef<number>
  getEnabled: () => boolean
  getCellHeightMode: () => 'fixed' | 'dynamic'
  getFixedCellHeight: () => number | string
  getPreloadPage: () => number | string
  getColumns: () => number | string
  getViewportHeight: () => number
  onListChange: (list: unknown[]) => void
  onRenderChange: (list: Array<Record<string, unknown>>) => void
  onPlaceholderTopHeight: (height: number) => void
}

export function useVirtualList(options: VpVirtualOptions) {
  const renderList = ref<VpVirtualCell[]>([])
  const placeholderTop = ref(0)
  const placeholderBottom = ref(0)
  const heights = new Map<number, number>()

  function defaultHeight() {
    return Math.max(1, vpPx(options.getFixedCellHeight(), 0) || 60)
  }

  /**
   * 动态高度模式下，未渲染/未测量的 cell 用「已测量高度的均值」估算。
   * 之前用「最后一次测量的高度」估算，首屏或跨段滚动时偏差极大，
   * 会导致占位高度算错、列表位置跳变。
   */
  function averageHeight() {
    if (!heights.size) {
      return defaultHeight()
    }
    let sum = 0
    heights.forEach((height) => {
      sum += height
    })
    return Math.max(1, sum / heights.size)
  }

  function heightAt(index: number) {
    if (options.getCellHeightMode() === 'fixed') {
      return defaultHeight()
    }
    return heights.get(index) ?? averageHeight()
  }

  function emitRenderList() {
    const publicList = renderList.value.map((cell) => {
      if (cell.item && typeof cell.item === 'object') {
        return {
          ...(cell.item as Record<string, unknown>),
          zp_index: cell.index,
        }
      }
      return { value: cell.item, zp_index: cell.index }
    })
    options.onRenderChange(publicList)
  }

  function update() {
    if (!options.getEnabled()) {
      if (renderList.value.length) {
        renderList.value = []
        placeholderTop.value = 0
        placeholderBottom.value = 0
        emitRenderList()
      }
      return
    }

    const source = options.list.value
    const viewport = Math.max(1, options.getViewportHeight())
    const preload
      = Math.max(1, vpNumber(options.getPreloadPage(), 2)) * viewport
    const columns = Math.max(1, Math.floor(vpNumber(options.getColumns(), 1)))
    const fromY = Math.max(0, options.scrollTop.value - preload)
    const toY = options.scrollTop.value + viewport + preload

    let start = 0
    let end = source.length
    let top = 0
    let bottom = 0

    if (options.getCellHeightMode() === 'fixed') {
      const height = defaultHeight()
      start = Math.min(source.length, Math.floor(fromY / height) * columns)
      end = Math.min(
        source.length,
        Math.ceil(toY / height) * columns + columns,
      )
      top = Math.floor(start / columns) * height
      bottom = Math.ceil(Math.max(0, source.length - end) / columns) * height
    }
    else {
      let offset = 0
      let foundStart = false
      top = 0
      for (let index = 0; index < source.length; index += columns) {
        const rowHeight = heightAt(index)
        if (!foundStart && offset + rowHeight >= fromY) {
          start = index
          top = offset
          foundStart = true
        }
        if (offset >= toY) {
          end = index
          break
        }
        offset += rowHeight
      }
      const total = source.reduce<number>(
        (sum, _, index) => sum + (index % columns === 0 ? heightAt(index) : 0),
        0,
      )
      const endOffset = source
        .slice(0, end)
        .reduce<number>(
          (sum, _, index) =>
            sum + (index % columns === 0 ? heightAt(index) : 0),
          0,
        )
      bottom = Math.max(0, total - endOffset)
    }

    renderList.value = source.slice(start, end).map((item, index) => {
      const actualIndex = start + index
      return { item, index: actualIndex, zp_index: actualIndex }
    })
    placeholderTop.value = Math.max(0, top)
    placeholderBottom.value = Math.max(0, bottom)
    options.onPlaceholderTopHeight(placeholderTop.value)
    emitRenderList()
  }

  function setCellHeight(index: number, height: number) {
    if (height > 0) {
      heights.set(index, height)
      update()
    }
  }

  /**
   * 批量写入测量结果（一次 SelectorQuery 量完当前所有渲染 cell）。
   *
   * 每个 index 只记录一次：占位高度会跟着测量结果变化，
   * 一旦允许覆盖已有高度，就会出现「测量 → 重算占位 → 位置变化 → 再测量得到新值」
   * 的死循环，表现为列表原地抖动。已测量过的 cell 直接跳过。
   */
  function setCellHeights(entries: Array<{ index: number, height: number }>) {
    let changed = false
    entries.forEach(({ index, height }) => {
      if (height <= 0 || heights.has(index)) {
        return
      }
      heights.set(index, height)
      changed = true
    })
    if (changed) {
      update()
    }
    return changed
  }

  function hasCellHeight(index: number) {
    return heights.has(index)
  }

  function didUpdateVirtualListCell(index: number, height?: number) {
    if (height != null) {
      setCellHeight(index, height)
    }
    else {
      update()
    }
  }

  function didDeleteVirtualListCell(index: number) {
    heights.delete(index)
    const next = new Map<number, number>()
    heights.forEach((height, key) => {
      next.set(key > index ? key - 1 : key, height)
    })
    heights.clear()
    next.forEach((height, key) => heights.set(key, height))
    update()
  }

  function doInsertVirtualListItem(data: unknown, index: number) {
    const next = [...options.list.value]
    next.splice(Math.max(0, Math.min(index, next.length)), 0, data)
    options.onListChange(next)
    update()
  }

  function getCellOffset(index: number) {
    const columns = Math.max(1, Math.floor(vpNumber(options.getColumns(), 1)))
    let offset = 0
    for (let current = 0; current < index; current += columns) {
      offset += heightAt(current)
    }
    return offset
  }

  watch(() => options.list.value, update, { deep: false })
  watch(() => options.scrollTop.value, update)
  watch(options.getEnabled, update)
  watch(options.getCellHeightMode, update)
  watch(options.getFixedCellHeight, update)

  return {
    renderList,
    placeholderTop,
    placeholderBottom,
    update,
    setCellHeight,
    setCellHeights,
    hasCellHeight,
    didUpdateVirtualListCell,
    didDeleteVirtualListCell,
    doInsertVirtualListItem,
    getCellOffset,
  }
}
