import { createSuite } from '../utils/suite.ts'
import { testGen } from './gen.ts'
import { testImport } from './import.ts'
import { testList } from './list.ts'
import { testRename } from './rename.ts'
import { testRm } from './rm.ts'

const tests = {
  gen: testGen,
  list: testList,
  rename: testRename,
  rm: testRm,
  import: testImport
}

export default createSuite(tests)
