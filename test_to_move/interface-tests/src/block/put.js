/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { CID } from 'multiformats/cid'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import all from 'it-all'
import * as raw from 'multiformats/codecs/raw'
import { sha256, sha512 } from 'multiformats/hashes/sha2'

/**
 * @typedef {import('ipfsd-ctl')} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testPut (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.block.put', () => {
    /** @type {import('../../../../src/index.js').KuboClient} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    /**
     * @see https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-block-put
     */
    it('should put a buffer, using defaults', async () => {
      const blob = uint8ArrayFromString('blorb')
      const digest = await sha256.digest(blob)
      const expectedCID = CID.create(1, raw.code, digest)

      const cid = await ipfs.block.put(blob)
      expect(cid.toString()).to.equal(expectedCID.toString())
      expect(cid.bytes).to.equalBytes(expectedCID.bytes)
    })

    it('should put a buffer, using options', async () => {
      const blob = uint8ArrayFromString(`TEST${Math.random()}`)

      const cid = await ipfs.block.put(blob, {
        format: 'raw',
        mhtype: sha512.name,
        version: 1,
        pin: true
      })

      expect(cid.version).to.equal(1)
      expect(cid.code).to.equal(raw.code)
      expect(cid.multihash.code).to.equal(sha512.code)

      expect(await all(ipfs.pin.ls({ paths: cid }))).to.have.lengthOf(1)
    })

    it('should put a Block instance', async () => {
      const expectedHash = 'QmPv52ekjS75L4JmHpXVeuJ5uX2ecSfSZo88NSyxwA3rAQ'
      const expectedCID = CID.parse(expectedHash)
      const b = uint8ArrayFromString('blorb')

      const cid = await ipfs.block.put(b)

      expect(cid.multihash.bytes).to.equalBytes(expectedCID.multihash.bytes)
    })
  })
}
