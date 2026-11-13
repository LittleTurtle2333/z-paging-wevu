import type { ZPagingWevuLocale, ZPagingWevuLocaleInput } from './locale'
import { getPagingLocale } from './locale'

export type ZPagingWevuQueryFrom
  = 'user-pull-down' | 'reload' | 'refresh' | 'load-more'
export type ZPagingWevuLoadMoreType = 'click' | 'toBottom'
export type ZPagingWevuLoadingStatus = 'default' | 'loading' | 'no-more' | 'fail'
export type ZPagingWevuRefresherStatus
  = 'default' | 'release-to-refresh' | 'loading' | 'complete' | 'go-f2'

export interface ZPagingWevuResult<T = unknown> {
  totalList: T[]
  noMore: boolean
}

export interface ZPagingWevuApi {
  reload: (animate?: boolean) => Promise<ZPagingWevuResult>
  refresh: () => Promise<ZPagingWevuResult>
  refreshToPage: (page: number) => Promise<ZPagingWevuResult>
  complete: (data?: unknown, success?: boolean) => Promise<ZPagingWevuResult>
  completeByKey: (
    data: unknown,
    key?: unknown,
    success?: boolean,
  ) => Promise<ZPagingWevuResult>
  completeByNoMore: (
    data: unknown,
    noMore: boolean,
    success?: boolean,
  ) => Promise<ZPagingWevuResult>
  completeByTotal: (
    data: unknown,
    total?: number,
    success?: boolean,
  ) => Promise<ZPagingWevuResult>
  completeByError: (message?: string) => Promise<ZPagingWevuResult>
  setLocalPaging: (data: unknown, success?: boolean) => Promise<ZPagingWevuResult>
  addDataFromTop: (
    data: unknown,
    scrollToTop?: boolean,
    animate?: boolean,
  ) => void
  clean: () => void
  clear: () => void

  endRefresh: () => void
  updateCustomRefresherHeight: () => void
  closeF2: () => void
  doLoadMore: (type?: ZPagingWevuLoadMoreType) => void
  pageReachBottom: () => void

  scrollToTop: (animate?: boolean) => void
  scrollToBottom: (animate?: boolean) => void
  scrollToY: (y: number, offset?: number, animate?: boolean) => void
  scrollToX: (x: number, offset?: number, animate?: boolean) => void
  scrollIntoViewById: (id: string, offset?: number, animate?: boolean) => void
  scrollIntoViewByIndex: (
    index: number,
    offset?: number,
    animate?: boolean,
  ) => void
  scrollIntoViewByNodeTop: (
    top: number,
    offset?: number,
    animate?: boolean,
  ) => void
  scrollIntoViewByView: (
    view: string,
    offset?: number,
    animate?: boolean,
  ) => void

  doInsertVirtualListItem: (data: unknown, index: number) => void
  didUpdateVirtualListCell: (index: number) => void
  didDeleteVirtualListCell: (index: number) => void
  updateVirtualListRender: () => void

  doChatRecordLoadMore: () => void
  addChatRecordData: (
    data: unknown,
    scrollToBottom?: boolean,
    animate?: boolean,
  ) => void
  /** 切换组件内置文案语言（'auto' 为跟随系统） */
  setLocale: (locale: ZPagingWevuLocaleInput) => void
  /** 获取当前组件内置文案语言 */
  getLocale: () => ZPagingWevuLocale
  addKeyboardHeightChangeListener: () => void

  updatePageScrollTop: (scrollTop: number) => void
  updatePageScrollTopHeight: () => void
  updatePageScrollBottomHeight: () => void
  updateLeftAndRightWidth: () => void
  updateFixedLayout: () => void
  updateCache: () => void
  getVersion: () => string
  setListSpecialEffects: (value: unknown) => void
  setSpecialEffects: (value: unknown) => void
}

export interface ZPagingWevuController extends ZPagingWevuApi {
  readonly value: ZPagingWevuController
  bind: (api: ZPagingWevuApi | null) => void
  unbind: (api: ZPagingWevuApi | null) => void
}

function createNoopApi(): ZPagingWevuApi {
  const resolved = () => Promise.resolve({ totalList: [], noMore: false })
  const noop = () => {}
  return {
    reload: resolved,
    refresh: resolved,
    refreshToPage: resolved,
    complete: resolved,
    completeByKey: resolved,
    completeByNoMore: resolved,
    completeByTotal: resolved,
    completeByError: resolved,
    setLocalPaging: resolved,
    addDataFromTop: noop,
    clean: noop,
    clear: noop,
    endRefresh: noop,
    updateCustomRefresherHeight: noop,
    closeF2: noop,
    doLoadMore: noop,
    pageReachBottom: noop,
    scrollToTop: noop,
    scrollToBottom: noop,
    scrollToY: noop,
    scrollToX: noop,
    scrollIntoViewById: noop,
    scrollIntoViewByIndex: noop,
    scrollIntoViewByNodeTop: noop,
    scrollIntoViewByView: noop,
    doInsertVirtualListItem: noop,
    didUpdateVirtualListCell: noop,
    didDeleteVirtualListCell: noop,
    updateVirtualListRender: noop,
    doChatRecordLoadMore: noop,
    addChatRecordData: noop,
    setLocale: noop,
    getLocale: () => getPagingLocale(),
    addKeyboardHeightChangeListener: noop,
    updatePageScrollTop: noop,
    updatePageScrollTopHeight: noop,
    updatePageScrollBottomHeight: noop,
    updateLeftAndRightWidth: noop,
    updateFixedLayout: noop,
    updateCache: noop,
    getVersion: () => '2.8.9-wevu',
    setListSpecialEffects: noop,
    setSpecialEffects: noop,
  }
}

