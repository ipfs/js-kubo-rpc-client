/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import drain from 'it-drain'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import { fixtures, clearPins } from './utils.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testRmAll (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.pin.rmAll', function () {
    this.timeout(50 * 1000)

    let ipfs: KuboRPCClient

    beforeEach(async function () {
      ipfs = (await factory.spawn()).api

      const dir = fixtures.directory.files.map((file) => ({ path: file.path, content: file.data }))
      await all(ipfs.addAll(dir, { pin: false, cidVersion: 0 }))

      await ipfs.add(fixtures.files[0].data, { pin: false })
      await ipfs.add(fixtures.files[1].data, { pin: false })
    })

    after(async function () {
      await factory.clean()
    })

    beforeEach(async function () {
      return clearPins(ipfs)
    })

    it('should pipe the output of ls to rm', async () => {
      await ipfs.pin.add(fixtures.directory.cid)

      await drain(ipfs.pin.rmAll(ipfs.pin.ls({ type: 'recursive' })))

      await expect(all(ipfs.pin.ls())).to.eventually.have.lengthOf(0)
    })
  })
}
