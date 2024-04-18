import { createSuite } from '../utils/suite.js'
import { testFindPeer } from './find-peer.js'
import { testFindProvs } from './find-provs.js'
import { testGet } from './get.js'
import { testProvide } from './provide.js'
import { testPut } from './put.js'

const tests = {
  put: testPut,
  get: testGet,
  findPeer: testFindPeer,
  provide: testProvide,
  findProvs: testFindProvs
}

export default createSuite(tests)
