/* eslint-env mocha */

import { expect } from 'aegir/chai'
import delay from 'delay'
import { CID } from 'multiformats/cid'
import { getDescribe, getIt } from '../utils/mocha.js'
import { waitForWantlistKey, waitForWantlistKeyToBeRemoved } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testWantlist (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.wantlist', function () {
    this.timeout(60 * 1000)

    let ipfsA: KuboRPCClient
    let ipfsB: KuboRPCClient
    const key = 'QmUBdnXXPyoDFXj3Hj39dNJ5VkN3QFRskXxcGaYFBB8CNR'

    before(async function () {
      ipfsA = (await factory.spawn()).api
      ipfsB = (await factory.spawn()).api
      // Add key to the wantlist for ipfsB
      ipfsB.block.get(CID.parse(key)).catch(() => { /* is ok, expected on teardown */ })

      const ipfsBId = await ipfsB.id()

      await ipfsA.swarm.connect(ipfsBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should get the wantlist', async function () {
      return waitForWantlistKey(ipfsB, key)
    })

    it('should not get the wantlist when offline', async () => {
      const node = await factory.spawn()
      await node.stop()

      return expect(node.api.bitswap.stat()).to.eventually.be.rejected()
    })

    it('should remove blocks from the wantlist when requests are cancelled', async () => {
      const controller = new AbortController()
      const cid = CID.parse('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KaGa')

      const getPromise = ipfsA.dag.get(cid, {
        signal: controller.signal
      })

      await waitForWantlistKey(ipfsA, cid.toString())

      controller.abort()

      await expect(getPromise).to.eventually.be.rejectedWith(/aborted/)

      await waitForWantlistKeyToBeRemoved(ipfsA, cid.toString())
    })

    it('should keep blocks in the wantlist when only one request is cancelled', async () => {
      const controller = new AbortController()
      const otherController = new AbortController()
      const cid = CID.parse('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1Kaaa')

      const getPromise = ipfsA.dag.get(cid, {
        signal: controller.signal
      })
      const otherGetPromise = ipfsA.dag.get(cid, {
        signal: otherController.signal
      })

      await waitForWantlistKey(ipfsA, cid.toString())

      controller.abort()

      await expect(getPromise).to.eventually.be.rejectedWith(/aborted/)

      await delay(1000)

      // cid should still be in the wantlist
      await waitForWantlistKey(ipfsA, cid.toString())

      otherController.abort()

      await expect(otherGetPromise).to.eventually.be.rejectedWith(/aborted/)

      await waitForWantlistKeyToBeRemoved(ipfsA, cid.toString())
    })
  })
}
