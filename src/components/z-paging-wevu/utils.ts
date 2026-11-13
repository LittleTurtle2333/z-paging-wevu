import type { ZPagingWevuText } from './props'
import { getSystemLanguage, getWindowMetrics } from './window'

export function vpText(value: ZPagingWevuText | undefined, fallback = ''): string {
  if (typeof value === 'string') {
    return value
  }
  if (!value || typeof value !== 'object') {
    return fallback
  }
  const language = getSystemLanguage()
  const normalized = language.toLowerCase().replace(/_/g, '-')
  const locale = normalized.startsWith('zh')
    ? (/tw|hk|hant/.test(normalized) ? 'zh-Hant' : 'zh-Hans')
    : (normalized.startsWith('en') ? 'en' : 'zh-Hans')
  return (
    value[language]
    ?? value[locale]
    ?? value['zh-Hans']
    ?? value.en
    ?? Object.values(value)[0]
    ?? fallback
  )
}

export function vpNumber(
  value: number | string | undefined,
  fallback = 0,
): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function vpPx(value: number | string | undefined, fallback = 0): number {
  if (typeof value === 'number') {
    return value
  }
  if (!value) {
    return fallback
  }
  const text = String(value).trim()
  if (text.endsWith('rpx')) {
    return (
      ((Number.parseFloat(text) || 0) * getWindowMetrics().windowWidth) / 750
    )
  }
  if (text.endsWith('px')) {
    return Number.parseFloat(text) || 0
  }
  return vpNumber(value, fallback)
}

export function vpItems(data: unknown, responseDataKey = ''): unknown[] | null {
  if (Array.isArray(data)) {
    return data
  }
  if (data && typeof data === 'object' && responseDataKey) {
    const value = (data as Record<string, unknown>)[responseDataKey]
    if (Array.isArray(value)) {
      return value
    }
  }
  return null
}

export function vpArray(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }
  return data == null || data === false ? [] : [data]
}

export function vpWait(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)))
}

export function vpCacheName(key = 'default'): string {
  return `z-paging-wevu-cache-${key}`
}

export function vpUpdateTimeName(key = 'default'): string {
  return `z-paging-wevu-update-time-${key}`
}

export function vpNowText(): string {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
