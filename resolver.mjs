const components = Object.freeze({
  ZPagingWevu: 'z-paging-wevu/component',
  ZPagingSwiper: 'z-paging-wevu/swiper',
  ZPagingSwiperItem: 'z-paging-wevu/swiper-item',
  ZPagingEmptyView: 'z-paging-wevu/empty-view',
  ZPagingCell: 'z-paging-wevu/cell',
})

/** 将 npm 包中的 Vue SFC 交给 weapp-vite 的 wevu 模板编译链路。 */
export function ZPagingWevuResolver() {
  return {
    components,
    resolve(name) {
      const componentEntry = components[name]
      if (!componentEntry) {
        return
      }
      return {
        name,
        from: componentEntry,
        resolvedId: componentEntry,
        sourceType: 'wevu-sfc',
        typeImport: false,
      }
    },
  }
}
