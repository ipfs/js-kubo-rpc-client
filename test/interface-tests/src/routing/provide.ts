/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { CID } from 'multiformats/cid'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { ensureReachable } from '../dht/utils.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testProvide (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.routing.provide', function () {
    this.timeout(80 * 1000)

    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
      const nodeB = (await factory.spawn()).api

      await ensureReachable(ipfs, nodeB)
    })

    after(async function () {
      await factory.clean()
    })

    it('should provide local CID', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'))

      await all(ipfs.routing.provide(res.cid))
    })

    it('should not provide if block not found locally', () => {
      const cid = CID.parse('Qmd7qZS4T7xXtsNFdRoK1trfMs5zU94EpokQ9WFtxdPxsZ')

      return expect(all(ipfs.routing.provide(cid))).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('not found locally')
    })

    it('should provide a CIDv1', async () => {
      const res = await ipfs.add(uint8ArrayFromString('test'), { cidVersion: 1 })
      await all(ipfs.routing.provide(res.cid))
    })

    it('should error on non CID arg', async () => {
      // @ts-expect-error invalid arg
      return expect(all(ipfs.routing.provide({}))).to.eventually.be.rejected()
    })
  })
}
