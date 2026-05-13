import { createSuite } from '../../utils/suite.ts'
import { testAddLink } from './add-link.ts'
import { testRmLink } from './rm-link.ts'

const tests = {
  addLink: testAddLink,
  rmLink: testRmLink
}

export default createSuite(tests, 'patch')
