<script setup lang="ts">
import type { ZPagingWevuProps } from './props'
/**
 * z-paging-wevu：z-paging 2.8.x 的 weapp-vite + wevu 兼容实现。
 *
 * 注意：wevu 自定义组件事件只透传一个 payload，多参数会打包成数组。
 * 因此 @query 的页面处理签名为 queryList([pageNo, pageSize, from])。
 * nvue 专属渲染不在当前小程序目标内，相关方法仅保留兼容入口。
 */
import type {
  ZPagingWevuApi,
  ZPagingWevuLoadingStatus,
  ZPagingWevuQueryFrom,
  ZPagingWevuRefresherStatus,
  ZPagingWevuResult,
} from './types'
import { computed, nextTick, onMounted, onUnmounted, ref, useElementIntersectionObserver, useSelectorQuery, watch } from 'wevu'
import type { ZPagingWevuLocaleInput } from './locale'
import { getPagingLocale, onPagingLocaleChange, setPagingLocale, t as vpT, translateText } from './locale'
import { useVirtualList } from './useVirtualList'
import {
  vpArray,
  vpCacheName,
  vpItems,
  vpNowText,
  vpNumber,
  vpPx,
  vpText,
  vpUpdateTimeName,
  vpWait,
} from './utils'
import { getWindowMetrics } from './window'

const props = withDefaults(defineProps<ZPagingWevuProps>(), {
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
  autoCleanListWhenReload: true,
  autoCleanListWhenReloadError: true,
  autoScrollToTopWhenReload: true,
  refresherOnly: false,
  refresherEnabled: true,
  scrollable: true,
  watchTouchDirectionChange: false,
  refresherThreshold: 40,
  useCustomRefresher: false,
  showRefresherWhenReload: false,
  reloadWhenRefresh: true,
  refresherThemeStyle: 'black',
  showRefresherUpdateTime: false,
  refresherUpdateTimeKey: 'default',
  // 文案类 props 默认不传：交给内置多语言字典（对齐原版 z-paging 的 i18n 行为）
  refresherDefaultText: undefined,
  refresherPullingText: undefined,
  refresherRefreshingText: undefined,
  refresherCompleteText: undefined,
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
  refresherDefaultStyle: 'black',
  refresherFps: 40,
  refresherMaxAngle: 40,
  watchRefresherTouchmove: false,
  loadingMoreEnabled: true,
  lowerThreshold: 50,
  toBottomLoadingMoreEnabled: true,
  loadingMoreThemeStyle: 'black',
  loadingMoreDefaultText: undefined,
  loadingMoreLoadingText: undefined,
  loadingMoreNoMoreText: undefined,
  loadingMoreFailText: undefined,
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
  emptyViewText: undefined,
  emptyViewReloadText: undefined,
  emptyViewErrorText: undefined,
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
})

const emit = defineEmits<{
  (e: 'update:modelValue', list: unknown[]): void
  (e: 'query', pageNo: number, pageSize: number, from: ZPagingWevuQueryFrom): void
  (e: 'list-change', list: unknown[]): void
  (e: 'on-refresh'): void
  (e: 'on-restore'): void
  (e: 'reload'): void
  (e: 'refresher-status-change', status: ZPagingWevuRefresherStatus): void
  (e: 'refresher-touchstart', y: number): void
  (
    e: 'refresher-touchmove',
    detail: {
      pullingDistance: number
      dy: number
      viewHeight: number
      rate: number
    },
  ): void
  (e: 'refresher-touchend', y: number): void
  (e: 'refresher-f2-change', visible: boolean): void
  (e: 'loading-status-change', status: ZPagingWevuLoadingStatus): void
  (e: 'empty-view-reload', callback: (allow?: boolean) => void): void
  (e: 'empty-view-click'): void
  (e: 'is-load-failed-change', failed: boolean): void
  (e: 'back-to-top-click', callback: (allow?: boolean) => void): void
  (e: 'virtual-list-change', list: Array<Record<string, unknown>>): void
  (e: 'inner-cell-click', item: unknown, index: number): void
  (e: 'virtual-placeholder-top-height', height: number): void
  (e: 'hided-keyboard'): void
  (e: 'keyboard-height-change', detail: { height: number }): void
  (e: 'scroll', event: unknown): void
  (e: 'scroll-top-change', scrollTop: number): void
  (e: 'scrolltolower'): void
  (e: 'scrolltoupper'): void
  (e: 'scrollend', event: unknown): void
  (e: 'content-height-changed', height: number): void
  (e: 'touch-direction-change', direction: 'top' | 'bottom'): void
  (e: 'scroll-direction-change', direction: 'top' | 'bottom'): void
}>()

const uid = `z-paging-wevu-${Math.random().toString(36).slice(2, 9)}`
const metrics = getWindowMetrics()
const pageSize = computed(() => Math.max(1, props.defaultPageSize))
const firstPageNo = computed(() => props.defaultPageNo)
const list = ref<unknown[]>([...(props.modelValue ?? [])])
const pageNo = ref(firstPageNo.value)
const loading = ref(false)
const failed = ref(false)
const noMore = ref(false)
const firstLoaded = ref(false)
const refreshing = ref(false)
const scrollTop = ref(0)
const scrollViewTop = ref(0)
const scrollViewLeft = ref(0)
const scrollWithAnimation = ref(false)
const contentHeight = ref(0)
const viewportHeight = ref(Math.max(1, metrics.windowHeight - props.fixedTop))
const pageTopHeight = ref(0)
const pageBottomHeight = ref(0)
const leftWidth = ref(0)
const rightWidth = ref(0)
const keyboardHeight = ref(0)
const localPagingList = ref<unknown[] | null>(null)
const customEmptyErrorText = ref('')
const refresherStatus = ref<ZPagingWevuRefresherStatus>('default')
const pullingDistance = ref(0)
/** 自定义下拉刷新视图的自然高度（测量得到），用于刷新态撑开与最大下拉距离 */
const customRefresherHeight = ref(0)
const f2Visible = ref(false)
const refresherUpdateTime = ref('')
const queryFrom = ref<ZPagingWevuQueryFrom>('reload')
/** 语言变化时自增，驱动内置文案 computed 重新计算 */
const localeVersion = ref(0)
onPagingLocaleChange(() => {
  localeVersion.value += 1
})

let pendingQuery: {
  promise: Promise<ZPagingWevuResult>
  resolve: (result: ZPagingWevuResult) => void
  startedAt: number
  /** 请求发起时的世代号，用于丢弃 reload 之后回来的旧响应 */
  epoch: number
} | null = null
/**
 * 请求世代号：reload / refresh 会自增。
 * 旧请求（比如切换 tab 前发出的加载更多）回来时如果世代号不匹配，
 * 就不能把它的数据写进新列表，否则会出现“切 tab 后从 21 开始”这类脏数据。
 */
let queryEpoch = 0
/** 有请求在飞时又调用了 reload，等旧请求结束后要补发第一页请求 */
let pendingReloadAfterStale = false
let requestedPageSize = pageSize.value
let replaceOnComplete = false
let touchStartY = -1
let lastTouchY = -1
let lastScrollTop = 0
let lastScrollHeight = 0
let keyboardListener: ((result: { height: number }) => void) | null = null
const renderTimer: ReturnType<typeof setTimeout> | null = null

function currentResult(): ZPagingWevuResult {
  return {
    totalList: list.value,
    noMore: noMore.value,
  }
}
const currentDataKey = () => props.pagingDataKey ?? props.dataKey
const isPageScroll = () => props.usePageScroll
/**
 * 顶部插槽是否放在滚动区外。
 * 聊天记录模式会把 scroll-view 整体倒置，插槽若留在滚动区内会跟着倒置，
 * 因此与原版一致：聊天模式下 `#top` 也放到滚动区外。
 */
const topSlotOutside = computed(
  () => props.stickyTop || props.useChatRecordMode,
)
const isInnerVirtualList = computed(
  () => props.useVirtualList && !props.forceCloseInnerList,
)
const loadingStatus = computed<ZPagingWevuLoadingStatus>(() => {
  if (failed.value) {
    return 'fail'
  }
  if (loading.value) {
    return 'loading'
  }
  if (noMore.value) {
    return 'no-more'
  }
  return 'default'
})
const showLoading = computed(
  () =>
    !props.layoutOnly
    && loading.value
    && list.value.length === 0
    && (!firstLoaded.value || !props.autoHideLoadingAfterFirstLoaded),
)
const showEmpty = computed(
  () =>
    !props.layoutOnly
    && !props.refresherOnly
    && !props.hideEmptyView
    && !showLoading.value
    && !loading.value
    && !refreshing.value
    && list.value.length === 0
    && (firstLoaded.value || props.isLoadFailed || failed.value),
)
const showNoMoreView = computed(() => {
  if (
    !props.showLoadingMoreNoMoreView
    || list.value.length < props.hideNoMoreByLimit
  ) {
    return false
  }
  if (
    props.hideNoMoreInside
    && contentHeight.value > 0
    && contentHeight.value <= viewportHeight.value
  ) {
    return false
  }
  return true
})
const showLoadingMore = computed(
  () =>
    !props.layoutOnly
    && !props.refresherOnly
    // 与原版一致：聊天记录模式不展示通用加载更多条，改由 chatLoading/chatNoMore 插槽呈现
    && !props.useChatRecordMode
    && props.loadingMoreEnabled
    && list.value.length > 0
    && (loading.value
      || failed.value
      || (noMore.value && showNoMoreView.value)
      || !props.toBottomLoadingMoreEnabled),
)
const loadingMoreText = computed(() => {
  void localeVersion.value
  if (failed.value) {
    return translateText(props.loadingMoreFailText, 'zp.loadingMore.fail')
  }
  if (noMore.value && !loading.value) {
    return translateText(props.loadingMoreNoMoreText, 'zp.loadingMore.noMore')
  }
  if (loading.value || props.loadingMoreDefaultAsLoading) {
    return translateText(props.loadingMoreLoadingText, 'zp.loadingMore.loading')
  }
  return translateText(props.loadingMoreDefaultText, 'zp.loadingMore.default')
})
const showBackToTop = computed(
  () =>
    props.autoShowBackToTop
    && scrollTop.value >= vpPx(props.backToTopThreshold, 200),
)
const emptyText = computed(() => {
  void localeVersion.value
  return failed.value || props.isLoadFailed
    ? translateText(props.emptyViewErrorText, 'zp.emptyView.error')
    : translateText(props.emptyViewText, 'zp.emptyView.title')
})
const emptyReloadText = computed(() => {
  void localeVersion.value
  return translateText(props.emptyViewReloadText, 'zp.emptyView.reload')
})
const systemLoadingText = computed(() => {
  void localeVersion.value
  return vpT('zp.system.loading')
})
const refresherUpdateTimeTitle = computed(() => {
  void localeVersion.value
  return vpT('zp.refresherUpdateTime.title')
})
const emptyImage = computed(() =>
  failed.value || props.isLoadFailed
    ? props.emptyViewErrorImg || props.emptyViewImg
    : props.emptyViewImg,
)
const showEmptyReload = computed(
  () =>
    props.showEmptyViewReload
    || ((failed.value || props.isLoadFailed)
      && props.showEmptyViewReloadWhenError),
)
const refresherText = computed(() => {
  void localeVersion.value
  const map: Record<string, [unknown, string]> = {
    'default': [props.refresherDefaultText, 'zp.refresher.default'],
    'release-to-refresh': [props.refresherPullingText, 'zp.refresher.pulling'],
    'loading': [props.refresherRefreshingText, 'zp.refresher.refreshing'],
    'complete': [props.refresherCompleteText, 'zp.refresher.complete'],
    'go-f2': [props.refresherPullingText, 'zp.refresher.f2'],
  }
  const entry = map[refresherStatus.value] ?? map.default
  return translateText(entry[0], entry[1])
})
/** 原生下拉刷新模式下的自绘文案层高度，与原生触发阈值对齐。 */
const refresherHintHeight = computed(() => vpPx(props.refresherThreshold, 40))

