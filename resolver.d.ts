export type ZPagingWevuComponentName
  = 'ZPagingWevu' | 'ZPagingSwiper' | 'ZPagingSwiperItem' | 'ZPagingEmptyView' | 'ZPagingCell'

export type ZPagingWevuComponentEntry
  = 'z-paging-wevu/component' | 'z-paging-wevu/swiper' | 'z-paging-wevu/swiper-item'
    | 'z-paging-wevu/empty-view' | 'z-paging-wevu/cell'

export interface ZPagingWevuResolveResult {
  name: ZPagingWevuComponentName
  from: ZPagingWevuComponentEntry
  resolvedId: ZPagingWevuComponentEntry
  sourceType: 'wevu-sfc'
  typeImport: true
}

export interface ZPagingWevuResolver {
  components: Readonly<Record<ZPagingWevuComponentName, ZPagingWevuComponentEntry>>
  resolve: (name: string) => ZPagingWevuResolveResult | undefined
}

export declare function ZPagingWevuResolver(): ZPagingWevuResolver
