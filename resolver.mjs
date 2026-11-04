const componentName = 'ZPagingWevu'
const componentEntry = 'z-paging-wevu/component'

/** 将 npm 包中的 Vue SFC 交给 weapp-vite 的 wevu 模板编译链路。 */
export function ZPagingWevuResolver() {
  return {
    components: Object.freeze({ [componentName]: componentEntry }),
    resolve(name) {
      if (name !== componentName) {
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
