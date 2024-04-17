import { createSuite } from '../utils/suite.js'
import { testAddrs } from './addrs.js'
import { testConnect } from './connect.js'
import { testDisconnect } from './disconnect.js'
import { testLocalAddrs } from './local-addrs.js'
import { testPeers } from './peers.js'

const tests = {
  connect: testConnect,
  peers: testPeers,
  addrs: testAddrs,
  localAddrs: testLocalAddrs,
  disconnect: testDisconnect
}

export default createSuite(tests)
