/**
 * 页面滚动模式下的分页接管（等价 z-paging 的 useZPaging hook）。
 *
 * 用法（`fixed=false` 时必须调用，否则触底加载与下拉刷新不会触发）：
 * ```ts
 * const paging = createPagingController()
 * usePagePaging(paging)
 * ```
 * 页面 json 需要 `enablePullDownRefresh: true` 才能下拉刷新。
 */
import type { ZPagingWevuApi, ZPagingWevuController } from '@/components/z-paging-wevu/types'
import { onPageScroll, onPullDownRefresh, onReachBottom } from 'wevu'

type PagingTarget = ZPagingWevuController | { value: ZPagingWevuApi | null } | null | undefined

export interface UsePagePagingOptions {
  /** 下拉刷新结束后是否自动收起原生刷新器，默认 true */
  stopPullDownRefresh?: boolean
  /** 是否接管页面滚动（仅 back-to-top 类场景需要），默认 true */
  pageScroll?: boolean
}

function resolvePaging(target: PagingTarget): ZPagingWevuApi | null {
  if (!target) {
    return null
  }
  const maybeRef = target as { value?: ZPagingWevuApi | null }
  return maybeRef.value ?? (target as ZPagingWevuApi)
}

export function usePagePaging(target: PagingTarget, options: UsePagePagingOptions = {}) {
  const { stopPullDownRefresh = true, pageScroll = true } = options

  onPullDownRefresh(() => {
    const api = resolvePaging(target)
    const finish = () => {
      if (stopPullDownRefresh && typeof wx.stopPullDownRefresh === 'function') {
        wx.stopPullDownRefresh()
      }
    }
    if (!api) {
      finish()
      return
    }
    api.reload(true).finally(finish)
  })

  onReachBottom(() => {
    resolvePaging(target)?.pageReachBottom()
  })

  if (pageScroll) {
    onPageScroll((event) => {
      resolvePaging(target)?.updatePageScrollTop(event?.scrollTop ?? 0)
    })
  }
}

/** 与旧项目 `useZPaging` 保持同名，方便逐页平移 */
export const useZPaging = usePagePaging
