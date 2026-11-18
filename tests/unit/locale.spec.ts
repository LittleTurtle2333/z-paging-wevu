import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  detectSystemLocale,
  getPagingLocale,
  onPagingLocaleChange,
  setPagingLocale,
  t,
  translateText,
} from '../../src/components/z-paging-wevu/locale'

function stubLanguage(language: string | undefined) {
  vi.stubGlobal('wx', {
    getAppBaseInfo: () => (language === undefined ? undefined : { language }),
  })
}

beforeEach(() => {
  setPagingLocale('auto')
})

afterEach(() => {
  setPagingLocale('auto')
  vi.unstubAllGlobals()
})

describe('detectSystemLocale', () => {
  it('简体中文', () => {
    stubLanguage('zh_CN')
    expect(detectSystemLocale()).toBe('zh-Hans')
  })

  it('繁体中文（台湾 / 香港 / Hant）', () => {
    stubLanguage('zh_TW')
    expect(detectSystemLocale()).toBe('zh-Hant')

    stubLanguage('zh-HK')
    expect(detectSystemLocale()).toBe('zh-Hant')

    stubLanguage('zh-Hant')
    expect(detectSystemLocale()).toBe('zh-Hant')
  })

  it('英文', () => {
    stubLanguage('en')
    expect(detectSystemLocale()).toBe('en')
  })

  it('其他语言回落简体中文', () => {
    stubLanguage('ja')
    expect(detectSystemLocale()).toBe('zh-Hans')
  })

  it('宿主不可用或抛错时回落简体中文', () => {
    stubLanguage(undefined)
    expect(detectSystemLocale()).toBe('zh-Hans')

    vi.stubGlobal('wx', {
      getAppBaseInfo: () => {
        throw new Error('boom')
      },
    })
    expect(detectSystemLocale()).toBe('zh-Hans')
  })
})

describe('setPagingLocale', () => {
  it('auto 跟随系统语言', () => {
    stubLanguage('en')
    setPagingLocale('auto')
    expect(getPagingLocale()).toBe('en')
  })

  it('手动指定后不再跟随系统', () => {
    stubLanguage('en')
    setPagingLocale('zh-Hant')
    expect(getPagingLocale()).toBe('zh-Hant')
  })

  it('变更时通知订阅者，值相同则不通知', () => {
    const listener = vi.fn()
    const off = onPagingLocaleChange(listener)

    setPagingLocale('en')
    expect(listener).toHaveBeenCalledTimes(1)

    setPagingLocale('en')
    expect(listener).toHaveBeenCalledTimes(1)

    off()
    setPagingLocale('zh-Hans')
    expect(listener).toHaveBeenCalledTimes(1)
  })
})

describe('t 内置文案', () => {
  it('按当前语言取文案', () => {
    stubLanguage('en')
    expect(t('zp.loadingMore.noMore')).toBe('No more data')

    setPagingLocale('zh-Hant')
    expect(t('zp.loadingMore.noMore')).toBe('沒有更多了')
  })

  it('未知 key 原样返回', () => {
    expect(t('zp.not.exists')).toBe('zp.not.exists')
  })
})

describe('translateText', () => {
  it('字符串作为最终文案直接返回', () => {
    expect(translateText('自定义文案', 'zp.loadingMore.noMore')).toBe('自定义文案')
  })

  it('空字符串回落到内置文案', () => {
    setPagingLocale('en')
    expect(translateText('', 'zp.loadingMore.noMore')).toBe('No more data')
  })

  it('对象按当前语言取值', () => {
    setPagingLocale('en')
    expect(
      translateText({ 'zh-Hans': '没有更多了', 'en': 'No more' }, 'zp.loadingMore.noMore'),
    ).toBe('No more')
  })

  it('对象缺少当前语言时回落 zh-Hans', () => {
    setPagingLocale('en')
    expect(translateText({ 'zh-Hans': '兜底文案' }, 'zp.loadingMore.noMore')).toBe('兜底文案')
  })

  it('对象为空或未定义时使用内置文案', () => {
    setPagingLocale('zh-Hans')
    expect(translateText({}, 'zp.loadingMore.noMore')).toBe('没有更多了')
    expect(translateText(undefined, 'zp.loadingMore.noMore')).toBe('没有更多了')
  })
})
