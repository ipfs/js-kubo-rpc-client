/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRm (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.rm', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should rm a key', async function () {
      this.timeout(30 * 1000)

      const key = await ipfs.key.gen(nanoid(), { type: 'rsa', size: 2048 })

      const removeRes = await ipfs.key.rm(key.name)
      expect(removeRes).to.exist()
      expect(removeRes).to.have.property('name', key.name)
      expect(removeRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === key.name)).to.not.exist()
    })
  })
}
