import type { ZPagingWevuController, ZPagingWevuQueryFrom } from './types'

export type ZPagingWevuText = string | Record<string, string>
export type ZPagingWevuStyle
  = string | Record<string, string | number | undefined>
export type ZPagingWevuFetch = (params: {
  pageNo: number
  pageSize: number
  from: ZPagingWevuQueryFrom
  lastItem: unknown
  [key: string]: unknown
}) => unknown | Promise<unknown>

export interface ZPagingWevuProps {
  modelValue?: unknown[]
  controller?: ZPagingWevuController
  auto?: boolean
  fixed?: boolean
  usePageScroll?: boolean
  layoutOnly?: boolean
  fixedTop?: number
  stickyTop?: boolean
  height?: string
  width?: string
  maxWidth?: string
  autoFullHeight?: boolean
  defaultThemeStyle?: 'black' | 'white' | string
  pagingStyle?: ZPagingWevuStyle
  pagingClass?: string | string[] | Record<string, boolean>
  pagingContentStyle?: ZPagingWevuStyle
  pagingContentClass?: string | string[] | Record<string, boolean>
  bgColor?: string
  bgColorContent?: string
  bottomBgColor?: string
  safeAreaInsetBottom?: boolean
  useSafeAreaPlaceholder?: boolean
  useRefresherStatusBarPlaceholder?: boolean

  defaultPageNo?: number
  defaultPageSize?: number
  concat?: boolean
  dataKey?: string | number | Record<string, unknown>
  pagingDataKey?: string | number | Record<string, unknown>
  responseDataKey?: string
  fetch?: ZPagingWevuFetch
  fetchParams?: Record<string, unknown>
  delay?: number | string
  minDelay?: number | string
  autoCleanListWhenReload?: boolean
  autoCleanListWhenReloadError?: boolean

  refresherOnly?: boolean
  refresherEnabled?: boolean
  refresherThreshold?: number | string
  useCustomRefresher?: boolean
  showRefresherWhenReload?: boolean
  reloadWhenRefresh?: boolean
  refresherThemeStyle?: 'black' | 'white' | string
  showRefresherUpdateTime?: boolean
  refresherUpdateTimeKey?: string
  refresherDefaultText?: ZPagingWevuText
  refresherPullingText?: ZPagingWevuText
  refresherRefreshingText?: ZPagingWevuText
  refresherCompleteText?: ZPagingWevuText
  refresherDefaultImg?: string
  refresherPullingImg?: string
  refresherRefreshingImg?: string
  refresherCompleteImg?: string
  refresherRefreshingAnimated?: boolean
  refresherCompleteDelay?: number | string
  refresherCompleteDuration?: number | string
  refresherDefaultDuration?: number | string
  refresherF2Enabled?: boolean
  refresherF2Threshold?: number | string
  refresherF2Duration?: number | string
  showRefresherF2?: boolean
  refresherVibrate?: boolean
  refresherRefreshingScrollable?: boolean
  refresherCompleteScrollable?: boolean
  refresherOutRate?: number
  refresherPullRate?: number
  refresherFps?: number | string
  refresherMaxAngle?: number | string
  watchRefresherTouchmove?: boolean
  refresherImgStyle?: ZPagingWevuStyle
  refresherTitleStyle?: ZPagingWevuStyle
  refresherUpdateTimeStyle?: ZPagingWevuStyle
  refresherBackground?: string

  loadingMoreEnabled?: boolean
  lowerThreshold?: number | string
  toBottomLoadingMoreEnabled?: boolean
  loadingMoreThemeStyle?: 'black' | 'white' | string
  loadingMoreDefaultText?: ZPagingWevuText
  loadingMoreLoadingText?: ZPagingWevuText
  loadingMoreNoMoreText?: ZPagingWevuText
  loadingMoreFailText?: ZPagingWevuText
  showLoadingMoreNoMoreView?: boolean
  hideNoMoreInside?: boolean
  hideNoMoreByLimit?: number
  insideMore?: boolean
  loadingMoreDefaultAsLoading?: boolean
  showDefaultLoadingMoreText?: boolean
  showLoadingMoreNoMoreLine?: boolean
  loadingMoreCustomStyle?: ZPagingWevuStyle
  loadingMoreTitleCustomStyle?: ZPagingWevuStyle
  loadingMoreLoadingIconCustomStyle?: ZPagingWevuStyle
  loadingMoreLoadingIconType?: 'flower' | 'circle' | string
  loadingMoreLoadingIconCustomImage?: string
  loadingMoreLoadingAnimated?: boolean
  loadingMoreNoMoreLineCustomStyle?: ZPagingWevuStyle

  hideEmptyView?: boolean
  emptyViewFixed?: boolean
  emptyViewCenter?: boolean
  emptyViewText?: ZPagingWevuText
  emptyViewImg?: string
  emptyViewErrorImg?: string
  emptyViewReloadText?: ZPagingWevuText
  emptyViewErrorText?: ZPagingWevuText
  showEmptyViewReload?: boolean
  showEmptyViewReloadWhenError?: boolean
  emptyViewSuperStyle?: ZPagingWevuStyle
  isLoadFailed?: boolean

