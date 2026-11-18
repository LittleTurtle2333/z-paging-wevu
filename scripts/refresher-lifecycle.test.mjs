import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { it } from 'vitest'

// 直接运行组件的请求完成 / 手势 / 收起函数，覆盖 WXS 与旧完成计时器交错的时序。
const sfc = fs.readFileSync(new URL('../src/components/z-paging-wevu/index.vue', import.meta.url), 'utf8')
const script = sfc.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
const ast = ts.createSourceFile('paging.ts', script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
const methods = new Set([
  'settlePending',
  'beginRefresher',
  'endRefresh',
  'eventY',
  'handleTouchStart',
  'handleWxsPullStatus',
  'applyPullDistance',
  'handleTouchEnd',
  'handleRefresherRefresh',
])
const lifecycle = ast.statements.filter(node =>
  (ts.isFunctionDeclaration(node) && methods.has(node.name?.text))
  || (ts.isVariableStatement(node) && node.declarationList.declarations.some(
    declaration => declaration.name.getText(ast) === 'refresherRestoreEpoch',
  )),
).map(node => node.getText(ast)).join('\n')
const compiled = ts.transpileModule(lifecycle, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText
const wxsSource = fs.readFileSync(new URL('../src/components/z-paging-wevu/wxs/refresher.wxs', import.meta.url), 'utf8')

function createLifecycle() {
  let now = 0
  const timers = []
  const events = []
  const ref = value => ({ value })
  const context = {
    props: {
      refresherEnabled: true,
      refresherOnly: true,
      refresherThreshold: 40,
      refresherPullRate: 1,
      refresherOutRate: 0.5,
      refresherCompleteDelay: 600,
      refresherCompleteDuration: 300,
      refresherDefaultDuration: 200,
      showRefresherF2: true,
    },
    refreshing: ref(false),
    refresherStatus: ref('default'),
    pullingDistance: ref(0),
    effectiveUseCustomRefresher: ref(true),
    customRefresherHeight: ref(40),
    dragTick: ref(0),
    bodyTransitionDuration: ref(200),
    loading: ref(true),
    scrollTop: ref(0),
    scrollEnable: ref(true),
    f2Visible: ref(false),
    refresherF2ThresholdPx: ref(100),
    viewportHeight: ref(600),
    pageSize: ref(10),
    pendingQuery: { resolve() {} },
    lastTouchY: -1,
    touchStartY: -1,
    lastTouchMoveAppliedAt: 0,
    vpNumber: (value, fallback) => Number(value ?? fallback),
    vpPx: (value, fallback) => Number(value ?? fallback),
    vpWait: ms => new Promise(resolve => timers.push({ at: now + ms, resolve })),
    emit: (...event) => events.push(event),
    clearPendingTouchMove() {},
    updateCustomRefresherHeight() {},
    currentResult: () => ({ totalList: [], noMore: false }),
  }
  vm.runInNewContext(`${compiled}\nglobalThis.api = {${[...methods].join(',')}}`, context)
  const wxsContext = { module: { exports: {} } }
  vm.runInNewContext(wxsSource, wxsContext)
  const wxs = wxsContext.module.exports
  const state = {}
  const dataset = { ownerId: 'paging-test', threshold: 40, rate: 1, outRate: 0.5, get enabled() { return !context.refreshing.value }, get f2Enabled() { return context.props.refresherF2Enabled }, f2Threshold: 100 }
  const owner = {
    getState: () => state,
    selectComponent: selector => selector === '.z-paging-wevu__touch'
      ? { getDataset: () => dataset }
      : { setStyle() {} },
    callMethod: (name, payload) => context.api[name](payload),
  }
  const event = y => ({ touches: [{ clientY: y }], changedTouches: [{ clientY: y }] })
  return {
    context,
    events,
    api: context.api,
    start(y = 100) {
      wxs.touchstart(event(y), owner)
      context.api.handleTouchStart(event(y))
    },
    move: y => wxs.touchmove(event(y), owner),
    end(y) {
      wxs.touchend(event(y), owner)
      context.api.handleTouchEnd(event(y))
    },
    async advance(ms) {
      const target = now + ms
      while (true) {
        await Promise.resolve()
        timers.sort((a, b) => a.at - b.at)
        if (!timers.length || timers[0].at > target) { break }
        const timer = timers.shift()
        now = timer.at
        timer.resolve()
      }
      now = target
    },
  }
}

it('首次加载完成的旧计时器不能把首次下拉的松手刷新提示改回默认', async () => {
  const h = createLifecycle()
  h.api.settlePending()
  await h.advance(600)
  h.start()
  h.move(200)
  assert.equal(h.context.refresherStatus.value, 'release-to-refresh')
  await h.advance(300)
  assert.equal(h.context.refresherStatus.value, 'release-to-refresh')
  h.end(200)
  assert.equal(h.context.refreshing.value, true)
  assert.equal(h.events.filter(event => event[0] === 'on-refresh').length, 1)
})

it('首次请求在手指拉过阈值后完成，也不能覆盖当前拖动状态', async () => {
  const h = createLifecycle()
  h.start()
  h.move(200)
  h.api.settlePending()
  await h.advance(900)
  assert.equal(h.context.refresherStatus.value, 'release-to-refresh')
})

for (const phase of [200, 600]) {
  it(`旧刷新在 ${phase}ms 时开始新下拉，旧延迟收起不能覆盖新手势`, async () => {
    const h = createLifecycle()
    h.api.beginRefresher()
    h.api.endRefresh()
    await h.advance(phase)
    h.start()
    h.move(200)
    const tick = h.context.dragTick.value
    await h.advance(1000)
    assert.equal(h.context.refresherStatus.value, 'release-to-refresh')
    assert.equal(h.context.dragTick.value, tick)
  })
}

it('新二楼手势不会被上一轮完成计时器改回默认', async () => {
  const h = createLifecycle()
  h.context.props.refresherF2Enabled = true
  h.api.beginRefresher()
  h.api.endRefresh()
  await h.advance(600)
  h.start()
  h.move(300)
  await h.advance(300)
  assert.equal(h.context.refresherStatus.value, 'go-f2')
  h.end(300)
  assert.equal(h.context.f2Visible.value, true)
})

it('新的程序刷新开始后，旧完成计时器不能把 loading 重置为 default', async () => {
  const h = createLifecycle()
  h.api.beginRefresher()
  h.api.endRefresh()
  await h.advance(600)
  h.api.beginRefresher()
  await h.advance(300)
  assert.equal(h.context.refresherStatus.value, 'loading')
  assert.equal(h.context.refreshing.value, true)
})

it('没有新手势时，仍按完成延迟和动画时长收起并通知恢复', async () => {
  const h = createLifecycle()
  h.api.beginRefresher()
  h.api.endRefresh()
  await h.advance(600)
  assert.equal(h.context.refresherStatus.value, 'complete')
  assert.equal(h.context.pullingDistance.value, 0)
  await h.advance(300)
  assert.equal(h.context.refresherStatus.value, 'default')
  assert.equal(h.events.filter(event => event[0] === 'on-restore').length, 1)
})
