import { createSuite } from '../utils/suite.ts'
import { testPublish } from './publish.ts'
import { testResolve } from './resolve.ts'

const tests = {
  publish: testPublish,
  resolve: testResolve
}

export default createSuite(tests)
