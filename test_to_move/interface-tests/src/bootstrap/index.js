import { createSuite } from '../utils/suite.js'
import { testAdd } from './add.js'
import { testList } from './list.js'
import { testRm } from './rm.js'

const tests = {
  add: testAdd,
  list: testList,
  rm: testRm
}

export default createSuite(tests)