/**
 * 默认箭头图（与 z-paging 一致的素材）：基准朝上，
 * `default` 状态旋转 180deg 朝下，`release-to-refresh` 回到 0deg，
 * 由 `transition: transform` 做平滑翻转。
 */
const REFRESHER_ARROW_SRC = {
  black: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAD1BMVEVHcExRUVFMTExRUVFRUVE9CdWsAAAABHRSTlMAjjrY9ZnUjwAAAQFJREFUWMPt2MsNgzAMgGEEE1B1gKJmAIRYoCH7z9RCXrabh33iYktcIv35EEg5ZBh07pvxJU6MFSPOSRnjnBUjUsaciRUjMsb4xIoRCWNiYsUInzE5sWKEyxiYWDbyefqHx1zIeiYTk7mQYziTYecxHvEJjwmIT3hMQELCYSISEg4TkZj0mYTEpM8kJCU9JiMp6TEZyUmbAUhO2gxAQNJiIAKSFgMRmNQZhMCkziAEJTUGIyipMRjBSZkhCE7KDEFIUmTeGCHJxWz0zXaE0GTCG8ZFtEaS347r/1fe11YyHYVfubxayfjoHmc0YYwmmmiiiSaaaKLJ7ckyz5ve+dw3Xw2emdwm9xSbAAAAAElFTkSuQmCC',
  white: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAElBMVEVHcEz///////////////////+IGTx/AAAABnRSTlMA/dAkXZOhASU/AAABYElEQVRYw+2YwXLCIBCGsdAHWGbyAKZ4zxi9O017rxLf/1UaWFAgA1m8dcpedNSPf/l/Vh0Ya/Wn6hN0JcGvoCqRM4C8VBFiDwBqqNuJKV0rAnCgy3AUqZE57x0iqTL8Br4U3WBf/YWaIlTKfAcELU/h9w72CSVPa3C3OCDvhpHbRp/s2vq4fHhCeiCl2A3m4Qd71DQR257mFBlMcTlbFnFWzNtHxewYEfSiaLS4el8d8nyhmKJd1CF4eOS0keLMAuSxubLBIeIGQW8YHCFFo7EH9+YDcQt9FMZEswTheaNxTHwHT8SZorJjMrEVwo4Zo0U8HSEyZvJMOg4RjnmmRr8nDYeIz3OMkbfE/QhBo+U9RnZJxjGCRh/WKmHEMWLNkfPKsGh/CWJk1JjG0kcuJggTt34VDP8aWAFhp4nybVb5+9qQhjSkIQ1pSEMa8k+Q5U9rV3dF8MpFBK+/7miVq1/HZ2qmo9D+pAAAAABJRU5ErkJggg==',
} as const

const refresherArrowSrc = computed(
  () => REFRESHER_ARROW_SRC[props.refresherThemeStyle === 'white' ? 'white' : 'black'],
)

/** 刷新完成状态的默认图标（与 z-paging 一致的素材）。 */
const REFRESHER_SUCCESS_SRC = {
  black: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAElBMVEVRUVFHcExTU1NRUVFRUVFRUVFOSlSUAAAABnRSTlP/AI6+VySB3ZENAAACcElEQVRYw+2YyYKCMAyGI8hdpdxdZu7gcpdZ7jL6/s8yYheSNi0aPdqbwOffpGmaFOYPD3gj4bisN7vddv17N/JVgxn5x12IWgIaWTuO/IE3PseQbwjGPo2cgRmHFLJwdm/X643zwiqOKPPJ1nj3sjEP2iiifZWj5bhopSyGaEO2HX5fbQJzwJ+W7x/jw5ZFjsEU0PMph9xE8i5EqprKALW95eJQURkgzw98uJ/JvwGecR7bIjWWsUgVrrIfFZ2HlLy3sKETD1mmRLRMRhGVssRa0xJkdn3SpJBymBkM8+pSSDXMDNyDaToVHd2fgpNt0sjwiUZO19+jGQ+gQEg9Oq+bufmAVGihomNmjQG7UG3020vrlm7lkFnKFGU3kZ0KGAdmKe821pipQ+qEKcrZeTL2g5FsUks4cStjEZWwXg0b0n4GxmEpkWwIs5VBynjgK7xZaz1/0D7OxkVuLpsY5BQNFyLS84VBjjbg0iL2r2EQHBOxBhikuUOkdxODVF1cxHoWtPPsiyXO455Iv34hssCO8EV4ZIYTjS8SR4qYSHRiTiYQ4ZFbHi0iIhhBTi6dTCgSWRcnw4h4yGTuyTAiOGBIWGoZTgSHJQl+LcOJ4OCnW6yX2bMnJ9pidCOXtkTkTrIGpYuOynAiOF14SamMiOCk5Ke+mq8BcOrrvym8d0zKIQnWT+M1WwOQNO4fFiWb18hhERxJPx2fblbPHHyC41VyiAtKBUFBIih7JMWVoIQTFIr3lKPN80WvoLSWFPC653ioTZA0I0FrQ7qU6asaK0H7JmkSJa2ooOGVtNUsc3j9FYHkIkJy3SG6VHnfXKXGP9t4N9Q4Ye98AAAAAElFTkSuQmCC',
  white: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAAGFBMVEVHcEz///////////////////////////8dS1W+AAAAB3RSTlMAiVYk6KvDHLfaegAAAo1JREFUWMPtWEtzmzAQNhCTq910ytXpiyvxTNOr60zrayepx9d02gnX4sTm7xcEiJX2gdnkGJ1A4tOnfWqXyeR1vMRYzrcPD9v5h5MBl3/Ldvx4cxIg/FWC8X0xjLjalM54uhhCfCrRuJURX0pi3EmIqZV7O59vrRZmguStHL9b7S7ftfLwOtiZDw7AHMtmquAQ12b5Wwbnordm8g9zLLO49qc/m2n6aKnhwPOGZ08hAiNHhheiHae1lOUPGZpQkPKa3q0mOUjaRzSRaGUjpy/mmWSwySSpllcEteBKAT52KEnSbblA51pJEPxBQoiH1FP4E3s5+FJv07h6/ylD6ui7B+9fq/ehrFB98ghec9EoVtyjK8pqCHLmCBOwMWSCeWFNN4MbPAk55NhsvoFHSSVR0k5TCTTEzlUGcqV/nVp7n9oIVkmtaqbAEqEgfdgHJPwsEAyZ9r4VAZXFjpEwyaw3+H2v42KYxKhs1XvY/gSSGv+IHyUSuHXCeZhLAgVI3EjgSGo1Fb3xO0tGGU9S2/KAIbtjxpJASG73qox6w5LUq0cEOa+iIONIWIilQSQ0pPa2jgaRQAgQP7c0mITRWGxpMAmEQFN2NAQJNCV0mI6GIIEO47hlQ0ORQLd0nL+hoUjg1m6I1TRr8uYEAriBHLcVFQ5UEMiBe3XkTBEG04WXlGKGxPnMS305XQPA1Ocn2JiuAZwE66fxnKwBnDTuXxZTMq85lwW6kt5ndLqZPefiU1yvmktcUSooChJF2aMprhQlnKJQ5FxRKkcVRa+itNYU8Io2oVkY14w0NMWYlqft91Bj9VHq+ca3b43BxjWJmla0sfKohlfTVpPN+93L/yLQ/IjQ/O5Q/VR5HdL4D7mlxmjwVdELAAAAAElFTkSuQmCC',
} as const

const refresherCompleteIconSrc = computed(
  () => props.refresherCompleteImg
    || REFRESHER_SUCCESS_SRC[props.refresherThemeStyle === 'white' ? 'white' : 'black'],
)

const refresherImage = computed(() => {
  const map = {
    'default': props.refresherDefaultImg,
    'release-to-refresh': props.refresherPullingImg,
    'loading': props.refresherRefreshingImg,
    'complete': props.refresherCompleteImg,
    'go-f2': props.refresherPullingImg,
  }
  return map[refresherStatus.value]
})
/**
 * 底部区域样式：computed 放在 `:style` 数组里不会被模板解包，
 * 这里直接拼成字符串，避免 `bottomBgColor` / 聊天键盘高度失效。
 */
