import { createSuite } from '../utils/suite.ts'
import { testGc } from './gc.ts'
import { testStat } from './stat.ts'
import { testVersion } from './version.ts'

const tests = {
  version: testVersion,
  stat: testStat,
  gc: testGc
}

export default createSuite(tests)
