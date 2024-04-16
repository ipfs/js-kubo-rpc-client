/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isWebWorker } from 'ipfs-utils/src/env.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testLocalAddrs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.swarm.localAddrs', function () {
    this.timeout(80 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should list local addresses the node is listening on', async () => {
      const multiaddrs = await ipfs.swarm.localAddrs()

      expect(multiaddrs).to.be.an.instanceOf(Array)

      /**
       * Conditional tests are bad, mmmkay.
       */
      if (isWebWorker && factory.opts.type === 'proc') {
        expect(multiaddrs).to.have.lengthOf(0)
      } else {
        expect(multiaddrs).to.not.be.empty()
      }
    })
  })
}
