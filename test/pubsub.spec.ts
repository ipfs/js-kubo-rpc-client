/* eslint-env mocha */

import { expect } from 'aegir/chai'
import defer from 'p-defer'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'
import type { KuboNode } from 'ipfsd-ctl'

const f = factory()

describe('.pubsub', function () {
  this.timeout(20 * 1000)
  describe('.subscribe', function () {
    let ipfs: KuboRPCClient
    let ctl: KuboNode

    beforeEach(async function () {
      this.timeout(30 * 1000) // slow CI

      ctl = await f.spawn({
        start: {
          args: ['--enable-pubsub-experiment']
        }
      })

      ipfs = ctl.api
    })

    afterEach(async function () {
      await f.clean()
    })

    it('.onError when connection is closed', async function () {
      const topic = 'gossipboom'
      let messageCount = 0
      const onError = defer()

      await ipfs.pubsub.subscribe(topic, message => {
        messageCount++

        if (messageCount === 2) {
          // Stop the daemon
          void ctl.stop().catch()
        }
      }, {
        onError: onError.resolve
      })

      await ipfs.pubsub.publish(topic, uint8ArrayFromString('hello'))
      await ipfs.pubsub.publish(topic, uint8ArrayFromString('bye'))

      await expect(onError.promise).to.eventually.be.fulfilled().and.to.be.instanceOf(Error)
    })

    it('does not call onError when aborted', async function () {
      const controller = new AbortController()
      const topic = 'gossipabort'
      const messages = []
      const onError = defer()
      const onReceived = defer()

      await ipfs.pubsub.subscribe(topic, message => {
        messages.push(message)
        if (messages.length === 2) {
          onReceived.resolve()
        }
      }, {
        onError: onError.resolve,
        signal: controller.signal
      })

      await ipfs.pubsub.publish(topic, uint8ArrayFromString('hello'))
      await ipfs.pubsub.publish(topic, uint8ArrayFromString('bye'))

      await onReceived.promise
      controller.abort()

      // Stop the daemon
      await ctl.stop()
      // Just to make sure no error is caused by above line
      setTimeout(onError.resolve, 200, 'aborted')

      await expect(onError.promise).to.eventually.be.fulfilled().and.to.equal('aborted')
    })
  })
})
