import { testAddAll } from './add-all.ts'
import { testAdd } from './add.ts'
import testBitswap from './bitswap/index.ts'
import testBlock from './block/index.ts'
import testBootstrap from './bootstrap/index.ts'
import { testCat } from './cat.ts'
import testConfig from './config/index.ts'
import testDag from './dag/index.ts'
import testDht from './dht/index.ts'
import testFiles from './files/index.ts'
import { testGet } from './get.ts'
import testKey from './key/index.ts'
import { testLs } from './ls.ts'
import testMiscellaneous from './miscellaneous/index.ts'
import testName from './name/index.ts'
import testNamePubsub from './name-pubsub/index.ts'
import testObject from './object/index.ts'
import testPin from './pin/index.ts'
import testPing from './ping/index.ts'
import testPubsub from './pubsub/index.ts'
import { testRefsLocal } from './refs-local.ts'
import { testRefs } from './refs.ts'
import testRepo from './repo/index.ts'
import testRouting from './routing/index.ts'
import testStats from './stats/index.ts'
import testSwarm from './swarm/index.ts'
import { createSuite } from './utils/suite.ts'

export const root = createSuite({
  add: testAdd,
  addAll: testAddAll,
  cat: testCat,
  get: testGet,
  ls: testLs,
  refs: testRefs,
  refsLocal: testRefsLocal
})

export const files = testFiles
export const bitswap = testBitswap
export const block = testBlock
export const dag = testDag
export const object = testObject
export const pin = testPin
export const bootstrap = testBootstrap
export const dht = testDht
export const name = testName
export const namePubsub = testNamePubsub
export const ping = testPing
export const pubsub = testPubsub
export const swarm = testSwarm
export const config = testConfig
export const key = testKey
export const miscellaneous = testMiscellaneous
export const repo = testRepo
export const routing = testRouting
export const stats = testStats
