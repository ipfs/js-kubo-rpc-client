/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { isWebWorker } from 'wherearewe'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testLocalAddrs (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should list local addresses the node is listening on', async () => {
      const multiaddrs = await ipfs.swarm.localAddrs()

      expect(multiaddrs).to.be.an.instanceOf(Array)

      /**
       * Conditional tests are bad, mmmkay.
       */
      if (isWebWorker && factory.opts.type === 'proc') {
        expect(multiaddrs).to.have.lengthOf(0)
      } else {
        expect(multiaddrs).to.not.be.empty()
      }
    })
  })
}
