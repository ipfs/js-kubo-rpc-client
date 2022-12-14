/* eslint-env mocha */

import { fixtures } from './utils/index.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from './utils/mocha.js'
import all from 'it-all'
import { importer } from 'ipfs-unixfs-importer'
import drain from 'it-drain'
import { CID } from 'multiformats/cid'
import { equals as uint8ArrayEquals } from 'uint8arrays/equals'
import blockstore from './utils/blockstore-adapter.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testRefsLocal (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.refs.local', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should get local refs', async function () {
      /**
       * @param {string} name
       */
      const content = (name) => ({
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
