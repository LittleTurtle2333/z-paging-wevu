export interface ZPagingWevuWindowMetrics {
  statusBarHeight: number
  windowWidth: number
  windowHeight: number
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

  let info: Partial<WechatMiniprogram.WindowInfo> | undefined
  try {
    info = typeof wx.getWindowInfo === 'function'
      ? wx.getWindowInfo()
      : wx.getSystemInfoSync() as unknown as WechatMiniprogram.WindowInfo
  }
  catch {
    info = undefined
  }

  const windowWidth = positive(info?.windowWidth, positive(info?.screenWidth, 375))
  const windowHeight = positive(info?.windowHeight, positive(info?.screenHeight, 667))
  cachedMetrics = {
    statusBarHeight: positive(info?.statusBarHeight),
    windowWidth,
    windowHeight,
  }
  return cachedMetrics
}

/** 横竖屏或窗口尺寸变化后，由调用方主动清除缓存。 */
export function resetWindowMetrics(): void {
  cachedMetrics = null
}
