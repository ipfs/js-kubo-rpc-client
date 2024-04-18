/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { CID } from 'multiformats/cid'
import { normaliseInput } from '../../../src/lib/pins/normalise-input.js'
import { asyncIterableOf, iterableOf } from '../../utils/iterables.js'
import type { Source } from '../../../src/lib/pins/normalise-input.js'

const STRING = (): any => '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt'
const PLAIN_CID = (): any => CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
const OBJECT_CID = (): any => ({ cid: CID.parse('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'), recursive: true, metadata: { key: 'hello world' } })
const OBJECT_PATH = (): any => ({ path: '/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/path/to/file.txt', recursive: true, metadata: { key: 'hello world' } })

async function verifyNormalisation (input: Source, withOptions?: boolean): Promise<void> {
  const result = await all(normaliseInput(input))

  expect(result).to.have.lengthOf(1)
  expect(result[0]).to.have.property('path')

  if (withOptions === true) {
    expect(result[0]).to.have.property('recursive', true)
    expect(result[0]).to.have.deep.property('metadata', { key: 'hello world' })
  }
}

describe('pin normalise-input', function () {
  function testInputType (content: () => any, name: string, withOptions?: boolean): void {
    it(name, async function () {
      await verifyNormalisation(content(), withOptions)
    })

    it(`Iterable<${name}>`, async function () {
      await verifyNormalisation(iterableOf(content()), withOptions)
    })

    it(`AsyncIterable<${name}>`, async function () {
      await verifyNormalisation(asyncIterableOf(content()), withOptions)
    })
  }

  describe('String', () => {
    testInputType(STRING, 'String')
  })

  describe('CID', () => {
    testInputType(PLAIN_CID, 'CID')
  })

  describe('Object with CID', () => {
    testInputType(OBJECT_CID, 'Object with CID', true)
  })

  describe('Object with path', () => {
    testInputType(OBJECT_PATH, 'Object with path', true)
  })
})
