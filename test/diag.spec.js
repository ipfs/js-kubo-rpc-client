/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory } from './utils/factory.js'
const f = factory()

describe('.diag', function () {
  this.timeout(50 * 1000)

  // go-ipfs does not support these on Windows
  if (global.process && global.process.platform === 'win32') { return }
  let ipfs

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(function () { return f.clean() })

  describe('api API', function () {
    // Disabled in go-ipfs 0.4.10
    it.skip('.diag.net', async function () {
      const res = await ipfs.diag.net()

      expect(res).to.exist()
    })

    it('.diag.sys', async function () {
      const res = await ipfs.diag.sys()

      expect(res).to.exist()
      expect(res).to.have.a.property('memory')
      expect(res).to.have.a.property('diskinfo')
    })

    it('.diag.cmds', async function () {
      const res = await ipfs.diag.cmds()

      expect(res).to.exist()
    })
  })
})
