import { createSuite } from '../utils/suite.ts'
import { testAddAll } from './add-all.ts'
import { testAdd } from './add.ts'
import { testLs } from './ls.ts'
import testRemote from './remote/index.ts'
import { testRmAll } from './rm-all.ts'
import { testRm } from './rm.ts'
import { testUpdate } from './update.ts'

const tests = {
  add: testAdd,
  addAll: testAddAll,
  ls: testLs,
  rm: testRm,
  rmAll: testRmAll,
  remote: testRemote,
  update: testUpdate
}

export default createSuite(tests)
