import { createSuite } from '../utils/suite.ts'
import { testAdd } from './add.ts'
import { testList } from './list.ts'
import { testRm } from './rm.ts'

const tests = {
  add: testAdd,
  list: testList,
  rm: testRm
}

export default createSuite(tests)
