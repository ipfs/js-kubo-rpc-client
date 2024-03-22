/* eslint-env mocha */

import { expectIsBandwidth } from './utils.js'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import last from 'it-last'
import all from 'it-all'
import type { Factory } from 'ipfsd-ctl'
import type { KuboClient } from '../../../../src/index.js'

export function testBw (factory: Factory, options: object) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.stats.bw', () => {
    let ipfs: KuboClient

    before(async function () {
      // @ts-expect-error js-ipfsd-ctl works with interface types
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

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
