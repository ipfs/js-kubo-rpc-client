/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testState (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.state', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get the current state of pubsub', async function () {
      this.timeout(50 * 1000)

      const res = await ipfs.name.pubsub.state()
      expect(res).to.exist()
      expect(res).to.have.property('enabled')
      expect(res.enabled).to.be.eql(true)
    })
  })
}
