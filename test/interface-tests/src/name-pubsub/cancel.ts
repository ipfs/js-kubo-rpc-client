/* eslint-env mocha */
import { createEd25519PeerId } from '@libp2p/peer-id-factory'
import { expect } from 'aegir/chai'
import all from 'it-all'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { PeerId } from '@libp2p/interface'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testCancel (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.name.pubsub.cancel', () => {
    let ipfs: KuboRPCClient
    let nodeId: PeerId

    before(async function () {
      ipfs = (await factory.spawn()).api
      const peerInfo = await ipfs.id()
      nodeId = peerInfo.id
    })

    after(async function () {
      await factory.clean()
    })

    it('should return false when the name that is intended to cancel is not subscribed', async function () {
      this.timeout(60 * 1000)

      const res = await ipfs.name.pubsub.cancel(nodeId.toString())
      expect(res).to.exist()
      expect(res).to.have.property('canceled')
      expect(res.canceled).to.be.false()
    })

    it('should cancel a subscription correctly returning true', async function () {
      this.timeout(300 * 1000)

      const peerId = await createEd25519PeerId()
      const id = peerId.toString()
      const ipnsPath = `/ipns/${id}`

      const subs = await ipfs.name.pubsub.subs()
      expect(subs).to.be.an('array').that.does.not.include(ipnsPath)

      await expect(all(ipfs.name.resolve(id))).to.eventually.be.rejected()

      const subs1 = await ipfs.name.pubsub.subs()
      const cancel = await ipfs.name.pubsub.cancel(ipnsPath)
      const subs2 = await ipfs.name.pubsub.subs()

      expect(subs1).to.be.an('array').that.includes(ipnsPath)
      expect(cancel).to.have.property('canceled')
      expect(cancel.canceled).to.be.true()
      expect(subs2).to.be.an('array').that.does.not.include(ipnsPath)
    })
  })
}
