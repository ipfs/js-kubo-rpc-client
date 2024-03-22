import { createSuite } from '../../utils/suite.js'
import { testApply } from './apply.js'

const tests = {
  apply: testApply
}

export default createSuite(tests, 'config')
