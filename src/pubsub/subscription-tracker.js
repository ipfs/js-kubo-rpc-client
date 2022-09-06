
/**
 *
 * @property {import('../types').MessageHandlerFn} handler
 * @property {AbortController} controller
 */

export class SubscriptionTracker {
  constructor () {
    /** @type {Map<string, import('../types').PubsubSubscription[]>} */
    this._subs = new Map()
  }

  /**
   * @param {string} topic
   * @param {import('../types').MessageHandlerFn} handler
   * @param {AbortSignal} [signal]
   * @returns {AbortSignal}
   */
  subscribe (topic, handler, signal) {
    const topicSubs = this._subs.get(topic) || []

    if (topicSubs.find(s => s.handler === handler)) {
      throw new Error(`Already subscribed to ${topic} with this handler`)
    }

    // Create controller so a call to unsubscribe can cancel the request
    const controller = new AbortController()

    this._subs.set(topic, [{ handler, controller }].concat(topicSubs))

    // If there is an external signal, forward the abort event
    if (signal) {
      signal.addEventListener('abort', () => this.unsubscribe(topic, handler))
    }

    return controller.signal
  }

  /**
   * @param {string} topic
   * @param {import('../types').MessageHandlerFn} [handler]
   */
  unsubscribe (topic, handler) {
    const subs = this._subs.get(topic) || []
    let unsubs

    if (handler) {
      this._subs.set(topic, subs.filter(s => s.handler !== handler))
      unsubs = subs.filter(s => s.handler === handler)
    } else {
      this._subs.set(topic, [])
      unsubs = subs
    }

    if (!(this._subs.get(topic) || []).length) {
      this._subs.delete(topic)
    }

    unsubs.forEach(s => s.controller.abort())
  }
}
