/* eslint-env mocha */

import type { PeerId } from '@libp2p/interface-peer-id'
import { expect } from 'aegir/chai'
import all from 'it-all'

import { factory, KuboControlledClient } from './utils/factory.js'
const f = factory()

// Determine if a ping response object is a pong, or something else, like a status message
function isPong (pingResponse: unknown) {
  // @ts-expect-error
  // eslint-disable-next-line
  return Boolean(pingResponse && pingResponse.success && !pingResponse.text)
}

describe('.ping', function () {
  this.timeout(20 * 1000)

  let ipfs: KuboControlledClient
  let other: KuboControlledClient
  let otherId: PeerId

  before(async function () {
    this.timeout(30 * 1000) // slow CI

    // @ts-expect-error
    ipfs = (await f.spawn()).api
    // @ts-expect-error
    other = (await f.spawn()).api

    const ma = (await ipfs.id()).addresses[0]
    await other.swarm.connect(ma)

    otherId = (await other.id()).id
  })

  after(async function () { return await f.clean() })

  it('.ping with default count', async function () {
    const res = await all(ipfs.ping(otherId))
    expect(res).to.be.an('array')
    expect(res.filter(isPong)).to.have.lengthOf(10)
    res.forEach(packet => {
      expect(packet).to.have.keys('success', 'time', 'text')
      expect(packet.time).to.be.a('number')
    })
    const resultMsg = res.find(packet => packet.text.includes('Average latency'))
    expect(resultMsg).to.exist()
  })

  it('.ping with count = 2', async function () {
    const res = await all(ipfs.ping(otherId, { count: 2 }))
    expect(res).to.be.an('array')
    expect(res.filter(isPong)).to.have.lengthOf(2)
    res.forEach(packet => {
      expect(packet).to.have.keys('success', 'time', 'text')
      expect(packet.time).to.be.a('number')
    })
    const resultMsg = res.find(packet => packet.text.includes('Average latency'))
    expect(resultMsg).to.exist()
  })
})
