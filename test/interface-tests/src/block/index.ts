import { createSuite } from '../utils/suite.ts'
import { testGet } from './get.ts'
import { testPut } from './put.ts'
import { testRm } from './rm.ts'
import { testStat } from './stat.ts'

const tests = {
  get: testGet,
  put: testPut,
  rm: testRm,
  stat: testStat
}

export default createSuite(tests)
