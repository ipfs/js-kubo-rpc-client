/* eslint-env mocha */

import { CarReader } from '@ipld/car'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagPB from '@ipld/dag-pb'
import { expect } from 'aegir/chai'
import loadFixture from 'aegir/fixtures'
import all from 'it-all'
import toBuffer from 'it-to-buffer'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testExport (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.export', () => {
    let ipfs: KuboRPCClient
    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should export a car file', async () => {
      const child = dagPB.encode({
        Data: uint8ArrayFromString(`block-${Math.random()}`),
        Links: []
      })
      const childCid = await ipfs.block.put(child, {
        format: 'dag-pb',
        version: 0
      })
      const parent = dagPB.encode({
        Links: [{
          Hash: childCid,
          Tsize: child.length,
          Name: ''
        }]
      })
      const parentCid = await ipfs.block.put(parent, {
        format: 'dag-pb',
        version: 0
      })
      const grandParent = dagCBOR.encode({
        parent: parentCid
      })
      const grandParentCid = await ipfs.block.put(grandParent, {
        format: 'dag-cbor',
        version: 1
      })

      const expectedCids = [
        grandParentCid,
        parentCid,
        childCid
      ]

      const reader = await CarReader.fromIterable(ipfs.dag.export(grandParentCid))
      const cids = await all(reader.cids())

      expect(cids).to.deep.equal(expectedCids)
    })

    it('export of shuffled devnet export identical to canonical original', async function () {
      this.timeout(360000)

      const input = loadFixture('test/interface-tests/fixtures/car/lotus_devnet_genesis.car')
      const result = await all(ipfs.dag.import(async function * () { yield input }()))
      const exported = await toBuffer(ipfs.dag.export(result[0].root.cid))

      expect(exported).to.equalBytes(input)
    })

    it('export of shuffled testnet export identical to canonical original', async function () {
      this.timeout(360000)

      const input = loadFixture('test/interface-tests/fixtures/car/lotus_testnet_export_128.car')
      const result = await all(ipfs.dag.import(async function * () { yield input }()))
      const exported = await toBuffer(ipfs.dag.export(result[0].root.cid))

      expect(exported).to.equalBytes(input)
    })
  })
}
