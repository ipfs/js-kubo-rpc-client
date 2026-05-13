/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { factory } from './utils/factory.js'
import type { KuboRPCClient } from '../src/index.js'

const f = factory()

describe('.provide', function () {
  this.timeout(60 * 1000)

  let ipfs: KuboRPCClient

  before(async function () {
    ipfs = (await f.spawn()).api
  })

  after(async function () {
    await f.clean()
  })

  it('.provide.stat', async function () {
    const res = await ipfs.provide.stat({ lan: true })
    expect(res).to.exist()

    if ('FullRT' in res) {
      expect(res.FullRT).to.be.a('boolean')
    }

    // Sweep provider
    if (res.Sweep) {
      expect(res.Legacy).to.be.oneOf([null, undefined])
      expect(res.Sweep).to.have.property('workers')
      expect(res.Sweep.workers).to.have.property('max')
      expect(res.Sweep).to.have.property('timing')
      expect(res.Sweep.timing).to.have.property('reprovides_interval')

      return
    }

    //  legacy provider
    if (res.Legacy) {
      expect(res.Legacy).to.have.property('total_reprovides')
      return
    }

    // Flat legacy provider (older kubo output)
    if ('TotalReprovides' in res) {
      expect(res).to.have.property('TotalReprovides')
      expect(res).to.have.property('AvgReprovideDuration')
      expect(res).to.have.property('LastReprovideDuration')
      expect(res).to.have.property('ReprovideInterval')
      return
    }

    throw new Error(
      `Unknown provide.stat response shape: ${JSON.stringify(res)}`
    )
  })
})
