import { createSuite } from '../utils/suite.ts'
import { testBitswap } from './bitswap.ts'
import { testBw } from './bw.ts'
import { testRepo } from './repo.ts'

const tests = {
  bitswap: testBitswap,
  bw: testBw,
  repo: testRepo
}

export default createSuite(tests)
