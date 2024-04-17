import type { EventHandler, Message } from '@libp2p/interface'

export interface PubsubSubscription {
  handler: EventHandler<Message>
  controller: AbortController
}

export class SubscriptionTracker {
  private readonly _subs: Map<string, PubsubSubscription[]>

  constructor () {
    this._subs = new Map()
  }

  subscribe (topic: string, handler: EventHandler<Message>, signal?: AbortSignal): AbortSignal {
    const topicSubs = this._subs.get(topic) ?? []

    if (topicSubs.find(s => s.handler === handler) != null) {
      throw new Error(`Already subscribed to ${topic} with this handler`)
    }

    // Create controller so a call to unsubscribe can cancel the request
    const controller = new AbortController()

    this._subs.set(topic, [{ handler, controller }].concat(topicSubs))

    // If there is an external signal, forward the abort event
    if (signal != null) {
      signal.addEventListener('abort', () => { this.unsubscribe(topic, handler) })
    }

    return controller.signal
  }

  unsubscribe (topic: string, handler?: EventHandler<Message>): void {
    const subs = this._subs.get(topic) ?? []
    let unsubs

    if (handler != null) {
      this._subs.set(topic, subs.filter(s => s.handler !== handler))
      unsubs = subs.filter(s => s.handler === handler)
    } else {
      this._subs.set(topic, [])
      unsubs = subs
    }

    if ((this._subs.get(topic) ?? []).length === 0) {
      this._subs.delete(topic)
    }

    unsubs.forEach(s => {
      s.controller.abort()
    })
  }
}
