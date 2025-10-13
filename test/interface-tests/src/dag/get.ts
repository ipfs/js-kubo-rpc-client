/* eslint-env mocha */

import * as dagCBOR from '@ipld/dag-cbor'
import * as dagPB from '@ipld/dag-pb'
import { expect } from 'aegir/chai'
import * as dagJOSE from 'dag-jose'
import { ES256KSigner, createJWS } from 'did-jwt'
import { UnixFS } from 'ipfs-unixfs'
import { importer } from 'ipfs-unixfs-importer'
import all from 'it-all'
import { base32 } from 'multiformats/bases/base32'
import { base64url } from 'multiformats/bases/base64'
import { CID } from 'multiformats/cid'
import { identity } from 'multiformats/hashes/identity'
import { sha256 } from 'multiformats/hashes/sha2'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import blockstore from '../utils/blockstore-adapter.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { MochaConfig } from '../utils/mocha.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testGet (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.dag.get', () => {
    let ipfs: KuboRPCClient
    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    let pbNode: dagPB.PBNode
    let cborNode: any
    let joseNode: dagJOSE.DagJWE
    let nodePb: dagPB.PBNode
    let nodeCbor: any
    let nodeJose: string
    let cidPb: CID
    let cidCbor: CID
    let cidJose: CID

    before(async function () {
      const someData = uint8ArrayFromString('some other data')
      pbNode = {
        Data: someData,
        Links: []
      }
      cborNode = {
        data: someData
      }
      joseNode = {
        protected: 'eyJhbGciOiJkaXIiLCJlbmMiOiJYQzIwUCJ9',
        iv: 'DhVb9URR_o_85MOl-hCellwPTtQ_dj6d',
        ciphertext: 'EtUsNJcKzEKdFM9DW5Ua5tVyaQRCKsAD',
        tag: '-vG17pRSVB2Vycf2MZRgBA'
      }

      nodePb = {
        Data: uint8ArrayFromString('I am inside a Protobuf'),
        Links: []
      }
      cidPb = CID.createV1(dagPB.code, await sha256.digest(dagPB.encode(nodePb)))
      nodeCbor = {
        someData: 'I am inside a Cbor object',
        pb: cidPb
      }

      cidCbor = CID.createV1(dagCBOR.code, await sha256.digest(dagCBOR.encode(nodeCbor)))

      await ipfs.dag.put(nodePb, { storeCodec: 'dag-pb', hashAlg: 'sha2-256' })
      await ipfs.dag.put(nodeCbor, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })

      const signer = ES256KSigner(uint8ArrayFromString('278a5de700e29faae8e40e366ec5012b'))
      nodeJose = await createJWS(base64url.encode(cidCbor.bytes).slice(1), signer)
      cidJose = CID.createV1(dagJOSE.code, await sha256.digest(dagJOSE.encode(nodeJose)))
      await ipfs.dag.put(nodeJose, { storeCodec: dagJOSE.name, hashAlg: 'sha2-256' })
    })

    it('should get a dag-pb node', async () => {
      const cid = await ipfs.dag.put(pbNode, {
        storeCodec: 'dag-pb',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)

      const node = result.value
      expect(pbNode).to.eql(node)
    })

    it('should get a dag-cbor node', async () => {
      const cid = await ipfs.dag.put(cborNode, {
        storeCodec: 'dag-cbor',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)

      const node = result.value
      expect(cborNode).to.eql(node)
    })

    it('should get a dag-pb node with path', async () => {
      const result = await ipfs.dag.get(cidPb, {
        path: '/'
      })

      const node = result.value

      const cid = CID.createV1(dagPB.code, await sha256.digest(dagPB.encode(node)))
      expect(cid.equals(cidPb)).to.be.true()
    })

    it('should get a dag-pb node local value', async function () {
      const result = await ipfs.dag.get(cidPb, {
        path: 'Data'
      })
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it('should get a dag-cbor node with path', async () => {
      const result = await ipfs.dag.get(cidCbor, {
        path: '/'
      })

      const node = result.value

      const cid = CID.createV1(dagCBOR.code, await sha256.digest(dagCBOR.encode(node)))
      expect(cid.equals(cidCbor)).to.be.true()
    })

    it('should get a dag-cbor node local value', async () => {
      const result = await ipfs.dag.get(cidCbor, {
        path: 'someData'
      })
      expect(result.value).to.eql('I am inside a Cbor object')
    })

    it('should get dag-pb value via dag-cbor node', async function () {
      const result = await ipfs.dag.get(cidCbor, {
        path: 'pb/Data'
      })
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it('should get by CID with path option', async function () {
      const result = await ipfs.dag.get(cidCbor, { path: '/pb/Data' })
      expect(result.value).to.eql(uint8ArrayFromString('I am inside a Protobuf'))
    })

    it('should get with options and no path', async function () {
      const result = await ipfs.dag.get(cidCbor, { localResolve: true })
      expect(result.value).to.deep.equal(nodeCbor)
    })

    it('should get a node added as CIDv1 with a CIDv0', async () => {
      const input = uint8ArrayFromString(`TEST${Math.random()}`)

      const res = await all(importer([{ content: input }], blockstore(ipfs), {
        cidVersion: 1,
        rawLeaves: false
      }))

      const cidv1 = res[0].cid
      expect(cidv1.version).to.equal(1)

      const cidv0 = cidv1.toV0()

      const output = await ipfs.dag.get(cidv0)
      expect(UnixFS.unmarshal(output.value.Data).data).to.eql(input)
    })

    it('should be able to get part of a dag-cbor node', async () => {
      const cbor = {
        foo: 'dag-cbor-bar'
      }

      const cid = await ipfs.dag.put(cbor, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
      expect(cid.code).to.equal(dagCBOR.code)
      expect(cid.toString(base32)).to.equal('bafyreic6f672hnponukaacmk2mmt7vs324zkagvu4hcww6yba6kby25zce')

      const result = await ipfs.dag.get(cid, {
        path: 'foo'
      })
      expect(result.value).to.equal('dag-cbor-bar')
    })

    it('should be able to traverse from one dag-cbor node to another', async () => {
      const cbor1 = {
        foo: 'dag-cbor-bar'
      }

      const cid1 = await ipfs.dag.put(cbor1, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })
      const cbor2 = { other: cid1 }

      const cid2 = await ipfs.dag.put(cbor2, { storeCodec: 'dag-cbor', hashAlg: 'sha2-256' })

      const result = await ipfs.dag.get(cid2, {
        path: 'other/foo'
      })
      expect(result.value).to.equal('dag-cbor-bar')
    })

    it('should be able to get a DAG node with format raw', async () => {
      const buf = Uint8Array.from([0, 1, 2, 3])

      const cid = await ipfs.dag.put(buf, {
        storeCodec: 'raw',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)
      expect(result.value).to.deep.equal(buf)
    })

    it('should be able to get a dag-cbor node with the identity hash', async () => {
      const identityData = uint8ArrayFromString('A16461736466190144', 'base16upper')
      const identityHash = identity.digest(identityData)
      const identityCID = CID.createV1(identity.code, identityHash)
      const result = await ipfs.dag.get(identityCID)
      expect(result.value).to.deep.equal(identityData)
    })

    it('should throw error for invalid string CID input', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.dag.get('INVALID CID'))
        .to.eventually.be.rejected()
    })

    it('should throw error for invalid buffer CID input', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.dag.get(uint8ArrayFromString('INVALID CID')))
        .to.eventually.be.rejected()
    })

    it('should return nested content when getting a CID with a path', async () => {
      const regularContent = { test: '123' }
      const cid1 = await ipfs.dag.put(regularContent)
      const linkedContent = { link: cid1 }
      const cid2 = await ipfs.dag.put(linkedContent)

      const atPath = await ipfs.dag.get(cid2, { path: '/link' })

      expect(atPath).to.have.deep.property('value', regularContent)
    })

    it('should not return nested content when getting a CID with a path and localResolve is true', async () => {
      const regularContent = { test: '123' }
      const cid1 = await ipfs.dag.put(regularContent)
      const linkedContent = { link: cid1 }
      const cid2 = await ipfs.dag.put(linkedContent)

      const atPath = await ipfs.dag.get(cid2, { path: '/link', localResolve: true })

      expect(atPath).to.have.deep.property('value').that.is.an.instanceOf(CID)
    })

    it('should get a dag-jose node', async () => {
      const cid = await ipfs.dag.put(joseNode, {
        storeCodec: 'dag-jose',
        hashAlg: 'sha2-256'
      })

      const result = await ipfs.dag.get(cid)

      const node = result.value
      expect(joseNode).to.eql(node)
    })

    it('should get a dag-jose node with path', async () => {
      const result = await ipfs.dag.get(cidJose, {
        path: '/'
      })

      const node = result.value

      const cid = CID.createV1(dagJOSE.code, await sha256.digest(dagJOSE.encode(node)))
      expect(cid.equals(cidJose)).to.be.true()
    })

    it('should get a dag-jose node local value', async () => {
      const result = await ipfs.dag.get(cidJose, {
        path: 'payload'
      })
      const converted = dagJOSE.toGeneral(nodeJose)
      expect(result.value).to.eql('payload' in converted && converted.payload)
    })

    it('should get dag-cbor value via dag-jose node', async function () {
      const result = await ipfs.dag.get(cidJose, {
        path: 'link/someData'
      })
      expect(result.value).to.eql('I am inside a Cbor object')
    })

    it('should get dag-cbor cid via dag-jose node if local resolve', async function () {
      const result = await ipfs.dag.get(cidJose, {
        path: 'link',
        localResolve: true
      })
      expect(result.value).to.eql(cidCbor)
    })
  })
}
