/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { nanoid } from 'nanoid'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testRename (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.key.rename', () => {
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should rename a key', async function () {
      this.timeout(30 * 1000)

      const oldName = nanoid()
      const newName = nanoid()

      const key = await ipfs.key.gen(oldName, { type: 'rsa', size: 2048 })

      const renameRes = await ipfs.key.rename(oldName, newName)
      expect(renameRes).to.exist()
      expect(renameRes).to.have.property('was', oldName)
      expect(renameRes).to.have.property('now', newName)
      expect(renameRes).to.have.property('id', key.id)

      const res = await ipfs.key.list()
      expect(res.find(k => k.name === newName)).to.exist()
      expect(res.find(k => k.name === oldName)).to.not.exist()
    })
  })
}
