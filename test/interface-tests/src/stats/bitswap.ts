/* eslint-env mocha */

import { getDescribe, getIt } from '../utils/mocha.js'
import { expectIsBitswap } from './utils.js'
import type { Factory } from 'ipfsd-ctl'
import type { KuboClient } from '../../../../src/index.js'

export function testBitswap (factory: Factory, options: object) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bitswap', () => {
    let ipfs: KuboClient

    before(async function () {
      // @ts-expect-error js-ipfsd-ctl works with interface types
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should get bitswap stats', async () => {
      const res = await ipfs.stats.bitswap()
      expectIsBitswap(null, res)
    })
  })
}
