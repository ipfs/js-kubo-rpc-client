/* eslint-env mocha */

import { getDescribe, getIt } from '../utils/mocha.js'
import { expectIsBitswap } from './utils.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testBitswap (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bitswap', function () {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(function () { return factory.clean() })

    it('should get bitswap stats', async function () {
      const res = await ipfs.stats.bitswap()
      expectIsBitswap(null, res)
    })
  })
}
