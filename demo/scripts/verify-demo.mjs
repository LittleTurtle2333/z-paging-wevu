/**
 * demo 产物校验：把微信开发者工具里才会暴露的编译期问题提前到构建阶段。
 *
 * 检查项：
 * 1. 模板里用到的自定义标签都已注册进 usingComponents；
 * 2. 产物中没有 uni.* 调用残留；
 * 3. 产物中没有 uni-app 条件编译注释残留；
 * 4. 产物中没有 WXML 不支持的对象/数组字面量 mustache（框架内部属性除外）。
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const DIST = path.resolve(import.meta.dirname, '../dist')

/** 微信原生标签与框架产物标签，不需要注册 */
const NATIVE_TAGS = new Set([
  'scroll-view',
  'swiper-item',
  'cover-view',
  'cover-image',
  'movable-area',
  'movable-view',
  'rich-text',
  'web-view',
  'picker-view',
  'picker-view-column',
  'page-container',
  'page-meta',
  'navigation-bar',
  'match-media',
  'open-data',
  'live-player',
  'live-pusher',
  'weapp-slot-wrapper',
  'slot',
])

/** 框架自己注入的属性，允许出现对象字面量 */
const INTERNAL_ATTRS = ['vue-slots', '__wv', 'props']

function walk(dir, suffix, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, suffix, out)
    }
    else if (entry.name.endsWith(suffix)) {
      out.push(full)
    }
  }
  return out
}

const problems = []

if (!fs.existsSync(DIST)) {
  console.error('缺少 demo/dist，请先执行 pnpm demo:build')
  process.exit(1)
}

// 1. 标签注册
for (const wxml of walk(DIST, '.wxml')) {
  const jsonPath = wxml.replace(/\.wxml$/, '.json')
  let using = {}
  if (fs.existsSync(jsonPath)) {
    try {
      using = JSON.parse(fs.readFileSync(jsonPath, 'utf8')).usingComponents || {}
    }
    catch {
      using = {}
    }
  }
  const source = fs.readFileSync(wxml, 'utf8')
  const tags = new Set(source.match(/<[a-z][a-z0-9]*(?:-[a-z0-9]+)+/g)?.map(tag => tag.slice(1)) ?? [])
  for (const tag of tags) {
    if (NATIVE_TAGS.has(tag) || tag.startsWith('scoped-slots-')) {
      continue
    }
    if (!using[tag]) {
      problems.push(`${path.relative(DIST, wxml)}: 未注册组件 <${tag}>`)
    }
  }
}

// 2~4. 脚本与模板内容
for (const file of [...walk(DIST, '.js'), ...walk(DIST, '.wxml')]) {
  const source = fs.readFileSync(file, 'utf8')
  const rel = path.relative(DIST, file)

  if (/(^|[^.\w])uni\.\w/.test(source)) {
    problems.push(`${rel}: 残留 uni.* 调用`)
  }
  if (/#(?:ifdef|ifndef|endif)/.test(source)) {
    problems.push(`${rel}: 残留条件编译注释`)
  }
  if (file.endsWith('.wxml')) {
    for (const match of source.matchAll(/(?:^|\s)([a-z0-9-]+)="\{\{\s*[[{]/g)) {
      const attr = match[1]
      if (INTERNAL_ATTRS.some(prefix => attr.startsWith(prefix))) {
        continue
      }
      problems.push(`${rel}: 属性 ${attr} 使用了 WXML 不支持的对象/数组字面量`)
    }
  }
}

if (problems.length) {
  console.error(`demo 校验失败，共 ${problems.length} 项：`)
  for (const item of problems.slice(0, 40)) {
    console.error(` - ${item}`)
  }
  process.exit(1)
}

console.log('demo 产物校验通过')
