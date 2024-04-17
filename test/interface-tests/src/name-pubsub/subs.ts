/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testSubs (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.subs', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get an empty array as a result of subscriptions before any resolve', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.exist()
      expect(res).to.eql([])
    })

    it('should get the list of subscriptions updated after a resolve', async function () {
      this.timeout(300 * 1000)
      const id = 'QmNP1ASen5ZREtiJTtVD3jhMKhoPb1zppET1tgpjHx2NGA'

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.eql([]) // initally empty

      await expect(all(ipfs.name.resolve(id))).to.eventually.be.rejected()

      const res = await ipfs.name.pubsub.subs()
      expect(res).to.be.an('array').that.does.include(`/ipns/${id}`)
    })
  })
}
