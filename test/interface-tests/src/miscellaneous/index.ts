import { createSuite } from '../utils/suite.ts'
import { testId } from './id.ts'
import { testResolve } from './resolve.ts'
import { testStop } from './stop.ts'
import { testVersion } from './version.ts'

const tests = {
  id: testId,
  version: testVersion,
  stop: testStop,
  resolve: testResolve
}

export default createSuite(tests)
