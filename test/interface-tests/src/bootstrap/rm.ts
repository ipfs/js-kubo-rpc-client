/* eslint-env mocha */

import { multiaddr, isMultiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'
export function testRm (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  const invalidArg = 'this/Is/So/Invalid/'
  const validIp4 = multiaddr('/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

  describe('.bootstrap.rm', function () {
    this.timeout(100 * 1000)

    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should return an error when called with an invalid arg', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.bootstrap.rm(invalidArg)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return a list containing the peer removed when called with a valid arg (ip4)', async () => {
      const addRes = await ipfs.bootstrap.add(validIp4)
      expect(addRes).to.be.eql({ Peers: [validIp4] })

      const rmRes = await ipfs.bootstrap.rm(validIp4)
      expect(rmRes).to.be.eql({ Peers: [validIp4] })

      const peers = rmRes.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('removes a peer from the bootstrap list', async () => {
      const peer = multiaddr('/ip4/111.111.111.111/tcp/1001/p2p/QmXFX2P5ammdmXQgfqGkfswtEVFsZUJ5KeHRXQYCTdiTAb')
      await ipfs.bootstrap.add(peer)
      let list = await ipfs.bootstrap.list()
      expect(list.Peers).to.deep.include(peer)

      const res = await ipfs.bootstrap.rm(peer)
      expect(res).to.be.eql({ Peers: [peer] })

      list = await ipfs.bootstrap.list()
      expect(list.Peers).to.not.deep.include(peer)
      expect(res.Peers.every(ma => isMultiaddr(ma))).to.be.true()
    })
  })
}
