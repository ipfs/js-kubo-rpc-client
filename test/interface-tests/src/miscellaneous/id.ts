/* eslint-env mocha */

import { isMultiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import retry from 'p-retry'
import { isWebWorker } from 'wherearewe'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testId (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.id', function () {
    this.timeout(60 * 1000)
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get the node ID', async () => {
      const res = await ipfs.id()
      expect(res).to.have.a.property('id')
      expect(res.id.toString()).to.exist()
      expect(res).to.have.a.property('publicKey')
      expect(res).to.have.a.property('agentVersion').that.is.a('string')
      expect(res).to.have.a.property('addresses').that.is.an('array')

      for (const ma of res.addresses) {
        expect(isMultiaddr(ma)).to.be.true()
      }
    })

    it('should return swarm ports opened after startup', async function () {
      if (isWebWorker) {
        // TODO: webworkers are not currently dialable
        return this.skip()
      }

      await expect(ipfs.id()).to.eventually.have.property('addresses').that.is.not.empty()
    })

    it('should get the id of another node in the swarm', async function () {
      if (isWebWorker) {
        // TODO: https://github.com/libp2p/js-libp2p-websockets/issues/129
        return this.skip()
      }

      const ipfsB = (await factory.spawn()).api
      const ipfsBId = await ipfsB.id()
      await ipfs.swarm.connect(ipfsBId.addresses[0])

      // have to wait for identify to complete before protocols etc are available for remote hosts
      await retry(async () => {
        const result = await ipfs.id({
          peerId: ipfsBId.id
        })

        expect(result).to.deep.equal(ipfsBId)
      }, { retries: 5 })
    })

    it('should get our own id when passed as an option', async function () {
      const res = await ipfs.id()

      const result = await ipfs.id({
        peerId: res.id
      })

      expect(result).to.deep.equal(res)
    })
  })
}
