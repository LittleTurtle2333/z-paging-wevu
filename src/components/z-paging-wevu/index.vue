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
import { computed, nextTick, onMounted, onUnmounted, ref, useSelectorQuery, watch } from 'wevu'
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
  refresherDefaultStyle: 'black',
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
const f2Visible = ref(false)
const refresherUpdateTime = ref('')
const queryFrom = ref<ZPagingWevuQueryFrom>('reload')

let pendingQuery: {
  promise: Promise<ZPagingWevuResult>
  resolve: (result: ZPagingWevuResult) => void
  startedAt: number
} | null = null
let requestedPageSize = pageSize.value
let replaceOnComplete = false
let touchStartY = -1
let lastTouchY = -1
let lastScrollTop = 0
let keyboardListener: ((result: { height: number }) => void) | null = null
const renderTimer: ReturnType<typeof setTimeout> | null = null

function currentResult(): ZPagingWevuResult {
  return {
    totalList: list.value,
    noMore: noMore.value,
  }
}
const currentDataKey = () => props.pagingDataKey ?? props.dataKey
const isPageScroll = () => props.usePageScroll || !props.fixed
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
    && props.loadingMoreEnabled
    && list.value.length > 0
    && (loading.value
      || failed.value
      || (noMore.value && showNoMoreView.value)
      || !props.toBottomLoadingMoreEnabled),
)
const loadingMoreText = computed(() => {
  if (failed.value) {
    return vpText(props.loadingMoreFailText, '加载失败，点击重新加载')
  }
  if (noMore.value && !loading.value) {
    return vpText(props.loadingMoreNoMoreText, '没有更多了')
  }
  if (loading.value || props.loadingMoreDefaultAsLoading) {
    return vpText(props.loadingMoreLoadingText, '正在加载...')
  }
  return vpText(props.loadingMoreDefaultText, '点击加载更多')
})
const showBackToTop = computed(
  () =>
    props.autoShowBackToTop
    && scrollTop.value >= vpPx(props.backToTopThreshold, 200),
)
const emptyText = computed(() =>
  failed.value || props.isLoadFailed
    ? vpText(props.emptyViewErrorText, '很抱歉，加载失败')
    : vpText(props.emptyViewText, '没有数据哦~'),
)
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
  const map = {
    'default': props.refresherDefaultText,
    'release-to-refresh': props.refresherPullingText,
    'loading': props.refresherRefreshingText,
    'complete': props.refresherCompleteText,
    'go-f2': props.refresherPullingText,
  }
  return vpText(map[refresherStatus.value], '')
})
/** 原生下拉刷新模式下的自绘文案层高度，与原生触发阈值对齐。 */
const refresherHintHeight = computed(() => vpPx(props.refresherThreshold, 40))

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
const chatBottomStyle = computed(() => {
  if (!props.useChatRecordMode || !props.autoAdjustPositionWhenChat) {
    return ''
  }
  return `padding-bottom:${keyboardHeight.value + vpPx(props.chatAdjustPositionOffset, 0)}px;`
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
  refreshing.value = false
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
  pendingQuery = { promise, resolve: resolveQuery, startedAt }

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
    pullingDistance.value = vpPx(props.refresherThreshold, 40)
  }
}

