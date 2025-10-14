/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { getDescribe, getIt } from '../utils/mocha.js'
import { fixtures, expectPinned, clearPins } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRm (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rm', function () {
    this.timeout(50 * 1000)

    let ipfs: KuboRPCClient

    beforeEach(async function () {
      ipfs = (await factory.spawn()).api
      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await all(ipfs.addAll(dir, { pin: false, cidVersion: 0 }))

      await ipfs.add(fixtures.files[0].data, { pin: false })
      await ipfs.add(fixtures.files[1].data, { pin: false })
    })

    after(async function () {
      await factory.clean()
    })

    beforeEach(async function () {
      return clearPins(ipfs)
    })

    it('should remove a recursive pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      const unpinnedCid = await ipfs.pin.rm(fixtures.directory.cid, { recursive: true })
      expect(unpinnedCid).to.deep.equal(fixtures.directory.cid)

      const pinset = await all(ipfs.pin.ls({ type: 'recursive' }))
      expect(pinset).to.not.deep.include({
        cid: fixtures.directory.cid,
        type: 'recursive'
      })
    })

    it('should remove a direct pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid, { recursive: false })

      const unpinnedCid = await ipfs.pin.rm(fixtures.directory.cid, { recursive: false })
      expect(unpinnedCid).to.deep.equal(fixtures.directory.cid)

      const pinset = await all(ipfs.pin.ls({ type: 'direct' }))
      expect(pinset.map(p => p.cid)).to.not.deep.include(fixtures.directory.cid)
    })

    it('should fail to remove an indirect pin', async () => {
      await ipfs.pin.add(fixtures.directory.cid, {
        recursive: true
      })

      await expect(ipfs.pin.rm(fixtures.directory.files[0].cid))
        .to.eventually.be.rejectedWith(/pinned indirectly/)
      await expectPinned(ipfs, fixtures.directory.files[0].cid)
    })

    it('should fail when an item is not pinned', async () => {
      await expect(ipfs.pin.rm(fixtures.directory.cid))
        .to.eventually.be.rejectedWith(/not pinned/)
    })
  })
}
