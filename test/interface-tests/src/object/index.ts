import { createSuite } from '../utils/suite.js'
import testPatch from './patch/index.js'

const tests = {
  patch: testPatch
}

export default createSuite(tests)
