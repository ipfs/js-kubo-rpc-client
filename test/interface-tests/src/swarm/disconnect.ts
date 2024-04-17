/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { isWebWorker } from 'wherearewe'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { IDResult, KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testDisconnect (factory: KuboRPCFactory, options: MochaConfig): void {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.disconnect', function () {
    this.timeout(80 * 1000)

    let ipfsA: KuboRPCClient
    let ipfsB: KuboRPCClient
    let ipfsBId: IDResult

    before(async function () {
      ipfsA = (await factory.spawn({ type: 'go', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      ipfsBId = await ipfsB.id()
    })

    beforeEach(async function () {
      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should disconnect from a peer', async () => {
      let peers

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length.above(0)

      await ipfsA.swarm.disconnect(ipfsBId.addresses[0])

      peers = await ipfsA.swarm.peers()
      expect(peers).to.have.length(0)
    })
  })
}
