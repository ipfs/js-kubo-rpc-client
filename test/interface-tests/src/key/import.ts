/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { keys } from '@libp2p/crypto'
import { expect } from 'aegir/chai'
import { getDescribe, getIt } from '../utils/mocha.js'

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

  describe('.key.import', () => {
    /** @type {import('../../../../src/types.js').IPFSHTTPClient} */
    let ipfs

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () { return await factory.clean() })

    it('should import an exported key', async () => {
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
