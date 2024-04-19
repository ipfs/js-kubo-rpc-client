/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { importer, type ImportCandidate } from 'ipfs-unixfs-importer'
import all from 'it-all'
import drain from 'it-drain'
import last from 'it-last'
import map from 'it-map'
import { pipe } from 'it-pipe'
import { extract, type TarEntryHeader } from 'it-tar'
import toBuffer from 'it-to-buffer'
import { CID } from 'multiformats/cid'
import Pako from 'pako'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import blockstore from './utils/blockstore-adapter.js'
import { fixtures } from './utils/index.js'
import { getDescribe, getIt, type MochaConfig } from './utils/mocha.js'
import type { KuboRPCFactory } from './index.js'
import type { KuboRPCClient } from '../../../src/index.js'

const content = (name: string, path?: string): ImportCandidate => {
  if (path == null) {
    path = name
  }

  return {
    path: `test-folder/${path}`,
    content: fixtures.directory.files[name]
  }
}

const emptyDir = (name: string): ImportCandidate => ({ path: `test-folder/${name}` })

export function testGet (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.get', function () {
    this.timeout(120 * 1000)

    let ipfs: KuboRPCClient

    async function * gzipped (source: AsyncIterable<Uint8Array>): AsyncGenerator<Uint8Array> {
      const inflator = new Pako.Inflate()

      for await (const buf of source) {
        inflator.push(buf, false)
      }

      inflator.push(new Uint8Array(0), true)

      if (inflator.err > 0) {
        throw new Error(`Error ungzipping - message: "${inflator.msg}" code: ${inflator.err}`)
      }

      if (inflator.result instanceof Uint8Array) {
        yield inflator.result
      } else {
        throw new Error('Unexpected gzip data type')
      }
    }

    async function * tarballed (source: AsyncIterable<Uint8Array>): AsyncGenerator<{ body: Uint8Array, header: TarEntryHeader }> {
      yield * pipe(
        source,
        extract(),
        async function * (source) {
          for await (const entry of source) {
            yield {
              ...entry,
              body: await toBuffer(map(entry.body, (buf) => buf.slice()))
            }
          }
        }
      )
    }

    async function collect <T> (source: AsyncIterable<T>): Promise<T[]> {
      return all(source)
    }

    before(async function () {
      ipfs = (await factory.spawn()).api

      await ipfs.add({ content: fixtures.smallFile.data })
      await ipfs.add({ content: fixtures.bigFile.data })
    })

    after(async function () {
      await factory.clean()
    })

    describe('files', function () {
      it('should get with a base58 encoded multihash', async () => {
        const output = await pipe(
          ipfs.get(fixtures.smallFile.cid),
          tarballed,
          collect
        )
        expect(output).to.have.lengthOf(1)
        expect(output).to.have.nested.property('[0].header.name', fixtures.smallFile.cid.toString())
        expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.smallFile.data)
      })

      it('should get a file added as CIDv0 with a CIDv1', async () => {
        const input = uint8ArrayFromString(`TEST${Math.random()}`)
        const res = await all(importer([{ content: input }], blockstore(ipfs), {
          cidVersion: 0,
          rawLeaves: false
        }))

        const cidv0 = res[0].cid
        expect(cidv0.version).to.equal(0)

        const cidv1 = cidv0.toV1()

        const output = await pipe(
          ipfs.get(cidv1),
          tarballed,
          collect
        )
        expect(output).to.have.lengthOf(1)
        expect(output).to.have.nested.property('[0].header.name', cidv1.toString())
        expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
      })

      it('should get a file added as CIDv1 with a CIDv0', async () => {
        const input = uint8ArrayFromString(`TEST${Math.random()}`)
        const res = await all(importer([{ content: input }], blockstore(ipfs), { cidVersion: 1, rawLeaves: false }))

        const cidv1 = res[0].cid
        expect(cidv1.version).to.equal(1)

        const cidv0 = cidv1.toV0()

        const output = await pipe(
          ipfs.get(cidv0),
          tarballed,
          collect
        )
        expect(output).to.have.lengthOf(1)
        expect(output).to.have.nested.property('[0].header.name', cidv0.toString())
        expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
      })

      it('should get a file added as CIDv1 with rawLeaves', async () => {
        const input = uint8ArrayFromString(`TEST${Math.random()}`)
        const res = await all(importer([{ content: input }], blockstore(ipfs), { cidVersion: 1, rawLeaves: true }))

        const cidv1 = res[0].cid
        expect(cidv1.version).to.equal(1)

        const output = await pipe(
          ipfs.get(cidv1),
          tarballed,
          collect
        )
        expect(output).to.have.lengthOf(1)
        expect(output).to.have.nested.property('[0].header.name', cidv1.toString())
        expect(output).to.have.nested.property('[0].body').that.equalBytes(input)
      })

      it('should get a BIG file', async () => {
        const output = await pipe(
          ipfs.get(fixtures.bigFile.cid),
          tarballed,
          collect
        )
        expect(output).to.have.lengthOf(1)
        expect(output).to.have.nested.property('[0].header.name', fixtures.bigFile.cid.toString())
        expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.bigFile.data)
      })

      it('should get with ipfs path, as object and nested value', async () => {
        const file = {
          path: 'a/testfile.txt',
          content: fixtures.smallFile.data
        }

        const fileAdded = await last(importer([file], blockstore(ipfs)))

        if (fileAdded == null) {
          throw new Error('No file was added')
        }

        expect(fileAdded).to.have.property('path', 'a')

        const output = await pipe(
          ipfs.get(`/ipfs/${fileAdded.cid}/testfile.txt`),
          tarballed,
          async (source) => collect(source)
        )
        expect(output).to.be.length(1)

        expect(uint8ArrayToString(output[0].body)).to.equal('Plz add me!\n')
      })

      it('should compress a file directly', async () => {
        const output = await pipe(
          ipfs.get(fixtures.smallFile.cid, {
            compress: true,
            compressionLevel: 5
          }),
          gzipped,
          async (source) => collect(source)
        )
        expect(uint8ArrayConcat(output)).to.equalBytes(fixtures.smallFile.data)
      })

      it('should compress a file as a tarball', async () => {
        const output = await pipe(
          ipfs.get(fixtures.smallFile.cid, {
            archive: true,
            compress: true,
            compressionLevel: 5
          }),
          gzipped,
          tarballed,
          collect
        )
        expect(output).to.have.nested.property('[0].body').that.equalBytes(fixtures.smallFile.data)
      })

      it('should compress a file with invalid compression level', async () => {
        await expect(drain(ipfs.get(fixtures.smallFile.cid, {
          compress: true,
          // @ts-expect-error invalid valu
          compressionLevel: 10
        }))).to.eventually.be.rejected()
      })

      it('should error on invalid key', async () => {
        const invalidCid = 'somethingNotMultihash'

        await expect(all(ipfs.get(invalidCid))).to.eventually.be.rejected()
      })

      it('get path containing "+"s', async () => {
        const filename = 'ti,c64x+mega++mod-pic.txt'
        const subdir = 'tmp/c++files'
        const expectedCid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'
        const path = `${subdir}/${filename}`
        const files = await all(ipfs.addAll([{
          path,
          content: path
        }]))

        expect(files[2].cid.toString()).to.equal(expectedCid)

        const cid = 'QmPkmARcqjo5fqK1V1o8cFsuaXxWYsnwCNLJUYS4KeZyff'

        const output = await pipe(
          ipfs.get(CID.parse(cid)),
          tarballed,
          collect
        )

        expect(output).to.be.an('array').with.lengthOf(3)
        expect(output).to.have.nested.property('[0].header.name', cid)
        expect(output).to.have.nested.property('[1].header.name', `${cid}/c++files`)
        expect(output).to.have.nested.property('[2].header.name', `${cid}/c++files/ti,c64x+mega++mod-pic.txt`)
      })
    })

    describe('directories', function () {
      it('should get a directory', async function () {
        const dirs = [
          content('pp.txt'),
          content('holmes.txt'),
          content('jungle.txt'),
          content('alice.txt'),
          emptyDir('empty-folder'),
          content('files/hello.txt'),
          content('files/ipfs.txt'),
          emptyDir('files/empty')
        ]

        const root = await last(ipfs.addAll(dirs))

        if (root == null) {
          throw new Error('Not enough output')
        }

        const { cid } = root
        expect(`${cid}`).to.equal(fixtures.directory.cid.toString())
        const output = await pipe(
          ipfs.get(cid),
          tarballed,
          async (source) => collect(source)
        )

        // Check paths
        const paths = output.map((file) => { return file.header.name })
        expect(paths).to.include.members([
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/alice.txt',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/empty-folder',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/empty',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/hello.txt',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/files/ipfs.txt',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/holmes.txt',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/jungle.txt',
          'QmVvjDy7yF7hdnqE8Hrf4MHo5ABDtb5AbX6hWbD3Y42bXP/pp.txt'
        ])
        const resultAsStringArray = output.map(f => uint8ArrayToString(f.body))

        // Check contents
        expect(resultAsStringArray).to.include.members([
          uint8ArrayToString(fixtures.directory.files['alice.txt']),
          uint8ArrayToString(fixtures.directory.files['files/hello.txt']),
          uint8ArrayToString(fixtures.directory.files['files/ipfs.txt']),
          uint8ArrayToString(fixtures.directory.files['holmes.txt']),
          uint8ArrayToString(fixtures.directory.files['jungle.txt']),
          uint8ArrayToString(fixtures.directory.files['pp.txt'])
        ])
      })

      it('should get a nested directory', async function () {
        const dirs: ImportCandidate[] = [
          content('pp.txt', 'pp.txt'),
          content('holmes.txt', 'foo/holmes.txt'),
          content('jungle.txt', 'foo/bar/jungle.txt')
        ]

        const res = await all(importer(dirs, blockstore(ipfs), {
          cidVersion: 0,
          rawLeaves: false
        }))
        const { cid } = res[res.length - 1]
        expect(`${cid}`).to.equal('QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g')
        const output = await pipe(
          ipfs.get(cid),
          tarballed,
          async (source) => collect(source)
        )

        // Check paths
        expect(output.map((file) => { return file.header.name })).to.include.members([
          'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g',
          'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/pp.txt',
          'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/holmes.txt',
          'QmVMXXo3c2bDPH9ayy2VKoXpykfYJHwAcU5YCJjPf7jg3g/foo/bar/jungle.txt'
        ])

        // Check contents
        expect(output.map(f => uint8ArrayToString(f.body))).to.include.members([
          uint8ArrayToString(fixtures.directory.files['pp.txt']),
          uint8ArrayToString(fixtures.directory.files['holmes.txt']),
          uint8ArrayToString(fixtures.directory.files['jungle.txt'])
        ])
      })

      it('should compress a directory as a tarball', async () => {
        const dirs = [
          content('pp.txt'),
          emptyDir('empty-folder'),
          content('files/hello.txt')
        ]

        const res = await all(importer(dirs, blockstore(ipfs), {
          cidVersion: 0,
          rawLeaves: false
        }))
        const { cid } = res[res.length - 1]
        const output = await pipe(
          ipfs.get(cid, {
            archive: true,
            compress: true,
            compressionLevel: 5
          }),
          gzipped,
          tarballed,
          async (source) => collect(source)
        )

        // Check paths
        const paths = output.map((file) => { return file.header.name })
        expect(paths).to.include.members([
          'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU',
          'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/empty-folder',
          'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/files/hello.txt',
          'QmXpbhYKheGs5sopefFjsABsjr363QkRaJT4miRsN88ABU/pp.txt'
        ])

        // Check contents
        expect(output.map(f => uint8ArrayToString(f.body))).to.include.members([
          uint8ArrayToString(fixtures.directory.files['files/hello.txt']),
          uint8ArrayToString(fixtures.directory.files['pp.txt'])
        ])
      })

      it('should not compress a directory', async () => {
        const dirs = [
          content('pp.txt'),
          emptyDir('empty-folder'),
          content('files/hello.txt')
        ]

        const res = await all(importer(dirs, blockstore(ipfs)))
        const { cid } = res[res.length - 1]

        await expect(drain(ipfs.get(cid, {
          compress: true,
          compressionLevel: 5
        }))).to.eventually.be.rejectedWith(/file is not regular/)
      })
    })
  })
}
