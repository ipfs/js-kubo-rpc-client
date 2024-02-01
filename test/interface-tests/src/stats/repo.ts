/* eslint-env mocha */

import { expectIsRepo } from './utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { Factory } from 'ipfsd-ctl'
import type { KuboClient } from '../../../../src/index.js'

export function testRepo (factory: Factory, options: object) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.repo', () => {
    let ipfs: KuboClient

    before(async function () {
      // @ts-expect-error js-ipfsd-ctl works with interface types
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should get repo stats', async () => {
      const res = await ipfs.stats.repo()
      expectIsRepo(null, res)
    })
  })
}
