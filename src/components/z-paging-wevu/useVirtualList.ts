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
  const measuredHeight = ref(0)
  const heights = new Map<number, number>()

  function defaultHeight() {
    return Math.max(
      1,
      vpPx(options.getFixedCellHeight(), 0) || measuredHeight.value || 60,
    )
  }

  function heightAt(index: number) {
    if (options.getCellHeightMode() === 'fixed') {
      return defaultHeight()
    }
    return heights.get(index) || measuredHeight.value || defaultHeight()
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
      measuredHeight.value = height
      heights.set(index, height)
      update()
    }
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
    didUpdateVirtualListCell,
    didDeleteVirtualListCell,
    doInsertVirtualListItem,
    getCellOffset,
  }
}
