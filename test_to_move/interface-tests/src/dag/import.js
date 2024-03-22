/* eslint-env mocha */

import all from 'it-all'
import drain from 'it-drain'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { CarWriter, CarReader } from '@ipld/car'
import * as raw from 'multiformats/codecs/raw'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import loadFixture from 'aegir/fixtures'
import { byCID } from '../utils/index.js'

/**
 *
 * @param {number} num
 */
async function createBlocks (num) {
  const blocks = []

  for (let i = 0; i < num; i++) {
    const bytes = uint8ArrayFromString('block-' + Math.random())
    const digest = await sha256.digest(raw.encode(bytes))
    const cid = CID.create(1, raw.code, digest)

    blocks.push({ bytes, cid })
  }

  return blocks
}

/**
 * @param {{ cid: CID, bytes: Uint8Array }[]} blocks
 * @returns {Promise<AsyncIterable<Uint8Array>>}
 */
async function createCar (blocks) {
  const rootBlock = blocks[0]
  const { writer, out } = await CarWriter.create([rootBlock.cid])

  writer.put(rootBlock)
    .then(async () => {
      for (const block of blocks.slice(1)) {
        writer.put(block)
      }

      await writer.close()
    })

  return out
}

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {object} options
 */
export function testImport (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.import', () => {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs
    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should import a car file', async () => {
      const blocks = await createBlocks(5)
      const car = await createCar(blocks)

      const result = await all(ipfs.dag.import(car))
      expect(result).to.have.lengthOf(1)
      // @ts-ignore chai types are messed up
      expect(result).to.have.nested.deep.property('[0].root.cid', blocks[0].cid)

      for (const { cid } of blocks) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }

      await expect(all(ipfs.pin.ls({ paths: blocks[0].cid }))).to.eventually.have.lengthOf(1)
        .and.have.nested.property('[0].type', 'recursive')
    })

    it('should import a car file without pinning the roots', async () => {
      const blocks = await createBlocks(5)
      const car = await createCar(blocks)

      await all(ipfs.dag.import(car, {
        pinRoots: false
      }))

      await expect(all(ipfs.pin.ls({ paths: blocks[0].cid }))).to.eventually.be.rejectedWith(/is not pinned/)
    })

    it('should import multiple car files', async () => {
      const blocks1 = await createBlocks(5)
      const car1 = await createCar(blocks1)

      const blocks2 = await createBlocks(5)
      const car2 = await createCar(blocks2)

      const result = await all(ipfs.dag.import([car1, car2]))
      expect(result).to.have.lengthOf(2)
      expect(result).to.deep.include({ root: { cid: blocks1[0].cid, pinErrorMsg: '' } })
      expect(result).to.deep.include({ root: { cid: blocks2[0].cid, pinErrorMsg: '' } })

      for (const { cid } of blocks1) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }

      for (const { cid } of blocks2) {
        await expect(ipfs.block.get(cid)).to.eventually.be.ok()
      }
    })

    it('should import car with roots but no blocks', async function () {
      this.timeout(120 * 1000)
      const input = loadFixture('test/interface-tests/fixtures/car/combined_naked_roots_genesis_and_128.car')

      const reader = await CarReader.fromBytes(input)
      const cids = (await reader.getRoots()).sort((a, b) => byCID({ cid: a }, { cid: b }))

      expect(cids).to.have.lengthOf(2)

      let result = await all(ipfs.dag.import((async function * () { yield input }())))
      /**
       * Sorting by cids is a workaround for intermittent test failures because of cids being returned in different order
       */
      result = result.sort((a, b) => byCID(a.root, b.root))

      expect(result).to.have.lengthOf(2)
      // naked roots car does not contain blocks
      expect(result[0].root.cid.toString()).to.equal(cids[0].toString())
      expect(result[0].root.pinErrorMsg).to.be.a('string')
      expect(result[0].root.pinErrorMsg).to.not.be.empty('result[0].root.pinErrorMsg should not be empty')
      expect(result[0].root.pinErrorMsg).to.contain('ipld: could not find')
      expect(result[1].root.cid.toString()).to.equal(cids[1].toString())
      expect(result[1].root.pinErrorMsg).to.be.a('string')
      expect(result[1].root.pinErrorMsg).to.not.be.empty('result[1].root.pinErrorMsg should not be empty')
      expect(result[0].root.pinErrorMsg).to.contain('ipld: could not find')

      await drain(ipfs.dag.import(async function * () { yield loadFixture('test/interface-tests/fixtures/car/lotus_devnet_genesis_shuffled_nulroot.car') }()))
      result = await all(ipfs.dag.import((async function * () { yield input }())))
      result = result.sort((a, b) => byCID(a.root, b.root))

      expect(result).to.have.lengthOf(2)
      expect(result[0].root.cid.toString()).to.equal(cids[0].toString())
      expect(result[0].root.pinErrorMsg).to.be.a('string')
      expect(result[0].root.pinErrorMsg).to.be.empty()
      expect(result[1].root.cid.toString()).to.equal(cids[1].toString())
      // TODO: https://github.com/ipfs/js-kubo-rpc-client/issues/94 - This is failing. The error message is empty, but it should not be.
      // expect(result[1].root.pinErrorMsg).to.be.a('string')
      // expect(result[1].root.pinErrorMsg).to.not.be.empty('result[1].root.pinErrorMsg should not be empty')
      // expect(result[0].root.pinErrorMsg).to.contain('ipld: could not find')

      await drain(ipfs.dag.import((async function * () { yield loadFixture('test/interface-tests/fixtures/car/lotus_testnet_export_128.car') }())))

      result = await all(ipfs.dag.import((async function * () { yield input }())))
      result = result.sort((a, b) => byCID(a.root, b.root))
      // have all of the blocks now, should be able to pin both
      expect(result[0].root.cid.toString()).to.equal(cids[0].toString())
      expect(result[0].root.pinErrorMsg).to.be.a('string')
      expect(result[0].root.pinErrorMsg).to.be.empty()
      expect(result[1].root.cid.toString()).to.equal(cids[1].toString())
      expect(result[1].root.pinErrorMsg).to.be.a('string')
      expect(result[1].root.pinErrorMsg).to.be.empty()
    })

    it('should import lotus devnet genesis shuffled nulroot', async () => {
      const input = loadFixture('test/interface-tests/fixtures/car/lotus_devnet_genesis_shuffled_nulroot.car')
      const reader = await CarReader.fromBytes(input)
      const cids = await reader.getRoots()

      expect(cids).to.have.lengthOf(1)
      expect(cids[0].toString()).to.equal('bafkqaaa')

      const result = await all(ipfs.dag.import(async function * () { yield input }()))
      expect(result).to.have.nested.deep.property('[0].root.cid', cids[0])
    })
  })
}