const bottomStyle = computed(() => {
  const parts: string[] = []
  if (props.bottomBgColor) {
    parts.push(`background-color:${props.bottomBgColor};`)
  }
  if (props.useChatRecordMode && props.autoAdjustPositionWhenChat) {
    parts.push(`padding-bottom:${keyboardHeight.value + vpPx(props.chatAdjustPositionOffset, 0)}px;`)
  }
  return parts.join('')
})

const virtual = useVirtualList({
  list,
  scrollTop,
  getEnabled: () => props.useVirtualList,
  getCellHeightMode: () => props.cellHeightMode,
  getFixedCellHeight: () => props.fixedCellHeight,
  getPreloadPage: () => props.preloadPage,
  getColumns: () => props.virtualListCol,
  getViewportHeight: () => viewportHeight.value,
  onListChange: next => setList(next),
  onRenderChange: next => emit('virtual-list-change', next),
  onPlaceholderTopHeight: height =>
    emit('virtual-placeholder-top-height', height),
})

/**
 * 模板（WXML）里拿不到 ref 的 `.value`，
 * 这里统一转成普通值，虚拟列表才能真正渲染出来。
 */
const virtualView = computed(() => ({
  renderList: virtual.renderList.value,
  placeholderTop: virtual.placeholderTop.value,
  placeholderBottom: virtual.placeholderBottom.value,
}))

watch(
  () => props.modelValue,
  (next) => {
    if (next && next !== list.value) {
      list.value = next
    }
  },
)
watch(loadingStatus, status => emit('loading-status-change', status))
watch(failed, value => emit('is-load-failed-change', value))
watch(refresherStatus, status => emit('refresher-status-change', status))
watch(() => props.fixedTop, updateFixedLayout)

function setList(next: unknown[]) {
  list.value = next
  emit('update:modelValue', next)
  emit('list-change', next)
  void nextTick(() => {
    virtual.update()
    updateContentHeight()
  })
}

function setFailed(value: boolean) {
  failed.value = value
}

const selectorQuery = useSelectorQuery()

// 动态高度模式：渲染窗口每次变化后重新测量 cell 高度
watch(
  () => virtual.renderList.value,
  () => {
    if (props.cellHeightMode === 'dynamic') {
      void nextTick().then(() => measureVirtualCells())
    }
  },
)

function queryRect(
  selector: string,
): Promise<{
  top: number
  left: number
  height: number
  width: number
} | null> {
  return new Promise((resolve) => {
    const query = selectorQuery()
    if (!query) {
      resolve(null)
      return
    }
    query
      .select(selector)
      .boundingClientRect((rect) => {
        const value = Array.isArray(rect) ? rect[0] : rect
        resolve(
          value
            ? {
                top: value.top,
                left: value.left,
                height: value.height,
                width: value.width,
              }
            : null,
        )
      })
      .exec()
  })
}

function updateContentHeight() {
  void queryRect(`#${uid} .z-paging-wevu__content`).then((rect) => {
    if (!rect) {
      return
    }
    const changed = Math.abs(contentHeight.value - rect.height) > 1
    contentHeight.value = rect.height
    if (changed) {
      emit('content-height-changed', rect.height)
    }
    if (
      props.insideMore
      && !loading.value
      && !noMore.value
      && rect.height <= viewportHeight.value
    ) {
      pageReachBottom()
    }
  })
}

function updateFixedLayout() {
  viewportHeight.value = Math.max(
    1,
    getWindowMetrics().windowHeight
    - props.fixedTop
    - pageTopHeight.value
    - pageBottomHeight.value,
  )
  virtual.update()
}

function updatePageScrollTopHeight() {
  void queryRect(`#${uid} .z-paging-wevu__top`).then((rect) => {
    pageTopHeight.value = rect?.height ?? 0
    updateFixedLayout()
  })
}

function updatePageScrollBottomHeight() {
  void queryRect(`#${uid} .z-paging-wevu__bottom`).then((rect) => {
    pageBottomHeight.value = rect?.height ?? 0
    updateFixedLayout()
  })
}

function updateLeftAndRightWidth() {
  void Promise.all([
    queryRect(`#${uid} .z-paging-wevu__left`),
    queryRect(`#${uid} .z-paging-wevu__right`),
  ]).then(([left, right]) => {
    leftWidth.value = left?.width ?? 0
    rightWidth.value = right?.width ?? 0
    updateFixedLayout()
  })
}

function settlePending(): ZPagingWevuResult {
  loading.value = false
  const result = currentResult()
  pendingQuery?.resolve(result)
  pendingQuery = null
  endRefresh()
  return result
}

function startQuery(
  queryPageSize = pageSize.value,
  replace = false,
  from: ZPagingWevuQueryFrom = 'reload',
): Promise<ZPagingWevuResult> {
  if (pendingQuery) {
    return pendingQuery.promise
  }
  requestedPageSize = queryPageSize
  replaceOnComplete = replace
  queryFrom.value = from
  loading.value = true
  const startedAt = Date.now()
  let resolveQuery: (result: ZPagingWevuResult) => void = () => {}
  const promise = new Promise<ZPagingWevuResult>((resolve) => {
    resolveQuery = resolve
  })
  pendingQuery = { promise, resolve: resolveQuery, startedAt, epoch: queryEpoch }

  const actualPageNo = replace ? firstPageNo.value : pageNo.value
  if (localPagingList.value && from === 'load-more') {
    const start = (actualPageNo - firstPageNo.value) * requestedPageSize
    void complete(
      localPagingList.value.slice(start, start + requestedPageSize),
    )
    return promise
  }
  if (props.refresherOnly) {
    emit('on-refresh')
    return promise
  }
  if (props.fetch) {
    const lastItem = list.value.length
      ? list.value[list.value.length - 1]
      : null
    Promise.resolve(
      props.fetch({
        pageNo: actualPageNo,
        pageSize: requestedPageSize,
        from,
        lastItem,
        ...(props.fetchParams ?? {}),
      }),
    )
      .then(result => complete(result))
      .catch(error =>
        completeByError(error instanceof Error ? error.message : String(error)),
      )
  }
  else {
    emit('query', actualPageNo, requestedPageSize, from)
  }
  return promise
}

function resetState() {
  pageNo.value = firstPageNo.value
  noMore.value = false
  setFailed(false)
}

function beginRefresher() {
  refreshing.value = true
  refresherStatus.value = 'loading'
  if (props.useCustomRefresher) {
    // 撑到自定义刷新视图的完整高度，否则刷新中内容会被裁成一条
    pullingDistance.value = customRefresherHeight.value
      || vpPx(props.refresherThreshold, 40)
    updateCustomRefresherHeight()
  }
}

function reload(animate = props.showRefresherWhenReload) {
  if (animate) {
    beginRefresher()
  }
  resetState()
  // 与原版一致：reload（含切换 tab、搜索）时立即清空列表，
  // 可通过 auto-clean-list-when-reload="false" 关闭该行为。
  if (props.autoCleanListWhenReload && list.value.length > 0) {
    setList([])
  }
  emit('reload')
  // 与原版一致：reload 时回到顶部，切换 tab 或搜索后列表从第一页顶部开始
  if (props.autoScrollToTopWhenReload) {
    scrollToTop(false)
  }

  /**
   * 自增世代号：让还在飞行的请求（例如切 tab 前发出的加载更多）作废，
   * 否则它回来后会把“第 N 页”的数据当成第一页写入，出现列表从 21 开始这种脏数据。
   */
  queryEpoch += 1
  if (pendingQuery) {
    pendingReloadAfterStale = true
    return pendingQuery.promise
  }
  return startQuery(pageSize.value, false, 'reload')
}

function refreshToPage(page: number) {
  pageNo.value = Math.max(firstPageNo.value, Math.floor(page))
  return refresh()
}

function refresh() {
  if (list.value.length === 0) {
    return reload()
  }
  setFailed(false)
  noMore.value = false
  const loadedPageCount = Math.max(1, pageNo.value - firstPageNo.value + 1)
  return startQuery(loadedPageCount * pageSize.value, true, 'refresh')
}

async function complete(data?: unknown, success = true) {
  const pending = pendingQuery
  // 过期请求的响应（例如 reload 之后才回来的加载更多）：丢弃数据，
  // 若有 reload 在等待，则立刻补发第一页请求。
  if (pending && pending.epoch !== queryEpoch) {
    pendingQuery = null
    loading.value = false
    pending.resolve(currentResult())
    endRefresh()
    if (pendingReloadAfterStale) {
      pendingReloadAfterStale = false
      void reload()
    }
    return currentResult()
  }
  const elapsed = pending ? Date.now() - pending.startedAt : 0
  const wait = Math.max(
    vpNumber(props.delay, 0),
    vpNumber(props.minDelay, 0) - elapsed,
  )
  if (wait > 0) {
    await vpWait(wait)
  }

  if (props.refresherOnly) {
    emit('reload')
  }
  if (data === false || !success) {
    // 失败时由 autoCleanListWhenReloadError 单独控制（与原版一致）
    if (props.autoCleanListWhenReloadError && pageNo.value === firstPageNo.value) {
      setList([])
    }
    setFailed(true)
    firstLoaded.value = true
    return settlePending()
  }

  if (props.refresherOnly && data == null) {
    firstLoaded.value = true
    setFailed(false)
    noMore.value = true
    return settlePending()
  }

  const items = vpItems(data, props.responseDataKey)
  if (!items) {
    setFailed(true)
    firstLoaded.value = true
    return settlePending()
  }

  if (
    replaceOnComplete
    || !props.concat
    || pageNo.value === firstPageNo.value
  ) {
    setList([...items])
  }
  else {
    // 聊天记录模式下列表整体倒置，list[0] 显示在最底部，
    // 加载更多拿到的是更早的消息，追加到末尾（即视觉上的顶部）。
    setList([...list.value, ...items])
  }
  firstLoaded.value = true
  setFailed(false)
  noMore.value = props.refresherOnly ? true : items.length < requestedPageSize
  customEmptyErrorText.value = ''

  if (props.useCache && props.cacheKey && pageNo.value === firstPageNo.value) {
    wx.setStorageSync(vpCacheName(props.cacheKey), list.value)
  }
  if (props.showRefresherUpdateTime) {
    refresherUpdateTime.value = vpNowText()
    wx.setStorageSync(
      vpUpdateTimeName(props.refresherUpdateTimeKey),
      refresherUpdateTime.value,
    )
  }
  return settlePending()
}

