import { createSuite } from '../../utils/suite.ts'
import { testAdd } from './add.ts'
import { testLs } from './ls.ts'
import { testRmAll } from './rm-all.ts'
import { testRm } from './rm.ts'
import { testService } from './service.ts'

const tests = {
  service: testService,
  add: testAdd,
  ls: testLs,
  rm: testRm,
  rmAll: testRmAll
}

export default createSuite(tests, 'pin')
