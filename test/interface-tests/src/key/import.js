/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { keys } from 'libp2p-crypto'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'
import { notImplemented } from '../../../constants.js'

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

  describe('.key.import', function () {
    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async function () {
      if (notImplemented()) {
        return this.skip('Not implemented in kubo yet')
      }
      ipfs = (await factory.spawn()).api
    })

    after(function () { return factory.clean() })

    it('should import an exported key', async function () {
      const password = nanoid()

      const key = await keys.generateKeyPair('Ed25519')
      const exported = await key.export(password)

      const importedKey = await ipfs.key.import('clone', exported, password)
      expect(importedKey).to.exist()
      expect(importedKey).to.have.property('name', 'clone')
      expect(importedKey).to.have.property('id')
    })
  })
}