function completeByKey(data: unknown, key?: unknown, success = true) {
  const currentKey = currentDataKey()
  if (key != null && currentKey != null && key !== currentKey) {
    endRefresh()
    return Promise.resolve(currentResult())
  }
  return complete(data, success)
}

async function completeByNoMore(
  data: unknown,
  nomore: boolean,
  success = true,
) {
  await complete(data, success)
  if (success && data !== false) {
    noMore.value = nomore
  }
  return currentResult()
}

async function completeByTotal(data: unknown, total?: number, success = true) {
  await complete(data, success)
  if (success && data !== false && typeof total === 'number' && total >= 0) {
    noMore.value = list.value.length >= total
  }
  return currentResult()
}

function completeByError(message = '') {
  customEmptyErrorText.value = message
  return complete(false)
}

function setLocalPaging(data: unknown, success = true) {
  const all = vpItems(data, props.responseDataKey)
  localPagingList.value = all ? [...all] : null
  resetState()
  if (!all || !success) {
    return complete(false)
  }
  return complete(localPagingList.value!.slice(0, pageSize.value))
}

function addDataFromTop(data: unknown, toTop = true, animate = true) {
  setList([...vpArray(data), ...list.value])
  if (toTop) {
    scrollToTop(animate)
  }
}

function addChatRecordData(data: unknown, toBottom = true, animate = true) {
  // 聊天记录模式列表倒置：list[0] 显示在最底部，新消息要插到列表头部。
  // 传入多条时先反转，保证最后一条（最新）落在 list[0]，显示在正下方。
  setList([...[...vpArray(data)].reverse(), ...list.value])
  if (toBottom) {
    void nextTick(() => scrollToBottom(animate))
  }
}

function clean() {
  localPagingList.value = null
  setList([])
  resetState()
  firstLoaded.value = false
}

function endRefresh() {
  const delay = vpNumber(props.refresherCompleteDelay, 0)
  if (!props.useCustomRefresher) {
    if (!refreshing.value) {
      refresherStatus.value = 'default'
      return
    }
    // 原生模式下保持 `refreshing` 直到完成态展示结束，否则原生刷新区域会立即收起
    refresherStatus.value = delay > 0 ? 'complete' : 'default'
    void vpWait(delay).then(() => {
      refreshing.value = false
      refresherStatus.value = 'default'
      emit('on-restore')
    })
    return
  }
  refreshing.value = false
  refresherStatus.value = 'complete'
  void vpWait(delay).then(() => {
    /**
     * 收回必须分两步：先保持 complete 状态把高度收成 0，
     * 这样过渡时长才是 refresherCompleteDuration（缓慢收起）；
     * 若和切换 default 放在同一帧，setData 合并后时长变成 0，会瞬间弹回。
     */
    pullingDistance.value = 0
    void vpWait(vpNumber(props.refresherCompleteDuration, 300)).then(() => {
      refresherStatus.value = 'default'
      emit('on-restore')
    })
  })
}

function closeF2() {
  f2Visible.value = false
  pullingDistance.value = 0
  refresherStatus.value = 'default'
  emit('refresher-f2-change', false)
}

/**
 * 测量自定义下拉刷新视图的自然高度。
 * 刷新中/完成态需要撑到这个高度，否则会把用户自定义的刷新视图裁成一条细线。
 */
function updateCustomRefresherHeight() {
  if (!props.useCustomRefresher) {
    return
  }
  void queryRect(`#${uid} .z-paging-wevu__refresher-inner`).then((rect) => {
    if (!rect || rect.height <= 0) {
      return
    }
    customRefresherHeight.value = rect.height
    // 仅在刷新中补齐高度；完成态靠 beginRefresher 设定值，避免异步测量把已收起的高度又撑开
    if (refreshing.value) {
      pullingDistance.value = Math.max(pullingDistance.value, rect.height)
    }
  })
}

function doLoadMore(type: 'click' | 'toBottom' = 'click') {
  if (type === 'toBottom' && !props.toBottomLoadingMoreEnabled) {
    return
  }
  pageReachBottom()
}

function pageReachBottom() {
  if (
    props.layoutOnly
    || props.refresherOnly
    || !props.loadingMoreEnabled
    || loading.value
    || noMore.value
  ) {
    return
  }
  if (failed.value) {
    setFailed(false)
  }
  else {
    pageNo.value += 1
  }
  void startQuery(pageSize.value, false, 'load-more')
}

function doChatRecordLoadMore() {
  pageReachBottom()
}

function scrollToY(y: number, offset = 0, animate = false) {
  const target = Math.max(0, y - offset)
  scrollWithAnimation.value = animate
  if (isPageScroll()) {
    scrollTop.value = target
    wx.pageScrollTo({ scrollTop: target, duration: animate ? 100 : 0 })
    return
  }
  /**
   * `scroll-top` 是受控值，只有「值发生变化」时 scroll-view 才会滚动。
   * 受控值不一定跟随用户手势（`@scroll` 只同步了 scrollTop），
   * 所以先给一个与目标不同的中间值，确保这次设置一定被 scroll-view 感知。
   */
  const current = scrollTop.value
  const seed = current === target ? (target === 0 ? 1 : target - 1) : current
  scrollViewTop.value = seed
  setTimeout(() => {
    scrollViewTop.value = target
  }, 0)
}

function scrollToX(x: number, offset = 0, animate = false) {
  if (isPageScroll()) {
    return
  }
  scrollWithAnimation.value = animate
  scrollViewLeft.value = Math.max(0, x - offset)
}

function scrollToTop(animate = false) {
  // 聊天记录模式 scroll-view 已倒置，视觉顶部对应滚动区末尾
  scrollToY(
    props.useChatRecordMode ? Math.max(contentHeight.value, 999999) : 0,
    0,
    animate,
  )
}

function scrollToBottom(animate = false) {
  scrollToY(
    props.useChatRecordMode ? 0 : Math.max(contentHeight.value, 999999),
    0,
    animate,
  )
}

function scrollIntoViewByNodeTop(top: number, offset = 0, animate = false) {
  scrollToY(scrollTop.value + top, offset, animate)
}

function scrollIntoViewById(id: string, offset = 0, animate = false) {
  const selector = `#${id.replace(/^#/, '')}`
  void Promise.all([
    queryRect(selector),
    queryRect(`#${uid} .z-paging-wevu__scroll`),
  ]).then(([target, container]) => {
    if (!target) {
      return
    }
    const base = isPageScroll()
      ? scrollTop.value + target.top
      : scrollTop.value + target.top - (container?.top ?? 0)
    scrollToY(base, offset, animate)
  })
}

function scrollIntoViewByIndex(index: number, offset = 0, animate = false) {
  if (props.useVirtualList) {
    scrollToY(virtual.getCellOffset(index), offset, animate)
    return
  }
  scrollIntoViewById(`${uid}-cell-${index}`, offset, animate)
}

function scrollIntoViewByView(view: string, offset = 0, animate = false) {
  scrollIntoViewById(view, offset, animate)
}

/**
 * 判断是否已经滚动到末尾并触发加载更多。
 *
 * 聊天记录模式倒置后，视觉顶部才对应滚动区末尾；虚拟列表在滚动中还会不断测量
 * cell 高度、内容高度跟着变。这两种模式都容易出现“刚好停在末尾”，而停在末尾后
 * 不再产生新的 scroll 事件，就会表现为“到底了不加载，要回拉一点点再拉”。
 * 因此它们提前半屏预加载；其余模式再在 scrollend 时兜底判断一次。
 */
function checkReachBottomEnd(scrollHeight: number, top: number) {
  if (isPageScroll() || props.layoutOnly || props.refresherOnly) {
    return
  }
  // 部分基础库的 scroll 事件不带 scrollHeight，退回用测量到的内容高度
  const total = scrollHeight > 0 ? scrollHeight : contentHeight.value
  if (total <= 0) {
    return
  }
  // 虚拟列表（含非内置列表写法）与聊天记录模式都提前半屏预加载
  const prefetchDistance
    = props.useChatRecordMode || props.useVirtualList
      ? viewportHeight.value * 0.5
      : 0
  const threshold = vpPx(props.lowerThreshold, 50) + prefetchDistance
  if (total - top - viewportHeight.value <= threshold) {
    doLoadMore('toBottom')
  }
}

function handleScroll(event: {
  detail?: { scrollTop?: number, scrollHeight?: number, scrollLeft?: number }
}) {
  const detail = event?.detail ?? {}
  const top = detail.scrollTop ?? 0
  scrollTop.value = top
  emit('scroll', event)
  emit('scroll-top-change', top)
  if (top !== lastScrollTop) {
    emit('scroll-direction-change', top < lastScrollTop ? 'top' : 'bottom')
    lastScrollTop = top
  }
  const scrollHeight = detail.scrollHeight ?? 0
  if (scrollHeight > 0) {
    lastScrollHeight = scrollHeight
  }
  checkReachBottomEnd(scrollHeight, top)
}

/**
 * 手势滚动结束后再兜底判断一次：
 * 用户一甩到底后不再产生 scroll 事件，仅靠 handleScroll 会漏掉最后一次判定。
 */
function handleScrollEnd(event: unknown) {
  emit('scrollend', event)
  checkReachBottomEnd(lastScrollHeight, scrollTop.value)
}

function handleScrollToLower() {
  emit('scrolltolower')
  // 聊天记录模式列表倒置后，滚动区末尾对应视觉顶部，那里才是更早的消息
  doLoadMore('toBottom')
}

function handleScrollToUpper() {
  emit('scrolltoupper')
}

