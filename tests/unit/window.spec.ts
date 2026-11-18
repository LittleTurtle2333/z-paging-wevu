import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * window.ts 用模块级变量缓存窗口信息与平台，缓存一旦写入同进程无法清除平台缓存，
 * 因此每个用例用 `resetModules` + 动态 import 拿到干净模块实例。
 */
async function loadWindowModule(wxValue: unknown) {
  vi.resetModules()
  vi.stubGlobal('wx', wxValue)
  return import('../../src/components/z-paging-wevu/window')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('getWindowMetrics', () => {
  it('优先使用 getWindowInfo', async () => {
    const { getWindowMetrics } = await loadWindowModule({
      getWindowInfo: () => ({
        windowWidth: 414,
        windowHeight: 896,
        screenWidth: 414,
        screenHeight: 896,
        statusBarHeight: 44,
        safeArea: { bottom: 862 },
      }),
    })

    expect(getWindowMetrics()).toEqual({
      statusBarHeight: 44,
      windowWidth: 414,
      windowHeight: 896,
      // 896 - 862
      safeAreaInsetBottom: 34,
    })
  })

  it('只读取一次，后续命中缓存', async () => {
    const getWindowInfo = vi.fn(() => ({ windowWidth: 400, windowHeight: 800 }))
    const { getWindowMetrics } = await loadWindowModule({ getWindowInfo })

    getWindowMetrics()
    getWindowMetrics()

    expect(getWindowInfo).toHaveBeenCalledTimes(1)
  })

  it('resetWindowMetrics 后重新读取', async () => {
    const getWindowInfo = vi.fn(() => ({ windowWidth: 400, windowHeight: 800 }))
    const { getWindowMetrics, resetWindowMetrics } = await loadWindowModule({ getWindowInfo })

    getWindowMetrics()
    resetWindowMetrics()
    getWindowMetrics()

    expect(getWindowInfo).toHaveBeenCalledTimes(2)
  })

  it('宿主不可用时回落到 375 × 667', async () => {
    const { getWindowMetrics } = await loadWindowModule({
      getWindowInfo: () => {
        throw new Error('boom')
      },
    })

    expect(getWindowMetrics()).toMatchObject({
      windowWidth: 375,
      windowHeight: 667,
      statusBarHeight: 0,
      safeAreaInsetBottom: 0,
    })
  })

  it('缺少 getWindowInfo 时同样回落到默认值', async () => {
    const { getWindowMetrics } = await loadWindowModule({})

    expect(getWindowMetrics().windowWidth).toBe(375)
  })

  it('windowWidth 非法时回落到 screenWidth', async () => {
    const { getWindowMetrics } = await loadWindowModule({
      getWindowInfo: () => ({ windowWidth: 0, screenWidth: 390, windowHeight: 700 }),
    })

    expect(getWindowMetrics().windowWidth).toBe(390)
  })
})

describe('getSystemLanguage', () => {
  it('读取 getAppBaseInfo 的 language', async () => {
    const { getSystemLanguage } = await loadWindowModule({
      getAppBaseInfo: () => ({ language: 'en' }),
    })

    expect(getSystemLanguage()).toBe('en')
  })

  it('缺失或抛错时回落 zh_CN', async () => {
    const { getSystemLanguage } = await loadWindowModule({
      getAppBaseInfo: () => {
        throw new Error('boom')
      },
    })

    expect(getSystemLanguage()).toBe('zh_CN')
  })
})

describe('平台判定', () => {
  it('PC 微信（mac / windows）判定为桌面端', async () => {
    const mac = await loadWindowModule({ getDeviceInfo: () => ({ platform: 'mac' }) })
    expect(mac.getDevicePlatform()).toBe('mac')
    expect(mac.isDesktopPlatform()).toBe(true)

    const windows = await loadWindowModule({ getDeviceInfo: () => ({ platform: 'windows' }) })
    expect(windows.isDesktopPlatform()).toBe(true)
  })

  it('手机端与开发者工具不算桌面端', async () => {
    const ios = await loadWindowModule({ getDeviceInfo: () => ({ platform: 'ios' }) })
    expect(ios.isDesktopPlatform()).toBe(false)

    const devtools = await loadWindowModule({ getDeviceInfo: () => ({ platform: 'devtools' }) })
    expect(devtools.isDesktopPlatform()).toBe(false)
  })

  it('getDeviceInfo 缺失时回落到 getSystemInfoSync', async () => {
    const { getDevicePlatform } = await loadWindowModule({
      getSystemInfoSync: () => ({ platform: 'windows' }),
    })

    expect(getDevicePlatform()).toBe('windows')
  })

  it('平台缓存只读一次', async () => {
    const getDeviceInfo = vi.fn(() => ({ platform: 'ios' }))
    const { getDevicePlatform } = await loadWindowModule({ getDeviceInfo })

    getDevicePlatform()
    getDevicePlatform()

    expect(getDeviceInfo).toHaveBeenCalledTimes(1)
  })
})
