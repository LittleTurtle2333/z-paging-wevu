export interface ZPagingWevuWindowMetrics {
  statusBarHeight: number
  windowWidth: number
  windowHeight: number
  safeAreaInsetBottom: number
}

function positive(value: unknown, fallback = 0): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback
}

let cachedMetrics: ZPagingWevuWindowMetrics | null = null

/** 读取小程序窗口信息，并为非微信测试环境提供稳定兜底值。 */
export function getWindowMetrics(): ZPagingWevuWindowMetrics {
  if (cachedMetrics) {
    return cachedMetrics
  }

  // 只用 getWindowInfo：wx.getSystemInfoSync 已在基础库 3.x 标记废弃并会打印警告
  let info: Partial<WechatMiniprogram.WindowInfo> | undefined
  try {
    info = typeof wx.getWindowInfo === 'function'
      ? wx.getWindowInfo()
      : undefined
  }
  catch {
    info = undefined
  }

  const windowWidth = positive(info?.windowWidth, positive(info?.screenWidth, 375))
  const windowHeight = positive(info?.windowHeight, positive(info?.screenHeight, 667))
  const screenHeight = positive(info?.screenHeight, windowHeight)
  const safeAreaInsetBottom = positive(screenHeight - Number(info?.safeArea?.bottom ?? screenHeight))
  cachedMetrics = {
    statusBarHeight: positive(info?.statusBarHeight),
    windowWidth,
    windowHeight,
    safeAreaInsetBottom,
  }
  return cachedMetrics
}

/** 横竖屏或窗口尺寸变化后，由调用方主动清除缓存。 */
export function resetWindowMetrics(): void {
  cachedMetrics = null
}

/**
 * 读取系统语言（例如 zh_CN / zh_TW / en）。
 * 使用 getAppBaseInfo，避免已废弃的 wx.getSystemInfoSync 触发告警。
 */
export function getSystemLanguage(): string {
  try {
    const info = typeof wx.getAppBaseInfo === 'function'
      ? wx.getAppBaseInfo()
      : undefined
    if (info?.language) {
      return info.language
    }
  }
  catch {
    // 非微信环境忽略
  }
  return 'zh_CN'
}
