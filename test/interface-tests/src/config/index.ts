import { createSuite } from '../utils/suite.ts'
import { testGet } from './get.ts'
import profiles from './profiles/index.ts'
import { testReplace } from './replace.ts'
import { testSet } from './set.ts'

const tests = {
  get: testGet,
  set: testSet,
  replace: testReplace,
  profiles
}

export default createSuite(tests)
