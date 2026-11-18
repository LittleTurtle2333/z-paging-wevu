import { beforeEach, describe, expect, it } from 'vitest'
import { vpArray, vpCacheName, vpItems, vpNumber, vpPx, vpText, vpUpdateTimeName } from '../../src/components/z-paging-wevu/utils'
import { resetWindowMetrics } from '../../src/components/z-paging-wevu/window'

describe('vpText', () => {
  it('直接返回字符串', () => {
    expect(vpText('加载中')).toBe('加载中')
  })

  it('空值回落到 fallback', () => {
    expect(vpText(undefined, '默认')).toBe('默认')
    expect(vpText(undefined)).toBe('')
  })

  it('按系统语言命中多语言对象', () => {
    // 非微信环境下 getSystemLanguage() 兜底为 zh_CN
    expect(vpText({ zh_CN: '没有更多了', en: 'No more data' })).toBe('没有更多了')
  })

  it('语言缺失时按 zh-Hans / en / 首个值回落', () => {
    expect(vpText({ 'zh-Hans': '简体文案' })).toBe('简体文案')
    expect(vpText({ en: 'English only' })).toBe('English only')
    expect(vpText({ ja: '日本語' })).toBe('日本語')
  })
})

describe('vpNumber', () => {
  it('解析数字字符串', () => {
    expect(vpNumber('42')).toBe(42)
  })

  it('非法值回落到 fallback', () => {
    expect(vpNumber(undefined, 10)).toBe(10)
    expect(vpNumber('abc', 5)).toBe(5)
    expect(vpNumber(Number.NaN, 0)).toBe(0)
  })
})

describe('vpPx', () => {
  beforeEach(() => {
    resetWindowMetrics()
  })

  it('数字原样返回', () => {
    expect(vpPx(24)).toBe(24)
  })

  it('px 后缀按数值解析', () => {
    expect(vpPx('16px')).toBe(16)
  })

  it('rpx 后缀按 750 设计稿换算', () => {
    // 非微信环境 windowWidth 兜底 375
    expect(vpPx('750rpx')).toBe(375)
  })

  it('空值回落到 fallback', () => {
    expect(vpPx('', 12)).toBe(12)
    expect(vpPx(undefined, 8)).toBe(8)
  })
})

describe('vpItems', () => {
  it('数组直接返回', () => {
    const list = [1, 2, 3]
    expect(vpItems(list)).toBe(list)
  })

  it('按 responseDataKey 取值', () => {
    const list = [{ id: 1 }]
    expect(vpItems({ records: list }, 'records')).toBe(list)
  })

  it('无法命中时返回 null', () => {
    expect(vpItems({ records: 'not-array' }, 'records')).toBeNull()
    expect(vpItems(null)).toBeNull()
  })
})

describe('vpArray', () => {
  it('数组原样返回', () => {
    expect(vpArray([1])).toEqual([1])
  })

  it('空值与非数组转为空数组', () => {
    expect(vpArray(null)).toEqual([])
    expect(vpArray(undefined)).toEqual([])
    expect(vpArray(false)).toEqual([])
  })

  it('单值包成数组', () => {
    expect(vpArray('x')).toEqual(['x'])
  })
})

describe('缓存键命名', () => {
  it('带默认 key', () => {
    expect(vpCacheName()).toBe('z-paging-wevu-cache-default')
    expect(vpUpdateTimeName()).toBe('z-paging-wevu-update-time-default')
  })

  it('自定义 key', () => {
    expect(vpCacheName('order')).toBe('z-paging-wevu-cache-order')
    expect(vpUpdateTimeName('order')).toBe('z-paging-wevu-update-time-order')
  })
})
