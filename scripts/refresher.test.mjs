import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { it } from 'vitest'

const source = fs.readFileSync(new URL('../src/components/z-paging-wevu/wxs/refresher.wxs', import.meta.url), 'utf8')

function createRefresher() {
  const context = { module: { exports: {} } }
  vm.runInNewContext(source, context)
  const wxs = context.module.exports
  const state = {}
  // WXS setStyle 覆盖模板 style；重发模板样式不会清除此覆盖（已在模拟器实测）。
  const styles = {}
  const notifications = []
  const body = { setStyle: patch => Object.assign(styles, patch) }
  const dataset = { ownerId: 'paging-test', enabled: true, threshold: 40, rate: 1, outRate: 0.5 }
  const owner = {
    getState: () => state,
    callMethod(name, payload) {
      notifications.push({ name, ...JSON.parse(JSON.stringify(payload)) })
    },
    selectComponent(selector) {
      if (selector === '.z-paging-wevu__body') { return body }
      if (selector === '.z-paging-wevu__touch') { return { getDataset: () => dataset } }
      return null
    },
  }
  const event = y => ({ touches: [{ clientY: y }] })
  return {
    styles,
    dataset,
    notifications,
    start: y => wxs.touchstart(event(y), owner),
    move: y => wxs.touchmove(event(y), owner),
    end: y => wxs.touchend(event(y), owner),
    pull(distance) {
      wxs.touchstart(event(100), owner)
      assert.equal(wxs.touchmove(event(100 + distance), owner), false)
    },
    settle(distance, duration, tick) {
      wxs.propObserver(`${distance}:${duration}:${tick}`, '', owner, body)
    },
  }
}

it('未触发刷新且 WXS touchend 丢失时，逻辑层收起指令仍清除下拉位移', () => {
  const refresher = createRefresher()
  refresher.pull(20)
  assert.equal(refresher.styles.transform, 'translate3d(0,20px,0)')
  refresher.settle(0, 200, 1)
  assert.equal(refresher.styles.transform, 'none')
  assert.equal(refresher.styles.transition, 'transform 200ms ease')
})

it('刷新先停在刷新区高度，完成后清除 WXS 位移并使用完成动画时长', () => {
  const refresher = createRefresher()
  refresher.pull(200)
  assert.equal(refresher.styles.transform, 'translate3d(0,120px,0)')
  refresher.settle(40, 200, 1)
  assert.equal(refresher.styles.transform, 'translate3d(0,40px,0)')
  refresher.settle(0, 300, 2)
  assert.equal(refresher.styles.transform, 'none')
  assert.equal(refresher.styles.transition, 'transform 300ms ease')
  // 再拉一次，终点同为 0；新的指令仍需覆盖视图层残留。
  refresher.pull(100)
  refresher.settle(0, 300, 3)
  assert.equal(refresher.styles.transform, 'none')
})

it('收起一个分页实例不会改动另一个实例的拖动位移', () => {
  const first = createRefresher()
  const second = createRefresher()
  first.pull(100)
  second.pull(200)
  first.settle(0, 300, 1)
  assert.equal(first.styles.transform, 'none')
  assert.equal(second.styles.transform, 'translate3d(0,120px,0)')
})

it('从列表中段开始的滚动，即使同一手势到达顶部也不接管为下拉刷新', () => {
  const refresher = createRefresher()
  refresher.dataset.enabled = false
  refresher.start(100)
  assert.equal(refresher.move(200), true)
  // 到顶后继续移动仍属于原来的滚动手势。
  refresher.dataset.enabled = true
  assert.equal(refresher.move(300), true)
  assert.equal(refresher.move(400), true)
  assert.equal(refresher.styles.transform, undefined)
  // 松手后从顶部重新下拉才允许刷新。
  refresher.end(400)
  refresher.pull(100)
  assert.equal(refresher.styles.transform, 'translate3d(0,70px,0)')
})

it('顶部手势被列表滚动接管后，不再写入下拉位移或拦截滚动', () => {
  const refresher = createRefresher()
  refresher.start(200)
  refresher.dataset.enabled = false
  assert.equal(refresher.move(190), true)
  assert.equal(refresher.move(300), true)
  assert.equal(refresher.styles.transform, undefined)
})

it('从顶部先上滑的滚动手势，中途反向也不会切换成下拉刷新', () => {
  const refresher = createRefresher()
  refresher.start(200)
  assert.equal(refresher.move(180), true)
  assert.equal(refresher.move(300), true)
  assert.ok(!refresher.styles.transform || refresher.styles.transform === 'none')
})

it('已经从顶部开始下拉后，反向推回仍保持滚动锁定直到松手', () => {
  const refresher = createRefresher()
  refresher.start(200)
  assert.equal(refresher.move(300), false)
  assert.equal(refresher.move(180), false)
  assert.equal(refresher.styles.transform, 'none')
  assert.equal(refresher.move(280), false)
  assert.equal(refresher.styles.transform, 'translate3d(0,60px,0)')
})

it('跨过刷新阈值时通知逻辑层更新自定义插槽，持续拖动不重复通知', () => {
  const refresher = createRefresher()
  refresher.start(100)
  refresher.move(120)
  refresher.move(200)
  refresher.move(220)
  assert.deepEqual(refresher.notifications, [{
    name: 'handleWxsPullStatus',
    ownerId: 'paging-test',
    status: 'release-to-refresh',
    height: 70,
    dy: 100,
  }])
  refresher.move(120)
  assert.equal(refresher.notifications.at(-1).status, 'default')
  assert.equal(refresher.styles.transform, 'translate3d(0,20px,0)')
})

it('拖到二楼阈值时提前通知 go-f2，回推后恢复松手刷新提示', () => {
  const refresher = createRefresher()
  refresher.dataset.f2Enabled = true
  refresher.dataset.f2Threshold = 100
  refresher.dataset.f2Enabled = true
  refresher.dataset.f2Threshold = 100
  refresher.start(100)
  refresher.move(200)
  refresher.move(300)
  refresher.move(320)
  refresher.move(200)
  refresher.move(80)
  assert.deepEqual(refresher.notifications.map(item => item.status), [
    'release-to-refresh',
    'go-f2',
    'release-to-refresh',
    'default',
  ])
})

it('WXS 状态按分页实例分发，卸载后的通知不会串到其它列表', () => {
  const source = fs.readFileSync(new URL('../src/components/z-paging-wevu/wxs-bridge.ts', import.meta.url), 'utf8')
  const context = { exports: {} }
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, context)
  const { wxsBridge } = context.exports
  const received = []
  for (const ownerId of ['first', 'second']) {
    wxsBridge.register(ownerId, {
      scrollBounce() {},
      pullStatus: payload => received.push([ownerId, payload.status]),
    })
  }
  wxsBridge.pullStatus({ ownerId: 'first', status: 'release-to-refresh', height: 70, dy: 100 })
  wxsBridge.pullStatus({ ownerId: 'second', status: 'go-f2', height: 120, dy: 200 })
  wxsBridge.unregister('first')
  wxsBridge.pullStatus({ ownerId: 'first', status: 'default', height: 0, dy: 0 })
  assert.deepEqual(received, [['first', 'release-to-refresh'], ['second', 'go-f2']])
})
