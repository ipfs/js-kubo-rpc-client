/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../../utils/mocha.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testList (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.list', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return factory.clean() })

    it('should list config profiles', async function () {

      const profiles = await ipfs.config.profiles.list()

      expect(profiles).to.be.an('array')
      expect(profiles).not.to.be.empty()

      profiles.forEach(profile => {
        expect(profile.name).to.be.a('string')
        expect(profile.description).to.be.a('string')
      })
    })
  })
}
