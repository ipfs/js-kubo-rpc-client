/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { notImplemented } from '../../../constants.js'
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
      if (notImplemented()) {
        return this.skip('Not implemented in kubo yet')
      }
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('should throw error for invalid CID input', async function () {
      if (notImplemented()) {
        return this.skip('Not implemented in kubo yet')
      }
      // @ts-expect-error input is invalid
      await expect(ipfs.bitswap.unwant('INVALID CID')).to.eventually.be.rejected()
    })
  })
}