function handleRefresherRefresh() {
  if (props.layoutOnly) {
    return
  }
  beginRefresher()
  emit('on-refresh')
  if (props.refresherOnly || !props.reloadWhenRefresh) {
    return
  }
  resetState()
  emit('reload')
  void startQuery(pageSize.value, false, 'user-pull-down')
}

function handleNativeRefresherPulling(event?: {
  detail?: { dy?: number }
}) {
  if (props.useCustomRefresher || refreshing.value) {
    return
  }
  const dy = Number(event?.detail?.dy ?? 0)
  const threshold = vpPx(props.refresherThreshold, 40)
  refresherStatus.value = dy >= threshold ? 'release-to-refresh' : 'default'
}

function eventY(event: {
  touches?: Array<{ clientY?: number, pageY?: number }>
  changedTouches?: Array<{ clientY?: number, pageY?: number }>
}) {
  const touch = event.touches?.[0] ?? event.changedTouches?.[0]
  return touch?.clientY ?? touch?.pageY ?? 0
}

function handleTouchStart(event: Parameters<typeof eventY>[0]) {
  const y = eventY(event)
  if (props.watchTouchDirectionChange && lastTouchY >= 0 && y !== lastTouchY) {
    emit('touch-direction-change', y < lastTouchY ? 'top' : 'bottom')
  }
  lastTouchY = y
  // 同一个手势可能同时命中 scroll-view 内容层与根节点，只记录一次
  if (touchStartY >= 0) {
    return
  }
  if (
    !props.refresherEnabled
    || !props.useCustomRefresher
    || scrollTop.value > 0
    || refreshing.value
  ) {
    return
  }
  touchStartY = y
  emit('refresher-touchstart', y)
}

function handleTouchMove(event: Parameters<typeof eventY>[0]) {
  const y = eventY(event)
  if (touchStartY < 0) {
    return
  }
  const dy = y - touchStartY
  if (dy <= 0) {
    pullingDistance.value = 0
    return
  }
  const threshold = vpPx(props.refresherThreshold, 40)
  const rawDistance = dy * props.refresherPullRate
  const pulled
    = rawDistance > threshold
      ? threshold + (rawDistance - threshold) * props.refresherOutRate
      : rawDistance
  /**
   * 最大下拉距离取三者最大值：
   * 自定义刷新视图自然高度（保证能完整露出）、
   * 二楼触发阈值（否则开了二楼永远拉不到触发线，二楼就进不去）。
   */
  const f2Distance = props.refresherF2Enabled
    ? vpPx(props.refresherF2Threshold, 100) + threshold
    : 0
  const maxDistance = customRefresherHeight.value > 0
    ? Math.max(threshold, customRefresherHeight.value, f2Distance)
    : Number.POSITIVE_INFINITY
  pullingDistance.value = Math.min(pulled, maxDistance)
  const previous = refresherStatus.value
  refresherStatus.value
    = props.refresherF2Enabled
      && pullingDistance.value >= vpPx(props.refresherF2Threshold, 100)
      ? 'go-f2'
      : pullingDistance.value >= threshold
        ? 'release-to-refresh'
        : 'default'
  if (
    previous !== refresherStatus.value
    && refresherStatus.value !== 'default'
    && props.refresherVibrate
  ) {
    wx.vibrateShort({ type: 'light' })
  }
  emit('refresher-touchmove', {
    pullingDistance: pullingDistance.value,
    dy,
    viewHeight: viewportHeight.value,
    rate: props.refresherPullRate,
  })
}

function handleTouchEnd(event: Parameters<typeof eventY>[0]) {
  const y = eventY(event)
  if (touchStartY < 0) {
    return
  }
  emit('refresher-touchend', y)
  touchStartY = -1
  if (refresherStatus.value === 'go-f2' && props.showRefresherF2) {
    f2Visible.value = true
    emit('refresher-f2-change', true)
    pullingDistance.value = 0
    refresherStatus.value = 'default'
  }
  else if (refresherStatus.value === 'release-to-refresh') {
    handleRefresherRefresh()
  }
  else {
    pullingDistance.value = 0
    refresherStatus.value = 'default'
  }
}

function handleContentTouch() {
  if (props.useChatRecordMode && props.autoHideKeyboardWhenChat) {
    wx.hideKeyboard()
    emit('hided-keyboard')
  }
}

function addKeyboardHeightChangeListener() {
  if (keyboardListener) {
    return
  }
  keyboardListener = (result: { height: number }) => {
    if (!props.useChatRecordMode) {
      return
    }
    keyboardHeight.value = result.height
    emit('keyboard-height-change', { height: result.height })
    if (result.height > 0 && props.autoToBottomWhenChat) {
      scrollToBottom(true)
    }
  }
  wx.onKeyboardHeightChange(keyboardListener)
}

function handleEmptyViewReload() {
  let allow = true
  emit('empty-view-reload', (value?: boolean) => {
    allow = value !== false
  })
  if (allow) {
    void reload()
  }
}

function handleBackToTopClick() {
  let allow = true
  emit('back-to-top-click', (value?: boolean) => {
    allow = value !== false
  })
  if (allow) {
    scrollToTop(props.backToTopWithAnimate)
  }
}

function updateCache() {
  if (props.useCache && props.cacheKey) {
    wx.setStorageSync(
      vpCacheName(props.cacheKey),
      list.value.slice(0, pageSize.value),
    )
  }
}

/** 内置列表模式 cell 由组件渲染，非内置模式按约定使用 `zp-id-${index}` */
function virtualCellSelector(index: number) {
  return isInnerVirtualList.value ? `#${uid}-cell-${index}` : `#zp-id-${index}`
}

function didUpdateVirtualListCell(index: number) {
  void queryRect(virtualCellSelector(index)).then((rect) => {
    if (rect) {
      virtual.setCellHeight(index, rect.height)
    }
  })
}

/**
 * 动态高度模式下，批量测量当前渲染出来的 cell 高度（一次 SelectorQuery 完成）。
 *
 * 不做自动测量时，所有 cell 都只能用默认高度估算，
 * 占位高度与实际内容高度严重偏离，表现就是滚动位置和内容对不上、来回跳。
 */
function measureVirtualCells(retry = true) {
  if (props.cellHeightMode !== 'dynamic' || !props.useVirtualList) {
    return
  }
  // 每个 index 只量一次，已量过的不再重复测量，避免引发反复重排
  const cells = virtual.renderList.value.filter(
    cell => !virtual.hasCellHeight(cell.index),
  )
  if (!cells.length) {
    return
  }
  const query = selectorQuery()
  if (!query) {
    return
  }
  cells.forEach((cell) => {
    query.select(virtualCellSelector(cell.index)).boundingClientRect()
  })
  query.exec((result) => {
    const rects = (Array.isArray(result) ? result : [result]) as Array<{
      height?: number
    } | null>
    const measured = rects.filter(rect => Number(rect?.height ?? 0) > 0).length
    const changed = virtual.setCellHeights(
      cells.map((cell, index) => ({
        index: cell.index,
        height: Number(rects[index]?.height ?? 0),
      })),
    )
    if (changed) {
      // 占位高度变了，内容总高跟着变，同步一次以便末尾判定用最新的高度
      void nextTick().then(updateContentHeight)
    }
    // 非内置列表模式下页面渲染可能晚一拍（cell 还没进 DOM），补测一次
    if (!measured && retry) {
      void vpWait(80).then(() => measureVirtualCells(false))
    }
  })
}

const api: ZPagingWevuApi = {
  reload,
  refresh,
  refreshToPage,
  complete,
  completeByKey,
  completeByNoMore,
  completeByTotal,
  completeByError,
  setLocalPaging,
  addDataFromTop,
  clean,
  clear: clean,
  endRefresh,
  updateCustomRefresherHeight,
  closeF2,
  doLoadMore,
  pageReachBottom,
  scrollToTop,
  scrollToBottom,
  scrollToY,
  scrollToX,
  scrollIntoViewById,
  scrollIntoViewByIndex,
  scrollIntoViewByNodeTop,
  scrollIntoViewByView,
  doInsertVirtualListItem: virtual.doInsertVirtualListItem,
  didUpdateVirtualListCell,
  didDeleteVirtualListCell: virtual.didDeleteVirtualListCell,
  updateVirtualListRender: virtual.update,
  doChatRecordLoadMore,
  addChatRecordData,
  setLocale: (locale: ZPagingWevuLocaleInput) => setPagingLocale(locale),
  getLocale: () => getPagingLocale(),
  addKeyboardHeightChangeListener,
  updatePageScrollTop: (top: number) => {
    scrollTop.value = top
    emit('scroll-top-change', top)
  },
  updatePageScrollTopHeight,
  updatePageScrollBottomHeight,
  updateLeftAndRightWidth,
  updateFixedLayout,
  updateCache,
  getVersion: () => '2.8.9-wevu',
  setListSpecialEffects: () => {},
  setSpecialEffects: () => {},
}

defineExpose({ ...api })

/**
 * 末尾哨兵观察器（兜底）。
 *
 * 只靠 scroll 事件判断“是否到底”是边沿触发的：一旦用户停在底部、
 * 或内容高度在最后一次事件之后又变了，就不会再有事件，
 * 表现就是“到底了不加载，要往回拉一下再拉”。
 * 哨兵进入视口时交集观察器一定会回调，用它兜住这次判定。
 */
const bottomSentinel = useElementIntersectionObserver<{
  intersectionRatio?: number
}>({
  selector: `#${uid}-sentinel`,
  relativeToViewport: { bottom: 0 },
  onObserve: (result) => {
    if ((result?.intersectionRatio ?? 0) <= 0) {
      return
    }
    if (props.layoutOnly || props.refresherOnly) {
      return
    }
    // 内容不足一屏时是否自动加载交给 inside-more 控制，避免短列表无限加载
    if (
      !props.insideMore
      && contentHeight.value > 0
      && contentHeight.value <= viewportHeight.value
    ) {
      return
    }
    doLoadMore('toBottom')
  },
})

