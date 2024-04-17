/* eslint-env mocha */

import { CID } from 'multiformats/cid'
import { isWebWorker } from 'wherearewe'
import { ipfsOptionsWebsocketsFilterAll } from '../utils/ipfs-options-websockets-filter-all.js'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { waitForWantlistKey } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testWantlistForPeer (factory: KuboRPCFactory, options: MochaConfig): void {
  const ipfsOptions = ipfsOptionsWebsocketsFilterAll()
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlistForPeer', function () {
    this.timeout(60 * 1000)

    let ipfsA: KuboRPCClient
    let ipfsB: KuboRPCClient
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async function () {
      ipfsA = (await factory.spawn({ type: 'go', ipfsOptions })).api
      // webworkers are not dialable because webrtc is not available
      ipfsB = (await factory.spawn({ type: isWebWorker ? 'go' : undefined })).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(CID.parse(key)).catch(() => { /* is ok, expected on teardown */ })

      const ipfsBId = await ipfsB.id()

      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should get the wantlist by peer ID for a different node', async () => {
      const ipfsBId = await ipfsB.id()

      return waitForWantlistKey(ipfsA, key, {
        peerId: ipfsBId.id,
        timeout: 60 * 1000
      })
    })
  })
}
