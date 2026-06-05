import { createSuite } from '../utils/suite.ts'
import { testFindPeer } from './find-peer.ts'
import { testFindProvs } from './find-provs.ts'
import { testGet } from './get.ts'
import { testProvide } from './provide.ts'
import { testPut } from './put.ts'

const tests = {
  put: testPut,
  get: testGet,
  findPeer: testFindPeer,
  provide: testProvide,
  findProvs: testFindProvs
}

export default createSuite(tests)
