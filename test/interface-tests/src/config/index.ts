import { createSuite } from '../utils/suite.js'
import { testGet } from './get.js'
import profiles from './profiles/index.js'
import { testReplace } from './replace.js'
import { testSet } from './set.js'

const tests = {
  get: testGet,
  set: testSet,
  replace: testReplace,
  profiles
}

export default createSuite(tests)
