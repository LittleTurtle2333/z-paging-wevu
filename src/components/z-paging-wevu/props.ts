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
  /** 分页列表数据，配合 `v-model` 使用；请勿手动赋值，应通过 `complete` 系列方法更新。@defaultValue [] */
  modelValue?: unknown[]
  /** 分页控制器，用于调用 `reload`、`complete` 等方法。@defaultValue undefined */
  controller?: ZPagingWevuController
  /** 是否在挂载后自动发起首次分页请求。@defaultValue true */
  auto?: boolean
  /** 是否使用固定高度的整屏滚动布局。@defaultValue true */
  fixed?: boolean
  /** 是否使用页面滚动代替组件内部 `scroll-view`。@defaultValue false */
  usePageScroll?: boolean
  /** 是否仅使用布局，关闭自动请求、刷新、加载更多和空态。@defaultValue false */
  layoutOnly?: boolean
  /** 顶部固定区域的高度补偿，单位为 px。@defaultValue 0 */
  fixedTop?: number
  /** 页面滚动时是否让 `#top` 插槽吸顶。@defaultValue true */
  stickyTop?: boolean
  /** 分页容器高度，支持 CSS 长度值。@defaultValue undefined */
  height?: string
  /** 分页容器宽度，支持 CSS 长度值。@defaultValue undefined */
  width?: string
  /** 分页容器最大宽度，支持 CSS 长度值。@defaultValue undefined */
  maxWidth?: string
  /** 是否自动撑满剩余可用高度。@defaultValue true */
  autoFullHeight?: boolean
  /** 默认主题文字颜色。@defaultValue 'black' */
  defaultThemeStyle?: 'black' | 'white' | string
  /** 分页容器自定义样式。@defaultValue undefined */
  pagingStyle?: ZPagingWevuStyle
  /** 分页容器自定义类名。@defaultValue undefined */
  pagingClass?: string | string[] | Record<string, boolean>
  /** 列表内容区自定义样式。@defaultValue undefined */
  pagingContentStyle?: ZPagingWevuStyle
  /** 列表内容区自定义类名。@defaultValue undefined */
  pagingContentClass?: string | string[] | Record<string, boolean>
  /** 分页容器背景色。@defaultValue undefined */
  bgColor?: string
  /** 列表内容区背景色。@defaultValue undefined */
  bgColorContent?: string
  /** 底部区域背景色。@defaultValue '' */
  bottomBgColor?: string
  /** 是否预留底部安全区。@defaultValue false */
  safeAreaInsetBottom?: boolean
  /** 是否使用底部安全区占位。@defaultValue false */
  useSafeAreaPlaceholder?: boolean
  /** 下拉刷新时是否使用状态栏占位。@defaultValue false */
  useRefresherStatusBarPlaceholder?: boolean

  /** 默认起始页码。@defaultValue 1 */
  defaultPageNo?: number
  /** 每页请求数量。@defaultValue 10 */
  defaultPageSize?: number
  /** 加载下一页时是否拼接已有列表。@defaultValue true */
  concat?: boolean
  /** 数据标识，用于避免跨数据源请求结果串数据。@defaultValue undefined */
  dataKey?: string | number | Record<string, unknown>
  /** 微信小程序中的分页数据标识，替代易与原生属性冲突的 `data-key`。@defaultValue undefined */
  pagingDataKey?: string | number | Record<string, unknown>
  /** 接口响应中列表字段的路径，空字符串表示直接返回列表。@defaultValue '' */
  responseDataKey?: string
  /** 自定义分页请求函数；设置后可替代 `@query` 的请求流程。@defaultValue undefined */
  fetch?: ZPagingWevuFetch
  /** 传递给自定义 `fetch` 的额外参数。@defaultValue undefined */
  fetchParams?: Record<string, unknown>
  /** 首次请求的延迟时间，单位为毫秒。@defaultValue 0 */
  delay?: number | string
  /** 请求的最短耗时，单位为毫秒。@defaultValue 0 */
  minDelay?: number | string
  /** 重新加载前是否自动清空列表。@defaultValue false */
  autoCleanListWhenReload?: boolean
  /** 重新加载失败时是否自动清空列表。@defaultValue true */
  autoCleanListWhenReloadError?: boolean

  /** 是否仅保留下拉刷新，关闭自动请求、加载更多和空态。@defaultValue false */
  refresherOnly?: boolean
  /** 是否启用下拉刷新。@defaultValue true */
  refresherEnabled?: boolean
  /** 触发下拉刷新的距离，单位为 px。@defaultValue 40 */
  refresherThreshold?: number | string
  /** 是否使用自定义下拉刷新。@defaultValue false */
  useCustomRefresher?: boolean
  /** 调用 `reload` 时是否显示下拉刷新动画。@defaultValue false */
  showRefresherWhenReload?: boolean
  /** 下拉刷新时是否重新加载第一页。@defaultValue true */
  reloadWhenRefresh?: boolean
  /** 下拉刷新主题文字颜色。@defaultValue 'black' */
  refresherThemeStyle?: 'black' | 'white' | string
  /** 是否显示最后刷新时间。@defaultValue false */
  showRefresherUpdateTime?: boolean
  /** 最后刷新时间的缓存键。@defaultValue 'default' */
  refresherUpdateTimeKey?: string
  /** 下拉刷新默认状态文本。@defaultValue '继续下拉刷新' */
  refresherDefaultText?: ZPagingWevuText
  /** 达到刷新阈值时的文本。@defaultValue '松开立即刷新' */
  refresherPullingText?: ZPagingWevuText
  /** 正在刷新时的文本。@defaultValue '正在刷新...' */
  refresherRefreshingText?: ZPagingWevuText
  /** 刷新完成时的文本。@defaultValue '刷新成功' */
  refresherCompleteText?: ZPagingWevuText
  /** 下拉刷新默认状态图片。@defaultValue undefined */
  refresherDefaultImg?: string
  /** 达到刷新阈值时的图片。@defaultValue undefined */
  refresherPullingImg?: string
  /** 正在刷新时的图片。@defaultValue undefined */
  refresherRefreshingImg?: string
  /** 刷新完成时的图片。@defaultValue undefined */
  refresherCompleteImg?: string
  /** 正在刷新时是否启用图片动画。@defaultValue true */
  refresherRefreshingAnimated?: boolean
  /** 刷新完成后的延迟，单位为毫秒。@defaultValue 0 */
  refresherCompleteDelay?: number | string
  /** 刷新完成状态的展示时长，单位为毫秒。@defaultValue 300 */
  refresherCompleteDuration?: number | string
  /** 下拉刷新默认状态的展示时长，单位为毫秒。@defaultValue 200 */
  refresherDefaultDuration?: number | string
  /** 是否启用二楼 F2 功能。@defaultValue false */
  refresherF2Enabled?: boolean
  /** 触发二楼 F2 的下拉距离，单位为 px。@defaultValue 100 */
  refresherF2Threshold?: number | string
  /** 二楼 F2 动画时长，单位为毫秒。@defaultValue 200 */
  refresherF2Duration?: number | string
  /** 是否展示二楼 F2 内容。@defaultValue true */
  showRefresherF2?: boolean
  /** 下拉刷新时是否振动。@defaultValue false */
  refresherVibrate?: boolean
  /** 正在刷新时是否允许继续滚动。@defaultValue true */
  refresherRefreshingScrollable?: boolean
  /** 刷新完成状态时是否允许继续滚动。@defaultValue false */
  refresherCompleteScrollable?: boolean
  /** 下拉距离超出阈值后的衰减比例。@defaultValue 0.65 */
  refresherOutRate?: number
  /** 下拉距离与视图移动距离的比例。@defaultValue 0.75 */
  refresherPullRate?: number
  /** 自定义下拉刷新动画帧率。@defaultValue 40 */
  refresherFps?: number | string
  /** 自定义下拉刷新最大角度。@defaultValue 40 */
  refresherMaxAngle?: number | string
  /** 是否监听自定义刷新触摸移动事件。@defaultValue false */
  watchRefresherTouchmove?: boolean
  /** 下拉刷新图片自定义样式。@defaultValue undefined */
  refresherImgStyle?: ZPagingWevuStyle
  /** 下拉刷新文字自定义样式。@defaultValue undefined */
  refresherTitleStyle?: ZPagingWevuStyle
  /** 最后刷新时间自定义样式。@defaultValue undefined */
  refresherUpdateTimeStyle?: ZPagingWevuStyle
  /** 下拉刷新区域背景色。@defaultValue undefined */
  refresherBackground?: string

  /** 是否启用加载更多。@defaultValue true */
  loadingMoreEnabled?: boolean
  /** 距底部多少 px 时触发加载更多。@defaultValue 50 */
  lowerThreshold?: number | string
  /** 滚动到底部时是否自动加载更多。@defaultValue true */
  toBottomLoadingMoreEnabled?: boolean
  /** 加载更多主题文字颜色。@defaultValue 'black' */
  loadingMoreThemeStyle?: 'black' | 'white' | string
  /** 点击加载更多文本。@defaultValue '点击加载更多' */
  loadingMoreDefaultText?: ZPagingWevuText
  /** 正在加载更多文本。@defaultValue '正在加载...' */
  loadingMoreLoadingText?: ZPagingWevuText
  /** 没有更多数据文本。@defaultValue '没有更多了' */
  loadingMoreNoMoreText?: ZPagingWevuText
  /** 加载失败文本。@defaultValue '加载失败，点击重新加载' */
  loadingMoreFailText?: ZPagingWevuText
  /** 是否显示“没有更多了”区域。@defaultValue true */
  showLoadingMoreNoMoreView?: boolean
  /** 是否隐藏列表内部的“没有更多了”。@defaultValue false */
  hideNoMoreInside?: boolean
  /** 列表数量达到指定值后隐藏“没有更多了”，0 表示不限制。@defaultValue 0 */
  hideNoMoreByLimit?: number
  /** 是否将加载更多区域放在列表内部。@defaultValue false */
  insideMore?: boolean
  /** 是否将默认加载更多状态视为加载中。@defaultValue false */
  loadingMoreDefaultAsLoading?: boolean
  /** 是否显示默认加载更多文本。@defaultValue true */
  showDefaultLoadingMoreText?: boolean
  /** 是否显示“没有更多了”两侧的分隔线。@defaultValue true */
  showLoadingMoreNoMoreLine?: boolean
  /** 加载更多区域自定义样式。@defaultValue undefined */
  loadingMoreCustomStyle?: ZPagingWevuStyle
  /** 加载更多文字自定义样式。@defaultValue undefined */
  loadingMoreTitleCustomStyle?: ZPagingWevuStyle
  /** 加载中图标自定义样式。@defaultValue undefined */
  loadingMoreLoadingIconCustomStyle?: ZPagingWevuStyle
  /** 加载中图标类型。@defaultValue 'circle' */
  loadingMoreLoadingIconType?: 'flower' | 'circle' | string
  /** 自定义加载中图标图片地址。@defaultValue undefined */
  loadingMoreLoadingIconCustomImage?: string
  /** 是否启用加载中图标动画。@defaultValue true */
  loadingMoreLoadingAnimated?: boolean
  /** “没有更多了”分隔线自定义样式。@defaultValue undefined */
  loadingMoreNoMoreLineCustomStyle?: ZPagingWevuStyle

  /** 是否隐藏组件内置空态。@defaultValue false */
  hideEmptyView?: boolean
  /** 空态是否使用固定定位。@defaultValue false */
  emptyViewFixed?: boolean
  /** 空态是否居中显示。@defaultValue true */
  emptyViewCenter?: boolean
  /** 空态文本。@defaultValue '没有数据哦~' */
  emptyViewText?: ZPagingWevuText
  /** 普通空态图片地址。@defaultValue undefined */
  emptyViewImg?: string
  /** 加载失败空态图片地址。@defaultValue undefined */
  emptyViewErrorImg?: string
  /** 空态重载按钮文本。@defaultValue '重新加载' */
  emptyViewReloadText?: ZPagingWevuText
  /** 加载失败空态文本。@defaultValue '很抱歉，加载失败' */
  emptyViewErrorText?: ZPagingWevuText
  /** 是否始终显示空态重载按钮。@defaultValue false */
  showEmptyViewReload?: boolean
  /** 加载失败时是否显示空态重载按钮。@defaultValue true */
  showEmptyViewReloadWhenError?: boolean
  /** 空态外层容器自定义样式。@defaultValue undefined */
  emptyViewSuperStyle?: ZPagingWevuStyle
  /** 是否将当前分页状态标记为加载失败。@defaultValue false */
  isLoadFailed?: boolean

  /** 是否自动显示返回顶部按钮。@defaultValue false */
  autoShowBackToTop?: boolean
  /** 滚动多少 px 后显示返回顶部按钮。@defaultValue 200 */
  backToTopThreshold?: number | string
  /** 返回顶部按钮图片地址。@defaultValue undefined */
  backToTopImg?: string
  /** 返回顶部时是否使用动画。@defaultValue true */
  backToTopWithAnimate?: boolean
  /** 返回顶部按钮距底部的距离，单位为 px。@defaultValue 80 */
  backToTopBottom?: number | string
  /** 返回顶部按钮自定义样式。@defaultValue undefined */
  backToTopStyle?: ZPagingWevuStyle

  /** 是否启用虚拟列表。@defaultValue false */
  useVirtualList?: boolean
  /** 虚拟列表单元格高度模式。@defaultValue 'fixed' */
  cellHeightMode?: 'fixed' | 'dynamic'
  /** 虚拟列表预加载页数。@defaultValue 2 */
  preloadPage?: number | string
  /** 固定单元格高度，单位为 px；0 表示未设置。@defaultValue 0 */
  fixedCellHeight?: number | string
  /** 虚拟列表列数。@defaultValue 1 */
  virtualListCol?: number | string
  /** 虚拟列表滚动计算帧率。@defaultValue 80 */
  virtualScrollFps?: number | string
  /** 是否使用组件内置列表渲染。@defaultValue false */
  useInnerList?: boolean
  /** 是否强制关闭内置列表并改用页面 `v-for`。@defaultValue false */
  forceCloseInnerList?: boolean
  /** 内置列表容器自定义样式。@defaultValue undefined */
  innerListStyle?: ZPagingWevuStyle
  /** 内置列表单元格自定义样式。@defaultValue undefined */
  innerCellStyle?: ZPagingWevuStyle
  /** 虚拟列表父级层级补偿。@defaultValue 0 */
  virtualParentLevel?: number | string
  /** 父级层级补偿的兼容配置。@defaultValue 0 */
  parentLevel?: number | string
  /** 当前分页是否位于 `ZPagingSwiperItem` 插槽中。@defaultValue false */
  inSwiperSlot?: boolean

  /** 是否启用聊天记录模式。@defaultValue false */
  useChatRecordMode?: boolean
  /** 聊天模式下是否自动隐藏键盘。@defaultValue true */
  autoHideKeyboardWhenChat?: boolean
  /** 聊天模式下是否自动调整列表位置。@defaultValue true */
  autoAdjustPositionWhenChat?: boolean
  /** 聊天模式下新消息到达时是否自动滚动到底部。@defaultValue false */
  autoToBottomWhenChat?: boolean
  /** 聊天模式自动调整位置的偏移量。@defaultValue '0px' */
  chatAdjustPositionOffset?: string
  /** 聊天模式重新加载时是否显示历史消息加载状态。@defaultValue false */
  showChatLoadingWhenReload?: boolean
  /** 聊天历史消息默认状态是否视为加载中。@defaultValue true */
  chatLoadingMoreDefaultAsLoading?: boolean

  /** 是否启用分页数据缓存。@defaultValue false */
  useCache?: boolean
  /** 分页数据缓存键。@defaultValue undefined */
  cacheKey?: string
  /** 首次加载完成后是否自动隐藏加载状态。@defaultValue true */
  autoHideLoadingAfterFirstLoaded?: boolean
  /** 是否显示滚动条。@defaultValue true */
  showScrollbar?: boolean
}

export const zPagingWevuDefaults = {
  modelValue: () => [],
  auto: true,
  fixed: true,
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
