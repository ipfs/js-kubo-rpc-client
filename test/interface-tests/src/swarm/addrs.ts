/* eslint-env mocha */

import { peerIdFromString } from '@libp2p/peer-id'
import { isMultiaddr } from '@multiformats/multiaddr'
import { expect } from 'aegir/chai'
import { isWebWorker } from 'wherearewe'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { IDResult, KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testAddrs (factory: KuboRPCFactory, options: MochaConfig): void {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.addrs', function () {
    this.timeout(80 * 1000)

    let ipfsA: KuboRPCClient
    let ipfsB: KuboRPCClient
    let ipfsBId: IDResult

    before(async function () {
      ipfsA = (await factory.spawn({ type: 'go', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      ipfsBId = await ipfsB.id()
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should get a list of node addresses', async () => {
      const peers = await ipfsA.swarm.addrs()
      expect(peers).to.not.be.empty()
      expect(peers).to.be.an('array')

      for (const peer of peers) {
        expect(peerIdFromString(peer.id.toString())).to.be.ok()
        expect(peer).to.have.a.property('addrs').that.is.an('array')

        for (const ma of peer.addrs) {
          expect(isMultiaddr(ma)).to.be.true()
        }
      }
    })
  })
}
