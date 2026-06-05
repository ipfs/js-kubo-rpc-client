import { createSuite } from '../utils/suite.ts'
import { testExport } from './export.ts'
import { testGet } from './get.ts'
import { testImport } from './import.ts'
import { testPut } from './put.ts'
import { testResolve } from './resolve.ts'
import { testDagSharnessT0053 } from './sharness-t0053-dag.ts'

const tests = {
  export: testExport,
  get: testGet,
  put: testPut,
  import: testImport,
  resolve: testResolve,
  dagSharnessT0053: testDagSharnessT0053
}

export default createSuite(tests)
