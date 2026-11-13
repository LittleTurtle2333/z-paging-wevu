/**
 * 内置文案的多语言支持（对齐原版 z-paging 的 i18n 模块）。
 *
 * 原版依赖 `@dcloudio/uni-i18n` + `uni.getLocale()/uni.setLocale()`，
 * 微信小程序既没有 uni-i18n，也没有 setLocale（系统语言运行时不可改），
 * 这里用一份内置字典 + 应用内 locale 状态替代：
 * - 默认 'auto'：按系统语言（wx.getAppBaseInfo().language）推断
 * - 可调用 setPagingLocale('en') 手动切换，驱动组件内置文案重新渲染
 * - 文案 props 支持两种写法：字符串（强制覆盖）或 { 'zh-Hans': '', 'en': '' } 对象
 */

export type ZPagingWevuLocale = 'zh-Hans' | 'zh-Hant' | 'en'
export type ZPagingWevuLocaleInput = ZPagingWevuLocale | 'auto'
export type ZPagingWevuText = string | Record<string, string>

const ZH_HANS: Record<string, string> = {
  'zp.refresher.default': '继续下拉刷新',
  'zp.refresher.pulling': '松开立即刷新',
  'zp.refresher.refreshing': '正在刷新...',
  'zp.refresher.complete': '刷新成功',
  'zp.refresher.f2': '松开进入二楼',
  'zp.refresherUpdateTime.title': '最后更新：',
  'zp.loadingMore.default': '点击加载更多',
  'zp.loadingMore.loading': '正在加载...',
  'zp.loadingMore.noMore': '没有更多了',
  'zp.loadingMore.fail': '加载失败，点击重新加载',
  'zp.emptyView.title': '没有数据哦~',
  'zp.emptyView.reload': '重新加载',
  'zp.emptyView.error': '很抱歉，加载失败',
  'zp.system.loading': '加载中...',
}

const MESSAGES: Record<ZPagingWevuLocale, Record<string, string>> = {
  'zh-Hans': ZH_HANS,
  'zh-Hant': {
    'zp.refresher.default': '繼續下拉重新整理',
    'zp.refresher.pulling': '放開立即重新整理',
    'zp.refresher.refreshing': '正在重新整理...',
    'zp.refresher.complete': '重新整理成功',
    'zp.refresher.f2': '放開進入二樓',
    'zp.refresherUpdateTime.title': '最後更新：',
    'zp.loadingMore.default': '點擊載入更多',
    'zp.loadingMore.loading': '正在載入...',
    'zp.loadingMore.noMore': '沒有更多了',
    'zp.loadingMore.fail': '載入失敗，點擊重新載入',
    'zp.emptyView.title': '沒有資料哦~',
    'zp.emptyView.reload': '重新載入',
    'zp.emptyView.error': '很抱歉，載入失敗',
    'zp.system.loading': '載入中...',
  },
  en: {
    'zp.refresher.default': 'Pull down to refresh',
    'zp.refresher.pulling': 'Release to refresh',
    'zp.refresher.refreshing': 'Refreshing...',
    'zp.refresher.complete': 'Refresh succeed',
    'zp.refresher.f2': 'Release to enter floor 2',
    'zp.refresherUpdateTime.title': 'Last update: ',
    'zp.loadingMore.default': 'Tap to load more',
    'zp.loadingMore.loading': 'Loading...',
    'zp.loadingMore.noMore': 'No more data',
    'zp.loadingMore.fail': 'Load failed, tap to reload',
    'zp.emptyView.title': 'No data',
    'zp.emptyView.reload': 'Reload',
    'zp.emptyView.error': 'Sorry, load failed',
    'zp.system.loading': 'Loading...',
  },
}

let currentLocale: ZPagingWevuLocaleInput = 'auto'
const listeners = new Set<() => void>()

/** 系统语言 → 内置 locale（原版 _language2Local 的等价实现） */
export function detectSystemLocale(): ZPagingWevuLocale {
  let language = ''
  try {
    language = wx.getAppBaseInfo?.()?.language || ''
  }
  catch {
    language = ''
  }
  const normalized = language.toLowerCase().replace(/_/g, '-')
  if (normalized.startsWith('zh')) {
    return /tw|hk|hant/.test(normalized) ? 'zh-Hant' : 'zh-Hans'
  }
  if (normalized.startsWith('en')) {
    return 'en'
  }
  return 'zh-Hans'
}

export function getPagingLocale(): ZPagingWevuLocale {
  return currentLocale === 'auto' ? detectSystemLocale() : currentLocale
}

/** 设置组件内置文案语言；传 'auto' 表示跟随系统 */
export function setPagingLocale(locale: ZPagingWevuLocaleInput) {
  if (currentLocale === locale) {
    return
  }
  currentLocale = locale
  listeners.forEach((listener) => {
    listener()
  })
}

export function onPagingLocaleChange(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** 取内置文案 */
export function t(key: string): string {
  const locale = getPagingLocale()
  return MESSAGES[locale][key] ?? MESSAGES['zh-Hans'][key] ?? key
}

/**
 * 与原版 `_getI18nText` 语义一致：
 * - 对象：按当前语言取值，取不到回退简体中文再回退内置文案
 * - 非空字符串：直接作为最终文案（用户强制覆盖）
 * - 其他（undefined）：使用内置文案
 */
export function translateText(value: unknown, key: string): string {
  if (value && typeof value === 'object') {
    const record = value as Record<string, string>
    const locale = getPagingLocale()
    return record[locale] || record['zh-Hans'] || t(key)
  }
  if (typeof value === 'string' && value) {
    return value
  }
  return t(key)
}