  autoShowBackToTop?: boolean
  backToTopThreshold?: number | string
  backToTopImg?: string
  backToTopWithAnimate?: boolean
  backToTopBottom?: number | string
  backToTopStyle?: ZPagingWevuStyle

  useVirtualList?: boolean
  cellHeightMode?: 'fixed' | 'dynamic'
  preloadPage?: number | string
  fixedCellHeight?: number | string
  virtualListCol?: number | string
  virtualScrollFps?: number | string
  useInnerList?: boolean
  forceCloseInnerList?: boolean
  innerListStyle?: ZPagingWevuStyle
  innerCellStyle?: ZPagingWevuStyle
  virtualParentLevel?: number | string
  parentLevel?: number | string
  inSwiperSlot?: boolean

  useChatRecordMode?: boolean
  autoHideKeyboardWhenChat?: boolean
  autoAdjustPositionWhenChat?: boolean
  autoToBottomWhenChat?: boolean
  chatAdjustPositionOffset?: string
  showChatLoadingWhenReload?: boolean
  chatLoadingMoreDefaultAsLoading?: boolean

  useCache?: boolean
  cacheKey?: string
  autoHideLoadingAfterFirstLoaded?: boolean
  showScrollbar?: boolean
}

export const zPagingWevuDefaults = {
  modelValue: () => [],
  auto: true,
  fixed: false,
  usePageScroll: false,
  layoutOnly: false,
  fixedTop: 0,
  stickyTop: true,
  autoFullHeight: true,
  defaultThemeStyle: 'black',
  bottomBgColor: '',
  safeAreaInsetBottom: false,
  useSafeAreaPlaceholder: false,
  useRefresherStatusBarPlaceholder: false,
  defaultPageNo: 1,
  defaultPageSize: 10,
  concat: true,
  responseDataKey: '',
  delay: 0,
  minDelay: 0,
  autoCleanListWhenReload: false,
  autoCleanListWhenReloadError: true,
  refresherOnly: false,
  refresherEnabled: true,
  refresherThreshold: 40,
  useCustomRefresher: false,
  showRefresherWhenReload: false,
  reloadWhenRefresh: true,
  refresherThemeStyle: 'black',
  showRefresherUpdateTime: false,
  refresherUpdateTimeKey: 'default',
  refresherDefaultText: '继续下拉刷新',
  refresherPullingText: '松开立即刷新',
  refresherRefreshingText: '正在刷新...',
  refresherCompleteText: '刷新成功',
  refresherRefreshingAnimated: true,
  refresherCompleteDelay: 0,
  refresherCompleteDuration: 300,
  refresherDefaultDuration: 200,
  refresherF2Enabled: false,
  refresherF2Threshold: 100,
  refresherF2Duration: 200,
  showRefresherF2: true,
  refresherVibrate: false,
  refresherRefreshingScrollable: true,
  refresherCompleteScrollable: false,
  refresherOutRate: 0.65,
  refresherPullRate: 0.75,
  refresherFps: 40,
  refresherMaxAngle: 40,
  watchRefresherTouchmove: false,
  loadingMoreEnabled: true,
  lowerThreshold: 50,
  toBottomLoadingMoreEnabled: true,
  loadingMoreThemeStyle: 'black',
  loadingMoreDefaultText: '点击加载更多',
  loadingMoreLoadingText: '正在加载...',
  loadingMoreNoMoreText: '没有更多了',
  loadingMoreFailText: '加载失败，点击重新加载',
  showLoadingMoreNoMoreView: true,
  hideNoMoreInside: false,
  hideNoMoreByLimit: 0,
  insideMore: false,
  loadingMoreDefaultAsLoading: false,
  showDefaultLoadingMoreText: true,
  showLoadingMoreNoMoreLine: true,
  loadingMoreLoadingIconType: 'circle',
  loadingMoreLoadingAnimated: true,
  hideEmptyView: false,
  emptyViewFixed: false,
  emptyViewCenter: true,
  emptyViewText: '没有数据哦~',
  emptyViewReloadText: '重新加载',
  emptyViewErrorText: '很抱歉，加载失败',
  showEmptyViewReload: false,
  showEmptyViewReloadWhenError: true,
  isLoadFailed: false,
  autoShowBackToTop: false,
  backToTopThreshold: 200,
  backToTopWithAnimate: true,
  backToTopBottom: 80,
  useVirtualList: false,
  cellHeightMode: 'fixed',
  preloadPage: 2,
  fixedCellHeight: 0,
  virtualListCol: 1,
  virtualScrollFps: 80,
  useInnerList: false,
  forceCloseInnerList: false,
  virtualParentLevel: 0,
  parentLevel: 0,
  inSwiperSlot: false,
  useChatRecordMode: false,
  autoHideKeyboardWhenChat: true,
  autoAdjustPositionWhenChat: true,
  autoToBottomWhenChat: false,
  chatAdjustPositionOffset: '0px',
  showChatLoadingWhenReload: false,
  chatLoadingMoreDefaultAsLoading: true,
  useCache: false,
  autoHideLoadingAfterFirstLoaded: true,
  showScrollbar: true,
} as const
