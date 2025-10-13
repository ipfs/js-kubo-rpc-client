/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testStop (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stop', function () {
    this.timeout(60 * 1000)
    let ipfs: KuboRPCClient

    beforeEach(async function () {
      ipfs = (await factory.spawn()).api
    })

    afterEach(function () {
      // reset the list of controlled nodes - we've already shut down the
      // nodes started in this test but the references hang around and the
      // next test will call `factory.clean()` which will explode when it
      // can't connect to the nodes started by this test.
      factory.controllers = []
    })

    it('should stop the node', async () => {
      // Should succeed because node is started
      await ipfs.swarm.peers()

      // Stop the node and try the call again
      await ipfs.stop()

      // Trying to use an API that requires a started node should return an error
      return expect(ipfs.swarm.peers()).to.eventually.be.rejected()
    })
  })
}
