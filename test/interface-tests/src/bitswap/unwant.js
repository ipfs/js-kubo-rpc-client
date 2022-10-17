/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testUnwant (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.bitswap.unwant', function () {
    this.timeout(60 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return factory.clean() })

    it('should throw error for invalid CID input', async function () {
      // @ts-expect-error input is invalid
      await expect(ipfs.bitswap.unwant('INVALID CID')).to.eventually.be.rejected()
    })
  })
}
