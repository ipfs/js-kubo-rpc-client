
/**
 * @param {import('..').Options} options
 * @param {import('./subscription-tracker').SubscriptionTracker} subsTracker
 */
export const createUnsubscribe = (options, subsTracker) => {
  /**
   * @type {import('../types').PubsubAPI["unsubscribe"]}
   */
  async function unsubscribe (topic, handler) {
    subsTracker.unsubscribe(topic, handler)
  }
  return unsubscribe
}