function reload(animate = props.showRefresherWhenReload) {
  if (animate) {
    beginRefresher()
  }
  resetState()
  emit('reload')
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
    const shouldClean
      = props.autoCleanListWhenReload ?? props.autoCleanListWhenReloadError
    if (shouldClean && pageNo.value === firstPageNo.value) {
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
  else if (props.useChatRecordMode) {
    setList([...items, ...list.value])
  }
  else {
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
  setList([...list.value, ...vpArray(data)])
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
  refreshing.value = false
  if (!props.useCustomRefresher) {
    refresherStatus.value = 'default'
    return
  }
  refresherStatus.value = 'complete'
  void vpWait(vpNumber(props.refresherCompleteDelay, 0)).then(() => {
    pullingDistance.value = 0
    refresherStatus.value = 'default'
    emit('on-restore')
  })
}

function closeF2() {
  f2Visible.value = false
  pullingDistance.value = 0
  refresherStatus.value = 'default'
  emit('refresher-f2-change', false)
}

function updateCustomRefresherHeight() {
  if (refresherStatus.value === 'loading') {
    pullingDistance.value = vpPx(props.refresherThreshold, 40)
  }
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
  scrollViewTop.value = scrollTop.value
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
  scrollToY(0, 0, animate)
}

function scrollToBottom(animate = false) {
  scrollToY(Math.max(contentHeight.value, 999999), 0, animate)
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
  if (!isPageScroll() && !props.layoutOnly && !props.refresherOnly) {
    const scrollHeight = detail.scrollHeight ?? 0
    if (
      scrollHeight > 0
      && scrollHeight - top - viewportHeight.value
      <= vpPx(props.lowerThreshold, 50)
    ) {
      doLoadMore('toBottom')
    }
  }
}

function handleScrollToLower() {
  emit('scrolltolower')
  if (!props.useChatRecordMode) {
    doLoadMore('toBottom')
  }
}

function handleScrollToUpper() {
  emit('scrolltoupper')
  if (props.useChatRecordMode) {
    doChatRecordLoadMore()
  }
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
  if (lastTouchY >= 0 && y !== lastTouchY) {
    emit('touch-direction-change', y < lastTouchY ? 'top' : 'bottom')
  }
  lastTouchY = y
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
  pullingDistance.value
    = rawDistance > threshold
      ? threshold + (rawDistance - threshold) * props.refresherOutRate
      : rawDistance
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

function didUpdateVirtualListCell(index: number) {
  const selector = isInnerVirtualList.value ? `#${uid}-cell-${index}` : `#zp-id-${index}`
  void queryRect(selector).then((rect) => {
    if (rect) {
      virtual.setCellHeight(index, rect.height)
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
})

onUnmounted(() => {
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
        'z-paging-wevu--chat': useChatRecordMode,
      },
      pagingClass,
    ]"
    :style="[
      `--vp-fixed-top:${fixedTop || 0}px;--vp-bg:${bgColor || 'transparent'};--vp-height:${height || 'auto'};--vp-width:${width || '100%'};--vp-max-width:${maxWidth || 'none'};--vp-min-height:${autoFullHeight && isPageScroll() ? `${metrics.windowHeight - (fixedTop || 0)}px` : '0px'}`,
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
        <template v-if="fixed && !usePageScroll">
          <view v-if="stickyTop" class="z-paging-wevu__top">
            <slot name="top" />
          </view>

          <scroll-view
            class="z-paging-wevu__scroll"
            :class="{ 'z-paging-wevu__scroll--flex': stickyTop }"
            :style="[
              stickyTop ? '' : `--vp-scroll-height:${viewportHeight}px`,
              { backgroundColor: bgColorContent },
            ]"
            :scroll-y="!refreshing || refresherRefreshingScrollable"
            :scroll-x="true"
            :scroll-top="scrollViewTop"
            :scroll-left="scrollViewLeft"
            :scroll-with-animation="scrollWithAnimation"
            :show-scrollbar="showScrollbar"
            :refresher-enabled="
              refresherEnabled && !layoutOnly && !useCustomRefresher
            "
            :refresher-triggered="refreshing"
            :refresher-threshold="refresherThreshold"
            :refresher-default-style="refresherDefaultStyle"
            :refresher-background="refresherBackground || bgColor || '#ffffff'"
            :lower-threshold="lowerThreshold"
            @refresherpulling="handleNativeRefresherPulling"
            @refresherrefresh="handleRefresherRefresh"
            @scrolltolower="handleScrollToLower"
            @scrolltoupper="handleScrollToUpper"
            @scroll="handleScroll"
            @scrollend="emit('scrollend', $event)"
          >
            <view v-if="!stickyTop" class="z-paging-wevu__top">
              <slot name="top" />
            </view>

            <view
              v-if="
                !useCustomRefresher
                  && refresherEnabled
                  && refresherDefaultStyle === 'none'
              "
              class="z-paging-wevu__refresher-hint"
              :style="`height:${refresherHintHeight}px;margin-top:-${refresherHintHeight}px;background:${refresherBackground || bgColor || 'transparent'};`"
            >
              <view
                v-if="refresherStatus === 'loading'"
                class="z-paging-wevu__refresher-spinner"
                :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
              />
              <text v-else class="z-paging-wevu__refresher-arrow">
                {{ refresherStatus === 'release-to-refresh' ? '↑' : '↓' }}
              </text>
              <text class="z-paging-wevu__refresher-text">{{ refresherText }}</text>
            </view>

            <view
              v-if="useCustomRefresher"
              class="z-paging-wevu__refresher"
              :style="`height:${pullingDistance}px;transition-duration:${refresherStatus === 'complete' ? refresherCompleteDuration : refresherDefaultDuration}ms;background:${refresherBackground || bgColor || 'transparent'};`"
            >
              <slot v-if="refresherStatus === 'go-f2'" name="refresherF2">
                <text class="z-paging-wevu__refresher-text">松手进入二楼</text>
              </slot>
              <slot
                v-else-if="refresherStatus === 'complete'"
                name="refresherComplete"
              >
                <text class="z-paging-wevu__refresher-text">
                  {{
                    refresherText
                  }}
                </text>
              </slot>
              <slot v-else name="refresher" :refresher-status="refresherStatus">
                <text
                  v-if="!refresherImage && refresherStatus !== 'loading'"
                  class="z-paging-wevu__refresher-arrow"
                  :style="refresherImgStyle"
                >
                  {{ refresherStatus === 'release-to-refresh' ? '↑' : '↓' }}
                </text>
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
                  最后更新：{{ refresherUpdateTime }}
                </text>
              </slot>
            </view>

            <view
              class="z-paging-wevu__content"
              :class="pagingContentClass"
              :style="[{ backgroundColor: bgColorContent }, pagingContentStyle]"
              @click="handleContentTouch"
            >
              <view v-if="showLoading" class="z-paging-wevu__loading">
                <slot name="loading">
                  <text class="z-paging-wevu__more-text">正在加载...</text>
                </slot>
              </view>

              <view
                v-if="
                  useChatRecordMode && (loading || showChatLoadingWhenReload)
                "
                class="z-paging-wevu__chat-loading"
              >
                <slot name="chatLoading" :loading-more-status="loadingStatus">
                  <text class="z-paging-wevu__more-text">
                    加载历史消息...
                  </text>
                </slot>
              </view>
              <view
                v-if="useChatRecordMode && noMore"
                class="z-paging-wevu__chat-no-more"
              >
                <slot name="chatNoMore">
                  <text class="z-paging-wevu__more-text">
                    没有更多消息了
                  </text>
                </slot>
              </view>

              <template v-if="useVirtualList && isInnerVirtualList">
                <slot name="header" />
                <view class="z-paging-wevu__virtual" :style="innerListStyle">
                  <view :style="`height:${virtual.placeholderTop.value}px;`" />
                  <view
                    v-for="cell in virtual.renderList.value"
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
                    :style="`height:${virtual.placeholderBottom.value}px;`"
                  />
                </view>
                <slot name="footer" />
              </template>
              <slot v-else />

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
                <slot name="empty" :is-load-failed="failed || isLoadFailed">
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
                    {{ vpText(emptyViewReloadText, "重新加载") }}
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
            "
            class="z-paging-wevu__refresher-hint"
            :style="`height:${refresherHintHeight}px;margin-top:-${refresherHintHeight}px;background:${refresherBackground || bgColor || 'transparent'};`"
          >
            <view
              v-if="refresherStatus === 'loading'"
              class="z-paging-wevu__refresher-spinner"
              :class="{ 'z-paging-wevu__refresher-spinner--animated': refresherRefreshingAnimated }"
            />
            <text v-else class="z-paging-wevu__refresher-arrow">
              {{ refresherStatus === 'release-to-refresh' ? '↑' : '↓' }}
            </text>
            <text class="z-paging-wevu__refresher-text">{{ refresherText }}</text>
          </view>

          <view
            v-if="useCustomRefresher"
            class="z-paging-wevu__refresher"
            :style="`height:${pullingDistance}px;transition-duration:${refresherStatus === 'complete' ? refresherCompleteDuration : refresherDefaultDuration}ms;background:${refresherBackground || bgColor || 'transparent'};`"
          >
            <slot v-if="refresherStatus === 'go-f2'" name="refresherF2">
              <text class="z-paging-wevu__refresher-text">松手进入二楼</text>
            </slot>
            <slot
              v-else-if="refresherStatus === 'complete'"
              name="refresherComplete"
            >
              <text class="z-paging-wevu__refresher-text">
                {{
                  refresherText
                }}
              </text>
            </slot>
            <slot v-else name="refresher" :refresher-status="refresherStatus">
              <text
                v-if="!refresherImage && refresherStatus !== 'loading'"
                class="z-paging-wevu__refresher-arrow"
                :style="refresherImgStyle"
              >
                {{ refresherStatus === 'release-to-refresh' ? '↑' : '↓' }}
              </text>
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
                最后更新：{{ refresherUpdateTime }}
              </text>
            </slot>
          </view>

          <view
            class="z-paging-wevu__content"
            :class="pagingContentClass"
            :style="[{ backgroundColor: bgColorContent }, pagingContentStyle]"
            @click="handleContentTouch"
          >
            <view v-if="showLoading" class="z-paging-wevu__loading">
              <slot name="loading">
                <text class="z-paging-wevu__more-text">正在加载...</text>
              </slot>
            </view>
            <view
              v-if="useChatRecordMode && (loading || showChatLoadingWhenReload)"
            >
              <slot name="chatLoading" :loading-more-status="loadingStatus">
                <text class="z-paging-wevu__more-text">加载历史消息...</text>
              </slot>
            </view>
            <view v-if="useChatRecordMode && noMore">
              <slot name="chatNoMore">
                <text class="z-paging-wevu__more-text">没有更多消息了</text>
              </slot>
            </view>

            <template v-if="useVirtualList && isInnerVirtualList">
              <slot name="header" />
              <view class="z-paging-wevu__virtual" :style="innerListStyle">
                <view :style="`height:${virtual.placeholderTop.value}px;`" />
                <view
                  v-for="cell in virtual.renderList.value"
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
                <view :style="`height:${virtual.placeholderBottom.value}px;`" />
              </view>
              <slot name="footer" />
            </template>
            <slot v-else />

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
              <slot name="empty" :is-load-failed="failed || isLoadFailed">
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
                  {{ vpText(emptyViewReloadText, "重新加载") }}
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
      :style="[{ backgroundColor: bottomBgColor }, chatBottomStyle]"
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
.z-paging-wevu--chat .z-paging-wevu__content {
  transform: scaleY(-1);
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
  margin-right: 12rpx;
  color: #8a8f98;
  font-size: 36rpx;
  line-height: 1;
}
.z-paging-wevu__refresher-spinner {
  width: 28rpx;
  height: 28rpx;
  margin-right: 12rpx;
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
  font-size: 24rpx;
}
.z-paging-wevu__refresher-time {
  flex-basis: 100%;
  margin-top: 6rpx;
  font-size: 20rpx;
  text-align: center;
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
