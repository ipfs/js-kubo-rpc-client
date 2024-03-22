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
export function testReplace (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should replace the whole config', async () => {
      const config = {
        Addresses: {
          API: '/ip4/1.2.3.4/tcp/54321/'
        }
      }

      await ipfs.config.replace(config)

      const _config = await ipfs.config.getAll()
      expect(cleanConfig(_config)).to.deep.equal(config)
    })

    it('should replace to empty config', async () => {
      await ipfs.config.replace({})

      const _config = await ipfs.config.getAll()
      expect(cleanConfig(_config)).to.deep.equal({})
    })
  })
}

// cleanConfig removes all null properties of the configuration. When replacing
// a configuration, Kubo always fills missing properties with null values.
function cleanConfig (config) {
  if (Array.isArray(config)) {
    return config.filter(e => Boolean(e))
  }

  return Object.keys(config).reduce((acc, key) => {
    if (!config[key]) {
      return acc
    }

    if (typeof config[key] === 'object') {
      const o = cleanConfig(config[key])
      if (o && Object.keys(o).length) {
        acc[key] = o
      }
    } else if (config[key]) {
      acc[key] = config[key]
    }

    return acc
  }, {})
}
