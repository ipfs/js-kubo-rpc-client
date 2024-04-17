import { createSuite } from '../utils/suite.js'
import { testId } from './id.js'
import { testResolve } from './resolve.js'
import { testStop } from './stop.js'
import { testVersion } from './version.js'

const tests = {
  id: testId,
  version: testVersion,
  stop: testStop,
  resolve: testResolve
}

export default createSuite(tests)
