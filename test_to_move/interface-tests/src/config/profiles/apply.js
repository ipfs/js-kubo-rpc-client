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
export function testApply (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.apply', function () {
    this.timeout(30 * 1000)
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should apply a config profile', async () => {
      const diff = await ipfs.config.profiles.apply('lowpower')
      expect(diff.original.Swarm?.ConnMgr?.LowWater).to.not.equal(diff.updated.Swarm?.ConnMgr?.LowWater)

      const newConfig = await ipfs.config.getAll()
      expect(newConfig.Swarm?.ConnMgr?.LowWater).to.equal(diff.updated.Swarm?.ConnMgr?.LowWater)
    })

    it('should not apply a config profile in dry-run mode', async () => {
      const originalConfig = await ipfs.config.getAll()

      await ipfs.config.profiles.apply('server', { dryRun: true })

      const updatedConfig = await ipfs.config.getAll()

      expect(updatedConfig).to.deep.equal(originalConfig)
    })
  })
}