onMounted(() => {
  props.controller?.bind(api)
  if (props.useCache && props.cacheKey) {
    const cached = wx.getStorageSync(vpCacheName(props.cacheKey))
    if (Array.isArray(cached) && cached.length) {
      setList(cached)
    }
  }
  if (props.showRefresherUpdateTime) {
    refresherUpdateTime.value
      = wx.getStorageSync(vpUpdateTimeName(props.refresherUpdateTimeKey)) || ''
  }
  addKeyboardHeightChangeListener()
  updateFixedLayout()
  updatePageScrollTopHeight()
  updatePageScrollBottomHeight()
  updateLeftAndRightWidth()
  if (props.auto && !props.layoutOnly && !props.refresherOnly) {
    setTimeout(() => void reload(), 0)
  }
  void nextTick().then(() => bottomSentinel.observe())
  if (props.useCustomRefresher) {
    // 先量一次自定义刷新视图高度，避免首次刷新时高度不准
    void nextTick().then(() => updateCustomRefresherHeight())
  }
})

onUnmounted(() => {
  bottomSentinel.disconnect()
  props.controller?.unbind(api)
  if (keyboardListener) {
    wx.offKeyboardHeightChange(keyboardListener)
    keyboardListener = null
  }
  if (renderTimer) {
    clearTimeout(renderTimer)
  }
})
</script>

