import { createSuite } from '../utils/suite.ts'
import testPatch from './patch/index.ts'

const tests = {
  patch: testPatch
}

export default createSuite(tests)
