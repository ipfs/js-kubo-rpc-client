/* eslint-env mocha */

import { isBrowser, isWebWorker, isElectronRenderer } from 'wherearewe'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import waitFor from '../utils/wait-for.js'
import { getTopic } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testUnsubscribe (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pubsub.unsubscribe', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    // Browser/worker has max ~5 open HTTP requests to the same origin
    const count = isBrowser || isWebWorker || isElectronRenderer ? 5 : 10

    it(`should subscribe and unsubscribe ${count} times`, async () => {
      const someTopic = getTopic()
      const handlers = Array.from(Array(count), () => () => {})

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, handlers[i])
      }

      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.unsubscribe(someTopic, handlers[i])
      }

      // Unsubscribing in the http client aborts the connection we hold open
      // but does not wait for it to close so the subscription list sometimes
      // takes a little time to empty
      await waitFor(async () => {
        const subs = await ipfs.pubsub.ls()

        return subs.length === 0
      }, {
        interval: 1000,
        timeout: 30000,
        name: 'subscriptions to be empty'
      })
    })

    it(`should subscribe ${count} handlers and unsubscribe once with no reference to the handlers`, async () => {
      const someTopic = getTopic()
      for (let i = 0; i < count; i++) {
        await ipfs.pubsub.subscribe(someTopic, (msg) => {})
      }
      await ipfs.pubsub.unsubscribe(someTopic)

      // Unsubscribing in the http client aborts the connection we hold open
      // but does not wait for it to close so the subscription list sometimes
      // takes a little time to empty
      await waitFor(async () => {
        const subs = await ipfs.pubsub.ls()

        return subs.length === 0
      }, {
        interval: 1000,
        timeout: 30000,
        name: 'subscriptions to be empty'
      })
    })
  })
}
