/* eslint-env mocha, browser */

import { expect } from 'aegir/chai'
import last from 'it-last'
import * as raw from 'multiformats/codecs/raw'
import { sha256, sha512 } from 'multiformats/hashes/sha2'
import { Readable } from 'readable-stream'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode } from 'wherearewe'
import { urlSource } from '../../../src/index.js'
import { isFirefox } from '../../constants.js'
import { supportsFileReader } from '../fixtures/supports.js'
import { fixtures } from './utils/index.js'
import { getDescribe, getIt, type MochaConfig } from './utils/mocha.js'
import type { AddProgressFn, KuboRPCClient } from '../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

const echoUrl = (text: string): string => `${process.env.ECHO_SERVER}/download?data=${encodeURIComponent(text)}`
const redirectUrl = (url: string): string => `${process.env.ECHO_SERVER}/redirect?to=${encodeURI(url)}`

export function testAdd (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.add', function () {
    this.timeout(120 * 1000)

    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should add a File', async function () {
      if (!supportsFileReader) {
        // @ts-expect-error this is mocha
        return this.skip('skip in node')
      }

      const fileAdded = await ipfs.add(new File(['should add a File'], 'filename.txt', { type: 'text/plain' }))
      expect(fileAdded.cid.toString()).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a File as tuple', async function () {
      if (!supportsFileReader) {
        // @ts-expect-error this is mocha
        return this.skip('skip in node')
      }

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      const fileAdded = await ipfs.add(tuple)
      expect(fileAdded.cid.toString()).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a Uint8Array', async () => {
      const file = await ipfs.add(fixtures.smallFile.data)

      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal(fixtures.smallFile.cid.toString())
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.smallFile.data.length)
    })

    it('should add a BIG Uint8Array', async function () {
      if (isFirefox) {
        // @ts-expect-error should not have argument
        return this.skip('Skipping in Firefox due to https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602')
      }
      const file = await ipfs.add(fixtures.bigFile.data)

      expect(file.cid.toString()).to.equal(fixtures.bigFile.cid.toString())
      expect(file.path).to.equal(fixtures.bigFile.cid.toString())
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.bigFile.data.length)
    })

    it('should add a BIG Uint8Array with progress enabled', async function () {
      if (isFirefox) {
        // @ts-expect-error should not have argument
        return this.skip('Skipping in Firefox due to https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602')
      }
      let progCalled = false
      let accumProgress = 0

      const handler: AddProgressFn = (p) => {
        progCalled = true
        accumProgress = p
      }

      const file = await ipfs.add(fixtures.bigFile.data, { progress: handler })

      expect(file.cid.toString()).to.equal(fixtures.bigFile.cid.toString())
      expect(file.path).to.equal(fixtures.bigFile.cid.toString())
      expect(progCalled).to.be.true()
      expect(accumProgress).to.equal(fixtures.bigFile.data.length)
    })

    it('should add an empty file with progress enabled', async () => {
      let progCalled = false
      let accumProgress = 0

      const handler: AddProgressFn = (p) => {
        progCalled = true
        accumProgress = p
      }

      const file = await ipfs.add(fixtures.emptyFile.data, { progress: handler })

      expect(file.cid.toString()).to.equal(fixtures.emptyFile.cid.toString())
      expect(file.path).to.equal(fixtures.emptyFile.cid.toString())
      expect(progCalled).to.be.true()
      expect(accumProgress).to.equal(fixtures.emptyFile.data.length)
    })

    it('should receive file name from progress event', async () => {
      let receivedName

      const handler: AddProgressFn = (p, name) => {
        receivedName = name
      }

      await ipfs.add({
        content: 'hello',
        path: 'foo.txt'
      }, { progress: handler })

      expect(receivedName).to.equal('foo.txt')
    })

    it('should add an empty file without progress enabled', async () => {
      const file = await ipfs.add(fixtures.emptyFile.data)

      expect(file.cid.toString()).to.equal(fixtures.emptyFile.cid.toString())
      expect(file.path).to.equal(fixtures.emptyFile.cid.toString())
    })

    it('should add a Uint8Array as tuple', async () => {
      const tuple = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const file = await ipfs.add(tuple)

      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal('testfile.txt')
    })

    it('should add a string', async () => {
      const data = 'a string'
      const expectedCid = 'QmQFRCwEpwQZ5aQMqCsCaFbdjNLLHoyZYDjr92v1F7HeqX'

      const file = await ipfs.add(data)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 16)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should add a TypedArray', async () => {
      const data = Uint8Array.from([1, 3, 8])
      const expectedCid = 'QmRyUEkVCuHC8eKNNJS9BDM9jqorUvnQJK1DM81hfngFqd'

      const file = await ipfs.add(data)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 11)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should add readable stream', async function () {
      if (!isNode) {
        this.skip()
      }
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(uint8ArrayFromString('some data'))
      rs.push(null)

      const file = await ipfs.add(rs)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 17)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should fail when passed invalid input', async () => {
      const nonValid = 138

      // @ts-expect-error nonValid is non valid
      await expect(ipfs.add(nonValid)).to.eventually.be.rejected()
    })

    it('should fail when passed undefined input', async () => {
      // @ts-expect-error undefined is non valid
      await expect(ipfs.add(undefined)).to.eventually.be.rejected()
    })

    it('should fail when passed null input', async () => {
      // @ts-expect-error null is non valid
      await expect(ipfs.add(null)).to.eventually.be.rejected()
    })

    it('should fail when passed multiple file objects', async () => {
      const nonValid = [{ content: 'hello' }, { content: 'world' }]

      // @ts-expect-error nonValid is non valid
      await expect(ipfs.add(nonValid)).to.eventually.be.rejectedWith(/multiple items passed/)
    })

    it('should wrap content in a directory', async () => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const wrapper = await ipfs.add(data, { wrapWithDirectory: true })
      expect(wrapper.path).to.equal('')

      const stats = await ipfs.files.stat(`/ipfs/${wrapper.cid}/testfile.txt`)

      expect(`${stats.cid}`).to.equal(fixtures.smallFile.cid.toString())
    })

    it('should add with only-hash=true', async function () {
      this.slow(10 * 1000)
      const content = `${Math.random() + Date.now()}`

      const file = await ipfs.add(content, { onlyHash: true })

      await expect(ipfs.dag.get(file.cid, { timeout: 4000 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
    })

    it('should add with sha2-256 by default', async function () {
      const content = `${Math.random() + Date.now()}`

      const file = await ipfs.add(content)

      expect(file).to.have.nested.property('cid.multihash.code', sha256.code)
    })

    it('should add with a different hashing algorithm', async function () {
      const content = `${Math.random() + Date.now()}`

      const file = await ipfs.add(content, { hashAlg: 'sha2-512' })

      expect(file).to.have.nested.property('cid.multihash.code', sha512.code)
    })

    it('should add from a HTTP URL', async () => {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url)),
        ipfs.add(text)
      ])

      expect(result.cid.toString()).to.equal(expectedResult.cid.toString())
      expect(result.size).to.equal(expectedResult.size)
    })

    it('should add from a HTTP URL with redirection', async () => {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(redirectUrl(url))),
        ipfs.add(text)
      ])

      expect(result.cid.toString()).to.equal(expectedResult.cid.toString())
      expect(result.size).to.equal(expectedResult.size)
    })

    it('should add from a URL with only-hash=true', async function () {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const res = await ipfs.add(urlSource(url), { onlyHash: true })

      await expect(ipfs.dag.get(res.cid, { timeout: 500 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
    })

    it('should add from a URL with wrap-with-directory=true', async () => {
      const filename = `TEST${Date.now()}.txt` // also acts as data
      const url = echoUrl(filename)
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url), addOpts),
        ipfs.add({ path: 'download', content: filename }, addOpts)
      ])
      expect(result).to.deep.equal(expectedResult)
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', async () => {
      const filename = `320px-Domažlice,_Jiráskova_43_(${Date.now()}).jpg` // also acts as data
      const url = echoUrl(filename)
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url), addOpts),
        ipfs.add({ path: 'download', content: filename }, addOpts)
      ])

      expect(result).to.deep.equal(expectedResult)
    })

    it('should not add from an invalid url', () => {
      return expect((): any => ipfs.add(urlSource('123http://invalid'))).to.throw()
    })

    it('should respect raw leaves when file is smaller than one block and no metadata is present', async () => {
      const file = await ipfs.add(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1,
        rawLeaves: true
      })

      expect(file.cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(file.cid.code).to.equal(raw.code)
      expect(file.size).to.equal(3)
    })

    it('should add a file with a v1 CID', async () => {
      const file = await ipfs.add(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1
      })

      expect(file.cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(file.size).to.equal(3)
    })

    const testFiles = Array.from(Array(1005), (_, i) => ({
      path: `test-folder/${i}`,
      content: uint8ArrayFromString(`some content ${i}`)
    }))

    it('should be able to add dir without sharding', async () => {
      const result = await last(ipfs.addAll(testFiles))

      if (result == null) {
        throw new Error('No addAll result received')
      }

      const { path, cid } = result
      expect(path).to.eql('test-folder')
      expect(cid.toString()).to.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
    })

    describe('with sharding', function () {
      this.timeout(200 * 1000)
      let ipfs: KuboRPCClient

      before(async function () {
        const ipfsd = await factory.spawn({
          init: {
            config: {
              // enable sharding for go with automatic threshold dropped to the minimum so it shards everything
              Internal: {
                UnixFSShardingSizeThreshold: '1B'
              }
            }
          }
        })
        ipfs = ipfsd.api
      })

      it('should be able to add dir with sharding', async () => {
        const result = await last(ipfs.addAll(testFiles))

        if (result == null) {
          throw new Error('No addAll result received')
        }

        const { path, cid } = result
        expect(path).to.eql('test-folder')
        expect(cid.toString()).to.eql('Qmb3JNLq2KcvDTSGT23qNQkMrr4Y4fYMktHh6DtC7YatLa')
      })
    })
  })
}