export function createPagingController(): ZPagingWevuController {
  let bound: ZPagingWevuApi | null = null
  const fallback = createNoopApi()
  const call = <K extends keyof ZPagingWevuApi>(
    key: K,
    ...args: Parameters<ZPagingWevuApi[K]>
  ): ReturnType<ZPagingWevuApi[K]> => {
    const target = (bound ?? fallback)[key] as (
      ...values: unknown[]
    ) => unknown
    return target(...args) as ReturnType<ZPagingWevuApi[K]>
  }

  const controller = {
    bind(api: ZPagingWevuApi | null) {
      bound = api
    },
    unbind(api: ZPagingWevuApi | null) {
      if (bound === api) {
        bound = null
      }
    },
    get value() {
      return controller
    },
    reload: (animate?: boolean) => call('reload', animate),
    refresh: () => call('refresh'),
    refreshToPage: (page: number) => call('refreshToPage', page),
    complete: (data?: unknown, success?: boolean) =>
      call('complete', data, success),
    completeByKey: (data: unknown, key?: unknown, success?: boolean) =>
      call('completeByKey', data, key, success),
    completeByNoMore: (data: unknown, noMore: boolean, success?: boolean) =>
      call('completeByNoMore', data, noMore, success),
    completeByTotal: (data: unknown, total?: number, success?: boolean) =>
      call('completeByTotal', data, total, success),
    completeByError: (message?: string) => call('completeByError', message),
    setLocalPaging: (data: unknown, success?: boolean) =>
      call('setLocalPaging', data, success),
    addDataFromTop: (data: unknown, scrollToTop?: boolean, animate?: boolean) =>
      call('addDataFromTop', data, scrollToTop, animate),
    clean: () => call('clean'),
    clear: () => call('clear'),
    endRefresh: () => call('endRefresh'),
    updateCustomRefresherHeight: () => call('updateCustomRefresherHeight'),
    closeF2: () => call('closeF2'),
    doLoadMore: (type?: 'click' | 'toBottom') => call('doLoadMore', type),
    pageReachBottom: () => call('pageReachBottom'),
    scrollToTop: (animate?: boolean) => call('scrollToTop', animate),
    scrollToBottom: (animate?: boolean) => call('scrollToBottom', animate),
    scrollToY: (y: number, offset?: number, animate?: boolean) =>
      call('scrollToY', y, offset, animate),
    scrollToX: (x: number, offset?: number, animate?: boolean) =>
      call('scrollToX', x, offset, animate),
    scrollIntoViewById: (id: string, offset?: number, animate?: boolean) =>
      call('scrollIntoViewById', id, offset, animate),
    scrollIntoViewByIndex: (
      index: number,
      offset?: number,
      animate?: boolean,
    ) => call('scrollIntoViewByIndex', index, offset, animate),
    scrollIntoViewByNodeTop: (
      top: number,
      offset?: number,
      animate?: boolean,
    ) => call('scrollIntoViewByNodeTop', top, offset, animate),
    scrollIntoViewByView: (view: string, offset?: number, animate?: boolean) =>
      call('scrollIntoViewByView', view, offset, animate),
    doInsertVirtualListItem: (data: unknown, index: number) =>
      call('doInsertVirtualListItem', data, index),
    didUpdateVirtualListCell: (index: number) =>
      call('didUpdateVirtualListCell', index),
    didDeleteVirtualListCell: (index: number) =>
      call('didDeleteVirtualListCell', index),
    updateVirtualListRender: () => call('updateVirtualListRender'),
    doChatRecordLoadMore: () => call('doChatRecordLoadMore'),
    addChatRecordData: (
      data: unknown,
      scrollToBottom?: boolean,
      animate?: boolean,
    ) => call('addChatRecordData', data, scrollToBottom, animate),
    setLocale: (locale: ZPagingWevuLocaleInput) => call('setLocale', locale),
    getLocale: () => call('getLocale'),
    addKeyboardHeightChangeListener: () =>
      call('addKeyboardHeightChangeListener'),
    updatePageScrollTop: (scrollTop: number) =>
      call('updatePageScrollTop', scrollTop),
    updatePageScrollTopHeight: () => call('updatePageScrollTopHeight'),
    updatePageScrollBottomHeight: () => call('updatePageScrollBottomHeight'),
    updateLeftAndRightWidth: () => call('updateLeftAndRightWidth'),
    updateFixedLayout: () => call('updateFixedLayout'),
    updateCache: () => call('updateCache'),
    getVersion: () => call('getVersion'),
    setListSpecialEffects: (value: unknown) =>
      call('setListSpecialEffects', value),
    setSpecialEffects: (value: unknown) => call('setSpecialEffects', value),
  }

  return controller as ZPagingWevuController
}
