import { createSuite } from '../utils/suite.js'
import { testGen } from './gen.js'
import { testImport } from './import.js'
import { testList } from './list.js'
import { testRename } from './rename.js'
import { testRm } from './rm.js'

const tests = {
  gen: testGen,
  list: testList,
  rename: testRename,
  rm: testRm,
  import: testImport
}

export default createSuite(tests)
