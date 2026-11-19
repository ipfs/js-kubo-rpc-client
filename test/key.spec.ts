import { generateKeyPair, privateKeyToCryptoKeyPair, privateKeyToProtobuf } from '@libp2p/crypto/keys'
import { peerIdFromPrivateKey } from '@libp2p/peer-id'
import { expect } from 'aegir/chai'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { factory } from './utils/factory.ts'
import type { KuboRPCClient } from '../src/index.ts'

const f = factory()

describe('.key', function () {
  this.timeout(50 * 1000)

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () { return f.clean() })

  describe('.gen', function () {
    it('create a new rsa key', async function () {
      const res = await ipfs.key.gen('foobarsa', { type: 'rsa', size: 2048 })

      expect(res).to.exist()
    })

    it('create a new ed25519 key', async function () {
      const res = await ipfs.key.gen('bazed', { type: 'ed25519' })

      expect(res).to.exist()
    })
  })

  describe('.list', function () {
    it('both keys show up + self', async function () {
      const res = await ipfs.key.list()

      expect(res).to.exist()
      expect(res.length).to.equal(3)
    })
  })

  describe('.import', function () {
    it('imports a protobuf private key', async function () {
      const key = await generateKeyPair('Ed25519')
      const imported = await ipfs.key.import('imported-protobuf', privateKeyToProtobuf(key), {
        ipnsBase: 'b58mh'
      })

      expect(imported.name).to.equal('imported-protobuf')
      expect(imported.id).to.equal(peerIdFromPrivateKey(key).toString())
    })

    it('imports a PKCS8 PEM Blob', async function () {
      const key = await generateKeyPair('RSA', 2048)
      const pair = await privateKeyToCryptoKeyPair(key)
      const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))
      const pem = `-----BEGIN PRIVATE KEY-----\n${uint8ArrayToString(pkcs8, 'base64pad')}\n-----END PRIVATE KEY-----`
      const imported = await ipfs.key.import('imported-pem', new Blob([pem]), {
        format: 'pem-pkcs8-cleartext',
        ipnsBase: 'b58mh'
      })

      expect(imported.name).to.equal('imported-pem')
      expect(imported.id).to.equal(peerIdFromPrivateKey(key).toString())
    })
  })
})
