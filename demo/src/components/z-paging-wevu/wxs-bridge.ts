/**
 * WXS -> 逻辑层的桥。
 *
 * WXS 的 ownerInstance.callMethod 只能调用原生组件 methods 中声明的方法，
 * <script setup> 里的函数不会自动出现在 methods 中，所以这里用 defineOptions
 * 注册原生方法，按 ownerId 转发到对应分页实例。
 * 位移留在 WXS，只有跨阈值的状态通知经过此桥，驱动自定义插槽和二楼提示。
 */
type ScrollBounceHandler = (payload: { bounce?: boolean } | boolean) => void
export interface WxsPullStatusPayload {
  ownerId: string
  status: string
  height: number
  dy: number
}

export interface WxsScrollBouncePayload {
  ownerId: string
  bounce?: boolean
}

interface WxsHandlers {
  scrollBounce: ScrollBounceHandler
  pullStatus: (payload: WxsPullStatusPayload) => void
}

const handlers = new Map<string, WxsHandlers>()

export const wxsBridge = {
  register(ownerId: string, callbacks: WxsHandlers) {
    handlers.set(ownerId, callbacks)
  },
  unregister(ownerId: string) {
    handlers.delete(ownerId)
  },
  scrollBounce(payload: WxsScrollBouncePayload) {
    handlers.get(payload.ownerId)?.scrollBounce(payload)
  },
  pullStatus(payload: WxsPullStatusPayload) {
    handlers.get(payload.ownerId)?.pullStatus(payload)
  },
}