<template>
  <view
    :id="uid"
    class="z-paging-wevu"
    :class="[
      {
        'z-paging-wevu--fixed': fixed && !usePageScroll,
        'z-paging-wevu--fill': !usePageScroll && !fixed,
        'z-paging-wevu--chat': useChatRecordMode,
      },
      pagingClass,
    ]"
    :style="[
      `--vp-fixed-top:${fixedTop || 0}px;--vp-bg:${bgColor || 'transparent'};--vp-height:${height || (!usePageScroll && !fixed ? '100%' : 'auto')};--vp-width:${width || '100%'};--vp-max-width:${maxWidth || 'none'};--vp-min-height:${autoFullHeight && isPageScroll() ? `${metrics.windowHeight - (fixedTop || 0)}px` : '0px'}`,
      pagingStyle,
    ]"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <view
      v-if="useRefresherStatusBarPlaceholder"
      :style="`height:${metrics.statusBarHeight}px;`"
    />
    <view class="z-paging-wevu__layout">
      <view
        class="z-paging-wevu__left"
        :style="`width:${leftWidth ? `${leftWidth}px` : 'auto'};`"
      >
        <slot name="left" />
      </view>

      <view class="z-paging-wevu__main">
        <template v-if="!usePageScroll">
          <view v-if="topSlotOutside" class="z-paging-wevu__top">
            <slot name="top" />
          </view>

          <scroll-view
            class="z-paging-wevu__scroll"
            :class="{ 'z-paging-wevu__scroll--flex': topSlotOutside }"
            :style="[
              topSlotOutside || !fixed ? '' : `--vp-scroll-height:${viewportHeight}px`,
              { backgroundColor: bgColorContent },
            ]"
            :scroll-y="scrollable && (!refreshing || refresherRefreshingScrollable)"
            :scroll-top="scrollViewTop"
            :scroll-left="scrollViewLeft"
            :scroll-with-animation="scrollWithAnimation"
            :show-scrollbar="showScrollbar"
            :refresher-enabled="
              refresherEnabled
                && !layoutOnly
                && !useCustomRefresher
                && !useChatRecordMode
            "
            :refresher-triggered="refreshing && !useChatRecordMode"
            :refresher-threshold="refresherThreshold"
            :refresher-default-style="refresherDefaultStyle"
            :refresher-background="refresherBackground || bgColor || '#ffffff'"
            :lower-threshold="lowerThreshold"
            @refresherpulling="handleNativeRefresherPulling"
            @refresherrefresh="handleRefresherRefresh"
            @scrolltolower="handleScrollToLower"
            @scrolltoupper="handleScrollToUpper"
            @scroll="handleScroll"
            @scrollend="handleScrollEnd"
          >
            <!-- 自定义下拉刷新的手势需要绑定在 scroll-view 内容层，否则 scroll-view 会吞掉父级的 touchmove -->
            <view
              class="z-paging-wevu__touch"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
              @touchcancel="handleTouchEnd"
            >
              <view v-if="!topSlotOutside" class="z-paging-wevu__top">
                <slot name="top" />
              </view>

            <view
              v-if="
                !useCustomRefresher
                  && refresherEnabled
                  && refresherDefaultStyle === 'none'
                  && !useChatRecordMode
              "
              class="z-paging-wevu__refresher-hint"
              :style="`height:${refresherHintHeight}px;margin-top:-${refresherHintHeight}px;background:${refresherBackground || bgColor || 'transparent'};`"
            >
              <view
                v-if="refresherStatus === 'loading'"
                class="z-paging-wevu__refresher-spinner"
                :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
              />
              <image
                v-else-if="refresherStatus === 'complete'"
                class="z-paging-wevu__refresher-arrow"
                :src="refresherCompleteIconSrc"
              />
              <image
                v-else
                class="z-paging-wevu__refresher-arrow"
                :class="{ 'z-paging-wevu__refresher-arrow--down': refresherStatus !== 'release-to-refresh' }"
                :src="refresherArrowSrc"
              />
              <text class="z-paging-wevu__refresher-text">{{ refresherText }}</text>
              <text
                v-if="showRefresherUpdateTime && refresherUpdateTime"
                class="z-paging-wevu__refresher-time"
                :style="refresherUpdateTimeStyle"
              >
                {{ refresherUpdateTimeTitle }}{{ refresherUpdateTime }}
              </text>
            </view>

            <view
              v-if="useCustomRefresher"
              class="z-paging-wevu__refresher"
              :style="`height:${pullingDistance}px;transition-duration:${refresherStatus === 'complete' ? refresherCompleteDuration : (refresherStatus === 'loading' ? refresherDefaultDuration : 0)}ms;background:${refresherBackground || bgColor || 'transparent'};`"
            >
              <!-- 内层容器保持自然高度，用于测量自定义刷新视图的真实高度 -->
              <view class="z-paging-wevu__refresher-inner">
              <slot v-if="refresherStatus === 'go-f2'" name="refresherF2">
                <text class="z-paging-wevu__refresher-text">松手进入二楼</text>
              </slot>
              <slot v-else name="refresher" :refresherStatus="refresherStatus">
                <image
                  v-if="!refresherImage && refresherStatus === 'complete'"
                  class="z-paging-wevu__refresher-arrow"
                  :src="refresherCompleteIconSrc"
                  :style="refresherImgStyle"
                />
                <image
                  v-else-if="!refresherImage && refresherStatus !== 'loading'"
                  class="z-paging-wevu__refresher-arrow"
                  :class="{ 'z-paging-wevu__refresher-arrow--down': refresherStatus !== 'release-to-refresh' }"
                  :src="refresherArrowSrc"
                  :style="refresherImgStyle"
                />
                <view
                  v-else-if="!refresherImage && refresherStatus === 'loading'"
                  class="z-paging-wevu__refresher-spinner"
                  :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
                  :style="refresherImgStyle"
                />
                <image
                  v-if="refresherImage"
                  class="z-paging-wevu__refresher-img"
                  :class="{
                    'z-paging-wevu__refresher-img--animated':
                      refresherStatus === 'loading'
                      && refresherRefreshingAnimated,
                  }"
                  :src="refresherImage"
                  :style="refresherImgStyle"
                />
                <text
                  class="z-paging-wevu__refresher-text"
                  :style="refresherTitleStyle"
                >
                  {{ refresherText }}
                </text>
                <text
                  v-if="showRefresherUpdateTime && refresherUpdateTime"
                  class="z-paging-wevu__refresher-time"
                  :style="refresherUpdateTimeStyle"
                >
                  {{ refresherUpdateTimeTitle }}{{ refresherUpdateTime }}
                  </text>
                  </slot>
                  </view>
                  </view>

                  <view
                  class="z-paging-wevu__content"
              :class="pagingContentClass"
              :style="[{ backgroundColor: bgColorContent }, pagingContentStyle]"
              @click="handleContentTouch"
            >
              <view v-if="showLoading" class="z-paging-wevu__loading">
                <slot name="loading">
                  <text class="z-paging-wevu__more-text">{{ systemLoadingText }}</text>
                </slot>
              </view>

              <template v-if="useVirtualList && isInnerVirtualList">
                <slot name="header" />
                <view class="z-paging-wevu__virtual" :style="innerListStyle">
                  <view :style="`height:${virtualView.placeholderTop}px;`" />
                  <view
                    v-for="cell in virtualView.renderList"
                    :id="`${uid}-cell-${cell.index}`"
                    :key="cell.zp_index"
                    class="z-paging-wevu__cell"
                    :style="innerCellStyle"
                    @click="emit('inner-cell-click', cell.item, cell.index)"
                  >
                    <slot name="cell" :item="cell.item" :index="cell.index">
                      {{
                        cell.item
                      }}
                    </slot>
                  </view>
                  <view
                    :style="`height:${virtualView.placeholderBottom}px;`"
                  />
                </view>
                <slot name="footer" />
              </template>
              <!-- 内置列表模式：由组件渲染列表，cell 内容通过 #cell 插槽提供 -->
              <template v-else-if="useInnerList">
                <slot name="header" />
                <view
                  v-for="(item, index) in list"
                  :key="index"
                  class="z-paging-wevu__cell"
                  :style="innerCellStyle"
                  @click="emit('inner-cell-click', item, Number(index))"
                >
                  <slot name="cell" :item="item" :index="index">
                    {{ item }}
                  </slot>
                </view>
                <slot name="footer" />
              </template>
              <slot v-else />

              <!--
                聊天记录模式：列表整体倒置，DOM 末尾才是视觉顶部，
                因此加载历史消息 / 无更多消息放在列表之后（视觉顶部，更早消息一侧）。
              -->
              <view
                v-if="
                  useChatRecordMode && (loading || showChatLoadingWhenReload)
                "
                class="z-paging-wevu__chat-loading"
              >
                <slot name="chatLoading" :loadingMoreStatus="loadingStatus">
                  <view
                    class="z-paging-wevu__refresher-spinner z-paging-wevu__refresher-spinner--animated"
                  />
                </slot>
              </view>
              <!-- 与原版一致：无更多消息时不显示任何内置文案，仅在提供 chatNoMore 插槽时展示 -->
              <view
                v-if="useChatRecordMode && noMore"
                class="z-paging-wevu__chat-no-more"
              >
                <slot name="chatNoMore" />
              </view>

              <view
                v-if="showEmpty"
                class="z-paging-wevu__empty"
                :class="{
                  'z-paging-wevu__empty--fixed': emptyViewFixed,
                  'z-paging-wevu__empty--center': emptyViewCenter,
                }"
                :style="emptyViewSuperStyle"
                @click="emit('empty-view-click')"
              >
                <slot name="empty" :isLoadFailed="failed || isLoadFailed">
                  <image
                    v-if="emptyImage"
                    class="z-paging-wevu__empty-img"
                    :src="emptyImage"
                  />
                  <text class="z-paging-wevu__empty-text">
                    {{
                      customEmptyErrorText || emptyText
                    }}
                  </text>
                  <view
                    v-if="showEmptyReload"
                    id="z-paging-wevu-empty-reload"
                    class="z-paging-wevu__empty-reload"
                    @click.stop="handleEmptyViewReload"
                  >
                    {{ emptyReloadText }}
                  </view>
                </slot>
              </view>

              <view
                v-if="showLoadingMore"
                class="z-paging-wevu__more"
                :style="loadingMoreCustomStyle"
                @click="doLoadMore('click')"
              >
                <slot v-if="failed" name="loadingMoreFail">
                  <text
                    class="z-paging-wevu__more-text"
                    :style="loadingMoreTitleCustomStyle"
                  >
                    {{ loadingMoreText }}
                  </text>
                </slot>
                <slot
                  v-else-if="loading || loadingMoreDefaultAsLoading"
                  name="loadingMoreLoading"
                >
                  <image
                    v-if="loadingMoreLoadingIconCustomImage"
                    class="z-paging-wevu__more-icon"
                    :src="loadingMoreLoadingIconCustomImage"
                    :style="loadingMoreLoadingIconCustomStyle"
                  />
                  <text
                    class="z-paging-wevu__more-text"
                    :style="loadingMoreTitleCustomStyle"
                  >
                    {{ loadingMoreText }}
                  </text>
                </slot>
                <slot v-else-if="noMore" name="loadingMoreNoMore">
                  <view
                    v-if="showLoadingMoreNoMoreLine"
                    class="z-paging-wevu__no-more-line"
                    :style="loadingMoreNoMoreLineCustomStyle"
                  />
                  <text
                    class="z-paging-wevu__more-text"
                    :style="loadingMoreTitleCustomStyle"
                  >
                    {{ loadingMoreText }}
                  </text>
                  <view
                    v-if="showLoadingMoreNoMoreLine"
                    class="z-paging-wevu__no-more-line z-paging-wevu__no-more-line--right"
                    :style="loadingMoreNoMoreLineCustomStyle"
                  />
                </slot>
                <slot v-else name="loadingMoreDefault">
                  <text
                    v-if="showDefaultLoadingMoreText"
                    class="z-paging-wevu__more-text"
                    :style="loadingMoreTitleCustomStyle"
                  >
                    {{ loadingMoreText }}
                  </text>
                </slot>
              </view>
              <!-- 末尾哨兵：交给 IntersectionObserver 兜底，避免“停在底部但没有新的 scroll 事件”导致不触发加载 -->
              <view
                :id="`${uid}-sentinel`"
                class="z-paging-wevu__sentinel"
              />
              </view>
            </view>
          </scroll-view>
        </template>

        <template v-else>
          <view
            class="z-paging-wevu__top"
            :class="{ 'z-paging-wevu__top--sticky': stickyTop }"
          >
            <slot name="top" />
          </view>

          <view
            v-if="
              !useCustomRefresher
                && refresherEnabled
                && refresherDefaultStyle === 'none'
                && !useChatRecordMode
            "
            class="z-paging-wevu__refresher-hint"
            :style="`height:${refresherHintHeight}px;margin-top:-${refresherHintHeight}px;background:${refresherBackground || bgColor || 'transparent'};`"
          >
            <view
              v-if="refresherStatus === 'loading'"
              class="z-paging-wevu__refresher-spinner"
              :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
            />
            <image
              v-else-if="refresherStatus === 'complete'"
              class="z-paging-wevu__refresher-arrow"
              :src="refresherCompleteIconSrc"
            />
            <image
              v-else
              class="z-paging-wevu__refresher-arrow"
              :class="{ 'z-paging-wevu__refresher-arrow--down': refresherStatus !== 'release-to-refresh' }"
              :src="refresherArrowSrc"
            />
            <text class="z-paging-wevu__refresher-text">{{ refresherText }}</text>
            <text
              v-if="showRefresherUpdateTime && refresherUpdateTime"
              class="z-paging-wevu__refresher-time"
              :style="refresherUpdateTimeStyle"
            >
              {{ refresherUpdateTimeTitle }}{{ refresherUpdateTime }}
            </text>
          </view>

          <view
            v-if="useCustomRefresher"
            class="z-paging-wevu__refresher"
            :style="`height:${pullingDistance}px;transition-duration:${refresherStatus === 'complete' ? refresherCompleteDuration : (refresherStatus === 'loading' ? refresherDefaultDuration : 0)}ms;background:${refresherBackground || bgColor || 'transparent'};`"
          >
            <!-- 内层容器保持自然高度，用于测量自定义刷新视图的真实高度 -->
            <view class="z-paging-wevu__refresher-inner">
            <slot v-if="refresherStatus === 'go-f2'" name="refresherF2">
              <text class="z-paging-wevu__refresher-text">松手进入二楼</text>
            </slot>
            <slot v-else name="refresher" :refresherStatus="refresherStatus">
              <image
                v-if="!refresherImage && refresherStatus === 'complete'"
                class="z-paging-wevu__refresher-arrow"
                :src="refresherCompleteIconSrc"
                :style="refresherImgStyle"
              />
              <image
                v-else-if="!refresherImage && refresherStatus !== 'loading'"
                class="z-paging-wevu__refresher-arrow"
                :class="{ 'z-paging-wevu__refresher-arrow--down': refresherStatus !== 'release-to-refresh' }"
                :src="refresherArrowSrc"
                :style="refresherImgStyle"
              />
              <view
                v-else-if="!refresherImage && refresherStatus === 'loading'"
                class="z-paging-wevu__refresher-spinner"
                :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
                :style="refresherImgStyle"
              />
              <image
                v-if="refresherImage"
                class="z-paging-wevu__refresher-img"
                :src="refresherImage"
                :style="refresherImgStyle"
              />
              <text
                class="z-paging-wevu__refresher-text"
                :style="refresherTitleStyle"
              >
                {{ refresherText }}
              </text>
              <text
                v-if="showRefresherUpdateTime && refresherUpdateTime"
                class="z-paging-wevu__refresher-time"
                :style="refresherUpdateTimeStyle"
              >
                {{ refresherUpdateTimeTitle }}{{ refresherUpdateTime }}
              </text>
            </slot>
            </view>
          </view>

          <view
            class="z-paging-wevu__content"
            :class="pagingContentClass"
            :style="[{ backgroundColor: bgColorContent }, pagingContentStyle]"
            @click="handleContentTouch"
          >
            <view v-if="showLoading" class="z-paging-wevu__loading">
              <slot name="loading">
                <text class="z-paging-wevu__more-text">{{ systemLoadingText }}</text>
              </slot>
            </view>
            <template v-if="useVirtualList && isInnerVirtualList">
              <slot name="header" />
              <view class="z-paging-wevu__virtual" :style="innerListStyle">
                <view :style="`height:${virtualView.placeholderTop}px;`" />
                <view
                  v-for="cell in virtualView.renderList"
                  :id="`${uid}-cell-${cell.index}`"
                  :key="cell.zp_index"
                  class="z-paging-wevu__cell"
                  :style="innerCellStyle"
                  @click="emit('inner-cell-click', cell.item, cell.index)"
                >
                  <slot name="cell" :item="cell.item" :index="cell.index">
                    {{
                      cell.item
                    }}
                  </slot>
                </view>
                <view :style="`height:${virtualView.placeholderBottom}px;`" />
              </view>
              <slot name="footer" />
            </template>
            <!-- 内置列表模式：由组件渲染列表，cell 内容通过 #cell 插槽提供 -->
            <template v-else-if="useInnerList">
              <slot name="header" />
              <view
                v-for="(item, index) in list"
                :key="index"
                class="z-paging-wevu__cell"
                :style="innerCellStyle"
                @click="emit('inner-cell-click', item, Number(index))"
              >
                <slot name="cell" :item="item" :index="index">
                  {{ item }}
                </slot>
              </view>
              <slot name="footer" />
            </template>
            <slot v-else />

            <!-- 聊天记录模式下加载历史消息 / 无更多消息位于列表之后（视觉顶部） -->
            <view
              v-if="useChatRecordMode && (loading || showChatLoadingWhenReload)"
              class="z-paging-wevu__chat-loading"
            >
              <slot name="chatLoading" :loadingMoreStatus="loadingStatus">
                <view
                  class="z-paging-wevu__refresher-spinner z-paging-wevu__refresher-spinner--animated"
                />
              </slot>
            </view>
            <view
              v-if="useChatRecordMode && noMore"
              class="z-paging-wevu__chat-no-more"
            >
              <slot name="chatNoMore" />
            </view>

            <view
              v-if="showEmpty"
              class="z-paging-wevu__empty"
              :class="{
                'z-paging-wevu__empty--fixed': emptyViewFixed,
                'z-paging-wevu__empty--center': emptyViewCenter,
              }"
              :style="emptyViewSuperStyle"
              @click="emit('empty-view-click')"
            >
              <slot name="empty" :isLoadFailed="failed || isLoadFailed">
                <image
                  v-if="emptyImage"
                  class="z-paging-wevu__empty-img"
                  :src="emptyImage"
                />
                <text class="z-paging-wevu__empty-text">
                  {{
                    customEmptyErrorText || emptyText
                  }}
                </text>
                <view
                  v-if="showEmptyReload"
                  id="z-paging-wevu-empty-reload"
                  class="z-paging-wevu__empty-reload"
                  @click.stop="handleEmptyViewReload"
                >
                  {{ emptyReloadText }}
                </view>
              </slot>
            </view>

            <view
              v-if="showLoadingMore"
              class="z-paging-wevu__more"
              :style="loadingMoreCustomStyle"
              @click="doLoadMore('click')"
            >
              <slot v-if="failed" name="loadingMoreFail">
                <text
                  class="z-paging-wevu__more-text"
                  :style="loadingMoreTitleCustomStyle"
                >
                  {{ loadingMoreText }}
                </text>
              </slot>
              <slot
                v-else-if="loading || loadingMoreDefaultAsLoading"
                name="loadingMoreLoading"
              >
                <text
                  class="z-paging-wevu__more-text"
                  :style="loadingMoreTitleCustomStyle"
                >
                  {{ loadingMoreText }}
                </text>
              </slot>
              <slot v-else-if="noMore" name="loadingMoreNoMore">
                <view
                  v-if="showLoadingMoreNoMoreLine"
                  class="z-paging-wevu__no-more-line"
                  :style="loadingMoreNoMoreLineCustomStyle"
                />
                <text
                  class="z-paging-wevu__more-text"
                  :style="loadingMoreTitleCustomStyle"
                >
                  {{ loadingMoreText }}
                </text>
                <view
                  v-if="showLoadingMoreNoMoreLine"
                  class="z-paging-wevu__no-more-line z-paging-wevu__no-more-line--right"
                  :style="loadingMoreNoMoreLineCustomStyle"
                />
              </slot>
              <slot v-else name="loadingMoreDefault">
                <text
                  v-if="showDefaultLoadingMoreText"
                  class="z-paging-wevu__more-text"
                  :style="loadingMoreTitleCustomStyle"
                >
                  {{ loadingMoreText }}
                </text>
              </slot>
            </view>
            <!-- 末尾哨兵：IntersectionObserver 兜底触发加载 -->
            <view
              :id="`${uid}-sentinel`"
              class="z-paging-wevu__sentinel"
            />
          </view>
        </template>
      </view>

      <view
        class="z-paging-wevu__right"
        :style="`width:${rightWidth ? `${rightWidth}px` : 'auto'};`"
      >
        <slot name="right" />
      </view>
    </view>

    <view
      class="z-paging-wevu__bottom"
      :style="`${bottomStyle}`"
    >
      <slot name="bottom" />
    </view>

    <view
      v-if="safeAreaInsetBottom || useSafeAreaPlaceholder"
      class="z-paging-wevu__safe-area"
    />

    <view
      v-if="showBackToTop"
      class="z-paging-wevu__back-to-top"
      :style="[{ bottom: `${vpPx(backToTopBottom, 80)}px` }, backToTopStyle]"
      @click="handleBackToTopClick"
    >
      <slot name="backToTop">
        <image
          v-if="backToTopImg"
          class="z-paging-wevu__back-to-top-img"
          :src="backToTopImg"
        /><text v-else>↑</text>
      </slot>
    </view>

    <view
      v-if="f2Visible"
      class="z-paging-wevu__f2"
      :style="`transition-duration:${refresherF2Duration}ms;`"
    >
      <slot name="f2">
        <view class="z-paging-wevu__f2-close" @click="closeF2">
          关闭二楼
        </view>
      </slot>
    </view>
  </view>
