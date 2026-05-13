import { getDescribe, getIt } from '../utils/mocha.ts'
import { expectIsBitswap } from './utils.ts'
import type { KuboRPCClient } from '../../../../src/index.ts'
import type { MochaConfig } from '../utils/mocha.ts'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testBitswap (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bitswap', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should get bitswap stats', async () => {
      const res = await ipfs.stats.bitswap()
      expectIsBitswap(null, res)
    })
  })
}
