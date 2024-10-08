/* eslint-env mocha */

import { multiaddr, isMultiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = multiaddr('/ip4/104.236.176.52/tcp/4001/p2p/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z')

export function testAdd (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bootstrap.add', function () {
    this.timeout(100 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should return an error when called with an invalid arg', () => {
      // @ts-expect-error invalid input
      return expect(ipfs.bootstrap.add(invalidArg)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
    })

    it('should return a list containing the bootstrap peer when called with a valid arg (ip4)', async () => {
      const res = await ipfs.bootstrap.add(validIp4)

      expect(res).to.be.eql({ Peers: [validIp4] })
      const peers = res.Peers
      expect(peers).to.have.property('length').that.is.equal(1)
    })

    it('should prevent duplicate inserts of bootstrap peers', async () => {
      const added = await ipfs.bootstrap.add(validIp4)
      expect(added).to.have.property('Peers').that.deep.equals([validIp4])

      const addedAgain = await ipfs.bootstrap.add(validIp4)
      expect(addedAgain).to.have.property('Peers').that.deep.equals([validIp4])

      const list = await ipfs.bootstrap.list()
      expect(list).to.have.property('Peers').that.deep.equals([validIp4])
    })

    it('add a peer to the bootstrap list', async () => {
      const peer = multiaddr('/ip4/111.111.111.111/tcp/1001/p2p/QmXFX2P5ammdmXQgfqGkfswtEVFsZUJ5KeHRXQYCTdiTAb')

      const res = await ipfs.bootstrap.add(peer)
      expect(res).to.be.eql({ Peers: [peer] })

      const list = await ipfs.bootstrap.list()
      expect(list.Peers).to.deep.include(peer)

      expect(list.Peers.every(ma => isMultiaddr(ma))).to.be.true()
    })
  })
}
