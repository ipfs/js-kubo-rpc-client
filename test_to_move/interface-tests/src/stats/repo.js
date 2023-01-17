/* eslint-env mocha */

import { expectIsRepo } from './utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testRepo (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.repo', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}
