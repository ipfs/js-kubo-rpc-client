import { expect } from 'aegir/chai'
import all from 'it-all'
import last from 'it-last'
import { getDescribe, getIt } from '../utils/mocha.ts'
import { expectIsBandwidth } from './utils.ts'
import type { KuboRPCClient } from '../../../../src/index.ts'
import type { MochaConfig } from '../utils/mocha.ts'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testBw (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bw', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get bandwidth stats ', async () => {
      const res = await last(ipfs.stats.bw())

      if (res == null) {
        throw new Error('No bw stats returned')
      }

      expectIsBandwidth(null, res)
    })

    it('should throw error for invalid interval option', async () => {
      await expect(all(ipfs.stats.bw({ poll: true, interval: 'INVALID INTERVAL' })))
        .to.eventually.be.rejected()
        .with.property('message').that.matches(/invalid duration/)
    })
  })
}
