import { createSuite } from '../utils/suite.ts'
import { testAddrs } from './addrs.ts'
import { testConnect } from './connect.ts'
import { testDisconnect } from './disconnect.ts'
import { testLocalAddrs } from './local-addrs.ts'
import { testPeers } from './peers.ts'

const tests = {
  connect: testConnect,
  peers: testPeers,
  addrs: testAddrs,
  localAddrs: testLocalAddrs,
  disconnect: testDisconnect
}

export default createSuite(tests)
