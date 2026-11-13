/**
 * 把仓库根的 z-paging-wevu 组件源码同步到 demo/src 内。
 *
 * 为什么需要：demo 若直接引用 srcRoot 之外的源码，weapp-vite 会把它当作外部组件
 * 单独产出到 weapp_vite_external 下，scoped slot 的 owner 链路会失效，
 * 表现为 `<template #top>` 里的内容不渲染。
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = path.resolve(import.meta.dirname, '../..')
const SRC = path.join(ROOT, 'src/components')
const DEST = path.resolve(import.meta.dirname, '../src/components')

/** 需要同步进 demo 的组件目录 */
const COMPONENTS = [
  'z-paging-wevu',
  'z-paging-swiper',
  'z-paging-swiper-item',
  'z-paging-empty-view',
  'z-paging-cell',
]

for (const name of COMPONENTS) {
  const from = path.join(SRC, name)
  const to = path.join(DEST, name)
  if (!fs.existsSync(from)) {
    console.error(`未找到组件源码：${from}`)
    process.exit(1)
  }
  fs.rmSync(to, { recursive: true, force: true })
  fs.cpSync(from, to, { recursive: true })
}

/**
 * 组件 SFC 的 <style> 在当前 weapp-vite 版本下不会被输出成 index.wxss，
 * 导致组件内部样式（含刷新箭头尺寸）整体失效。
 * 这里把样式抽成全局 css，由 app.css 引入；组件是 apply-shared，可正常命中。
 */
const STYLE_DIR = path.resolve(import.meta.dirname, '../src/styles')
const mainSfc = fs.readFileSync(path.join(SRC, 'z-paging-wevu/index.vue'), 'utf8')
const styleBlock = mainSfc.match(/<style[^>]*>([\s\S]*?)<\/style>/)
if (!styleBlock) {
  console.error('未能从 z-paging-wevu/index.vue 中提取样式块')
  process.exit(1)
}
fs.mkdirSync(STYLE_DIR, { recursive: true })
fs.writeFileSync(path.join(STYLE_DIR, 'z-paging-wevu.css'), `${styleBlock[1].trim()}\n`)

console.log(`已同步 ${COMPONENTS.length} 个组件目录，并导出组件样式到 demo/src/styles`)