</template>

<style scoped>
.z-paging-wevu {
  position: relative;
  display: flex;
  flex-direction: column;
  width: var(--vp-width, 100%);
  max-width: var(--vp-max-width, none);
  height: var(--vp-height, auto);
  min-height: var(--vp-min-height, 0);
  background-color: var(--vp-bg, transparent);
}
.z-paging-wevu--fixed {
  position: fixed;
  top: var(--vp-fixed-top, 0px);
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}
.z-paging-wevu--fill {
  overflow: hidden;
}
.z-paging-wevu__layout {
  display: flex;
  flex: 1 1 auto;
  flex-direction: row;
  min-height: 0;
}
.z-paging-wevu__main {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.z-paging-wevu__left,
.z-paging-wevu__right {
  flex: 0 0 auto;
}
.z-paging-wevu__scroll {
  width: 100%;
  height: var(--vp-scroll-height, 100%);
  overflow: hidden;
}
.z-paging-wevu__scroll--flex {
  flex: 1 1 0;
  min-height: 0;
  height: 0;
}
.z-paging-wevu__top,
.z-paging-wevu__bottom {
  flex: 0 0 auto;
  width: 100%;
}
.z-paging-wevu__top--sticky {
  position: sticky;
  top: var(--vp-fixed-top, 0px);
  z-index: 6;
}
.z-paging-wevu__content {
  position: relative;
  box-sizing: border-box;
  min-height: 1px;
}
.z-paging-wevu--fixed .z-paging-wevu__content {
  min-height: 100%;
}
/**
 * 聊天记录模式：与原版一致，倒置的是 scroll-view 本身（不是内容层）。
 * 只倒置内容层时内容不足一屏会贴住顶部、超过一屏时滚动位置也整体错位；
 * 倒置滚动区才能让 list[0] 稳定落在视觉底部。
 */
.z-paging-wevu--chat .z-paging-wevu__scroll {
  transform: scaleY(-1);
}
/* 内置节点（加载中 / 空数据 / 加载更多 / 下拉刷新）需要各自反转回来，否则文字是倒的 */
.z-paging-wevu--chat .z-paging-wevu__loading,
.z-paging-wevu--chat .z-paging-wevu__empty,
.z-paging-wevu--chat .z-paging-wevu__chat-loading,
.z-paging-wevu--chat .z-paging-wevu__chat-no-more,
.z-paging-wevu--chat .z-paging-wevu__more,
.z-paging-wevu--chat .z-paging-wevu__refresher,
.z-paging-wevu--chat .z-paging-wevu__refresher-hint {
  transform: scaleY(-1);
}
/* 聊天记录模式顶部加载态：与原版一致的居中转圈，不带文案 */
.z-paging-wevu__chat-loading,
.z-paging-wevu__chat-no-more {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
}
.z-paging-wevu__chat-loading .z-paging-wevu__refresher-spinner {
  margin-right: 0;
}
/* 末尾哨兵：仅用于交集观察，不占可见高度 */
.z-paging-wevu__sentinel {
  width: 100%;
  height: 1px;
}
.z-paging-wevu__refresher,
.z-paging-wevu__refresher-hint {
  display: flex;
  overflow: hidden;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition-property: height;
  transition-timing-function: ease-out;
}
/* 内层容器保持自定义刷新视图的自然高度，用于测量真实高度 */
.z-paging-wevu__refresher-inner {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.z-paging-wevu__refresher-hint {
  width: 100%;
  box-sizing: border-box;
}
.z-paging-wevu__refresher-img {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}
.z-paging-wevu__refresher-img--animated {
  animation: z-paging-wevu-rotate 1s linear infinite;
}
.z-paging-wevu__refresher-arrow {
  width: 34rpx;
  height: 34rpx;
  margin-right: 9rpx;
  transform: rotate(0deg);
  transition: transform 0.2s ease-out;
}
.z-paging-wevu__refresher-arrow--down {
  transform: rotate(180deg);
}
.z-paging-wevu__refresher-spinner {
  width: 30rpx;
  height: 30rpx;
  margin-right: 9rpx;
  border: 3rpx solid #d0d6e0;
  border-top-color: #8a8f98;
  border-radius: 50%;
}
.z-paging-wevu__refresher-spinner--animated {
  animation: z-paging-wevu-rotate 0.8s linear infinite;
}
.z-paging-wevu__refresher-text,
.z-paging-wevu__refresher-time {
  color: #8a8f98;
  font-size: 30rpx;
}
.z-paging-wevu__refresher-time {
  flex-basis: 100%;
  margin-top: 6rpx;
  font-size: 20rpx;
  text-align: center;
}
/* 内置文案层高度固定为触发阈值，最后更新时间改为同行展示，避免第二行被裁掉 */
.z-paging-wevu__refresher-hint .z-paging-wevu__refresher-time {
  flex-basis: auto;
  margin-top: 0;
  margin-left: 12rpx;
  font-size: 22rpx;
  text-align: left;
}
.z-paging-wevu__loading,
.z-paging-wevu__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64rpx 0;
}
.z-paging-wevu__empty--center {
  min-height: 320rpx;
}
.z-paging-wevu__empty--fixed {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: inherit;
}
.z-paging-wevu__empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}
.z-paging-wevu__empty-text {
  color: #8a8f98;
  font-size: 26rpx;
}
.z-paging-wevu__empty-reload {
  margin-top: 24rpx;
  padding: 12rpx 32rpx;
  border: 1rpx solid #d0d6e0;
  border-radius: 12rpx;
  color: #5b4bc4;
  font-size: 24rpx;
}
.z-paging-wevu__more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
}
.z-paging-wevu__more-text {
  color: #8a8f98;
  font-size: 24rpx;
}
.z-paging-wevu__more-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}
.z-paging-wevu__no-more-line {
  width: 80rpx;
  height: 1rpx;
  margin-right: 20rpx;
  background: #d0d6e0;
}
.z-paging-wevu__no-more-line--right {
  margin-right: 0;
  margin-left: 20rpx;
}
.z-paging-wevu__back-to-top {
  position: fixed;
  right: 32rpx;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 40rpx;
}
.z-paging-wevu__back-to-top-img {
  width: 48rpx;
  height: 48rpx;
}
.z-paging-wevu__f2 {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
  background: #fff;
}
.z-paging-wevu__f2-close {
  padding: 40rpx;
  color: #5b4bc4;
  text-align: center;
}
.z-paging-wevu__safe-area {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
@keyframes z-paging-wevu-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
