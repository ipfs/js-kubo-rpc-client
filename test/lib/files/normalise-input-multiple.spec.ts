/* eslint-env mocha */

import { File } from '@web-std/file'
import { expect } from 'aegir/chai'
import resolve from 'aegir/resolve'
import blobToIt from 'blob-to-it'
import all from 'it-all'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { isNode } from 'wherearewe'
import { normaliseInput } from '../../../src/lib/files/normalise-input-multiple.js'
import { asyncIterableOf, browserReadableStreamOf, iterableOf } from '../../utils/iterables.js'

const STRING = (): any => 'hello world'
const NEWSTRING = (): any => new String('hello world') // eslint-disable-line no-new-wrappers
const BUFFER = (): any => uint8ArrayFromString(STRING())
const ARRAY = (): any => Array.from(BUFFER())
const TYPEDARRAY = (): any => Uint8Array.from(ARRAY())
const FILE = (): any => new File([BUFFER()], 'test-file.txt')
const BLOB = (): any => new Blob([STRING()])

async function verifyNormalisation (input: any): Promise<void> {
  expect(input.length).to.equal(1)
  expect(input[0].path).to.equal('')

  let content = input[0].content

  if (content instanceof Blob) {
    content = blobToIt(content)
  }

  if (content == null || content instanceof Uint8Array) {
    throw new Error('Content expected')
  }

  // eslint-disable-next-line @typescript-eslint/await-thenable
  expect(await all(content)).to.deep.equal([BUFFER()])
}

async function testContent (input: any): Promise<void> {
  const result = await all(normaliseInput(input))

  await verifyNormalisation(result)
}

async function testFailure (input: any, message: RegExp): Promise<void> {
  await expect(all(normaliseInput(input))).to.eventually.be.rejectedWith(message)
}

describe('normalise-input-multiple', function () {
  function testInputType (content: () => any, name: string, { acceptStream, acceptContentStream }: { acceptStream: boolean, acceptContentStream: boolean }): void {
    it(`Failure ${name}`, async function () {
      await testFailure(content(), /single item passed/)
    })

    if (acceptStream) {
      it(`ReadableStream<${name}>`, async function () {
        await testContent(browserReadableStreamOf(content()))
      })

      it(`Iterable<${name}>`, async function () {
        await testContent(iterableOf(content()))
      })

      it(`AsyncIterable<${name}>`, async function () {
        await testContent(asyncIterableOf(content()))
      })
    } else {
      it(`Failure ReadableStream<${name}>`, async function () {
        await testFailure(browserReadableStreamOf(content()), /single item passed/)
      })

      it(`Failure Iterable<${name}>`, async function () {
        await testFailure(iterableOf(content()), /single item passed/)
      })

      it(`Failure AsyncIterable<${name}>`, async function () {
        await testFailure(asyncIterableOf(content()), /single item passed/)
      })
    }

    it(`Failure { path: '', content: ${name} }`, async function () {
      await testFailure({ path: '', content: content() }, /single item passed/)
    })

    it(`Iterable<{ path: '', content: ${name} }>`, async function () {
      await testContent(iterableOf({ path: '', content: content() }))
    })

    it(`AsyncIterable<{ path: '', content: ${name} }>`, async function () {
      await testContent(asyncIterableOf({ path: '', content: content() }))
    })

    if (acceptContentStream) {
      it(`Iterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: browserReadableStreamOf(content()) }))
      })

      it(`Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(iterableOf({ path: '', content: asyncIterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: browserReadableStreamOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: iterableOf(content()) }))
      })

      it(`AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testContent(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }))
      })
    } else {
      it(`Failure Iterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
        await testFailure(iterableOf({ path: '', content: browserReadableStreamOf(content()) }), /Unexpected input/)
      })

      it(`Failure Iterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testFailure(iterableOf({ path: '', content: iterableOf(content()) }), /Unexpected input/)
      })

      it(`Failure Iterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testFailure(iterableOf({ path: '', content: asyncIterableOf(content()) }), /Unexpected input/)
      })

      it(`Failure AsyncIterable<{ path: '', content: ReadableStream<${name}> }>`, async function () {
        await testFailure(asyncIterableOf({ path: '', content: browserReadableStreamOf(content()) }), /Unexpected input/)
      })

      it(`Failure AsyncIterable<{ path: '', content: Iterable<${name}> }>`, async function () {
        await testFailure(asyncIterableOf({ path: '', content: iterableOf(content()) }), /Unexpected input/)
      })

      it(`Failure AsyncIterable<{ path: '', content: AsyncIterable<${name}> }>`, async function () {
        await testFailure(asyncIterableOf({ path: '', content: asyncIterableOf(content()) }), /Unexpected input/)
      })
    }
  }

  describe('String', () => {
    testInputType(STRING, 'String', {
      acceptStream: true,
      acceptContentStream: true
    })

    testInputType(NEWSTRING, 'new String()', {
      acceptStream: true,
      acceptContentStream: true
    })
  })

  describe('Buffer', () => {
    testInputType(BUFFER, 'Buffer', {
      acceptStream: true,
      acceptContentStream: true
    })
  })

  describe('Blob', () => {
    testInputType(BLOB, 'Blob', {
      acceptStream: true,
      acceptContentStream: false
    })
  })

  describe('@web-std/file', () => {
    testInputType(FILE, 'File', {
      acceptStream: true,
      acceptContentStream: false
    })
  })

  describe('Iterable<Number>', () => {
    testInputType(ARRAY, 'Iterable<Number>', {
      acceptStream: true,
      acceptContentStream: false
    })
  })

  describe('TypedArray', () => {
    testInputType(TYPEDARRAY, 'TypedArray', {
      acceptStream: true,
      acceptContentStream: true
    })
  })

  if (isNode) {
    let fs: any

    before(async () => {
      fs = await import('fs')
    })

    describe('Node fs.ReadStream', () => {
      const NODEFSREADSTREAM = (): any => {
        const path = resolve('test/fixtures/file.txt')

        return fs.createReadStream(path)
      }

      testInputType(NODEFSREADSTREAM, 'Node fs.ReadStream', {
        acceptStream: true,
        acceptContentStream: false
      })
    })
  }
})
