/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../../utils/mocha.js'
import type { KuboRPCClient } from '../../../../../src/index.js'
import type { MochaConfig } from '../../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testApply (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.profiles.apply', function () {
    this.timeout(30 * 1000)
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

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
