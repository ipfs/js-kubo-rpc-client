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
export function testReplace (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      if (notImplemented()) {
        return this.skip('Not implemented in kubo yet')
      }

      ipfs = (await factory.spawn()).api
    })

    after(function () { factory.clean() })

    const config = {
      Addresses: {
        API: ''
      }
    }

    it('should replace the whole config', async function () {
      await ipfs.config.replace(config)

      const _config = await ipfs.config.getAll()
      expect(_config).to.deep.equal(config)
    })

    it('should replace to empty config', async function () {
      await ipfs.config.replace({})

      const _config = await ipfs.config.getAll()
      expect(_config).to.deep.equal({})
    })
  })
}
