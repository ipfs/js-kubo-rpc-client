/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testList (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.list', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should list all the keys', async function () {
      this.timeout(60 * 1000)

      const keys = await Promise.all([1, 2, 3].map(async () => ipfs.key.gen(nanoid(), { type: 'rsa', size: 2048 })))

      const res = await ipfs.key.list()
      expect(res).to.exist()
      expect(res).to.be.an('array')
      expect(res.length).to.be.above(keys.length - 1)

      keys.forEach(key => {
        const found = res.find(({ id, name }) => name === key.name && id === key.id)
        expect(found).to.exist()
      })
    })
  })
}
