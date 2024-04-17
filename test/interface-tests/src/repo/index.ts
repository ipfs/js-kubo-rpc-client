import { createSuite } from '../utils/suite.js'
import { testGc } from './gc.js'
import { testStat } from './stat.js'
import { testVersion } from './version.js'

const tests = {
  version: testVersion,
  stat: testStat,
  gc: testGc
}

export default createSuite(tests)
