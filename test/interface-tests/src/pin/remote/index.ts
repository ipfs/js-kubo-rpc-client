import { createSuite } from '../../utils/suite.js'
import { testAdd } from './add.js'
import { testLs } from './ls.js'
import { testRmAll } from './rm-all.js'
import { testRm } from './rm.js'
import { testService } from './service.js'

const tests = {
  service: testService,
  add: testAdd,
  ls: testLs,
  rm: testRm,
  rmAll: testRmAll
}

export default createSuite(tests, 'pin')
