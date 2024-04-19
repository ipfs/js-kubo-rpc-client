/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { importer, type ImportCandidate } from 'ipfs-unixfs-importer'
import all from 'it-all'
import drain from 'it-drain'
import { CID } from 'multiformats/cid'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import blockstore from './utils/blockstore-adapter.js'
import { fixtures } from './utils/index.js'
import { getDescribe, getIt, type MochaConfig } from './utils/mocha.js'
import type { KuboRPCClient } from '../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRefsLocal (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.refs.local', function () {
    this.timeout(60 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get local refs', async function () {
      const content = (name: string): ImportCandidate => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      const imported = await all(importer(dirs, blockstore(ipfs)))

      // otherwise go-ipfs doesn't show them in the local refs
      await drain(ipfs.pin.addAll(imported.map(i => ({ cid: i.cid }))))

      const refs = await all(ipfs.refs.local())
      const cids = refs.map(r => r.ref)

      expect(
        cids.find(cid => {
          const multihash = CID.parse(cid).multihash.bytes

          return uint8ArrayEquals(imported[0].cid.multihash.bytes, multihash)
        })
      ).to.be.ok()

      expect(
        cids.find(cid => {
          const multihash = CID.parse(cid).multihash.bytes

          return uint8ArrayEquals(imported[1].cid.multihash.bytes, multihash)
        })
      ).to.be.ok()
    })
  })
}
