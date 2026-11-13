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

console.log(`已同步 ${COMPONENTS.length} 个 z-paging 组件目录到 demo/src/components`)
