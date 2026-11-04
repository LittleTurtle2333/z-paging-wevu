export interface ZPagingWevuResolveResult {
  name: 'ZPagingWevu'
  from: 'z-paging-wevu/component'
  resolvedId: 'z-paging-wevu/component'
  sourceType: 'wevu-sfc'
  typeImport: false
}

export interface ZPagingWevuResolver {
  components: Readonly<Record<'ZPagingWevu', 'z-paging-wevu/component'>>
  resolve: (name: string) => ZPagingWevuResolveResult | undefined
}

export declare function ZPagingWevuResolver(): ZPagingWevuResolver
