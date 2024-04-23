/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testSet (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.set', function () {
    this.timeout(30 * 1000)
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should set a new key', async () => {
      await ipfs.config.set('Fruit', 'banana')

      const fruit = await ipfs.config.get('Fruit')
      expect(fruit).to.equal('banana')
    })

    it('should set an already existing key', async () => {
      await ipfs.config.set('Fruit', 'morango')

      const fruit = await ipfs.config.get('Fruit')
      expect(fruit).to.equal('morango')
    })

    it('should set a number', async () => {
      const key = 'Discovery.MDNS.Interval'
      const val = 11

      await ipfs.config.set(key, val)

      const result = await ipfs.config.get(key)
      expect(result).to.equal(val)
    })

    it('should set a boolean', async () => {
      const value = true
      const key = 'Discovery.MDNS.Enabled'

      await ipfs.config.set(key, value)
      expect(await ipfs.config.get(key)).to.equal(value)
    })

    it('should set the other boolean', async () => {
      const value = false
      const key = 'Discovery.MDNS.Enabled'

      await ipfs.config.set(key, value)
      expect(await ipfs.config.get(key)).to.equal(value)
    })

    it('should set a JSON object', async () => {
      const key = 'API.HTTPHeaders.Access-Control-Allow-Origin'
      const val = ['http://example.io']

      await ipfs.config.set(key, val)

      const result = await ipfs.config.get(key)
      expect(result).to.deep.equal(val)
    })

    it('should fail on non valid key', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.config.set(uint8ArrayFromString('heeey'), '')).to.eventually.be.rejected()
    })

    it('should fail on non valid value', () => {
      const val: any = {}
      val.val = val
      return expect(ipfs.config.set('Fruit', val)).to.eventually.be.rejected()
    })
  })
}
