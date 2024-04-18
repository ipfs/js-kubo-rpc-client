import { testAddAll } from './add-all.js'
import { testAdd } from './add.js'
import testBitswap from './bitswap/index.js'
import testBlock from './block/index.js'
import testBootstrap from './bootstrap/index.js'
import { testCat } from './cat.js'
import testConfig from './config/index.js'
import testDag from './dag/index.js'
import testDht from './dht/index.js'
import testFiles from './files/index.js'
import { testGet } from './get.js'
import testKey from './key/index.js'
import { testLs } from './ls.js'
import testMiscellaneous from './miscellaneous/index.js'
import testName from './name/index.js'
import testNamePubsub from './name-pubsub/index.js'
import testObject from './object/index.js'
import testPin from './pin/index.js'
import testPing from './ping/index.js'
import testPubsub from './pubsub/index.js'
import { testRefsLocal } from './refs-local.js'
import { testRefs } from './refs.js'
import testRepo from './repo/index.js'
import testRouting from './routing/index.js'
import testStats from './stats/index.js'
import testSwarm from './swarm/index.js'
import { createSuite } from './utils/suite.js'
import type { KuboRPCClient } from '../../../src/index.js'
import type { Controller, ControllerOptions, Factory } from 'ipfsd-ctl'

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

export interface KuboController extends Omit<Controller<'go'>, 'api'> {
  api: KuboRPCClient
}

export interface KuboRPCFactory extends Omit<Factory, 'spawn'> {
  spawn(options?: ControllerOptions): Promise<KuboController>
}
