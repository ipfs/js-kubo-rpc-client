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
export function testVersion (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.repo.version', function () {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(function () { return factory.clean() })

    it('should get the repo version', async function () {
      const version = await ipfs.repo.version()
      expect(version).to.exist()
    })
  })
}
