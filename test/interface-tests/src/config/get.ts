/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testGet (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.get', function () {
    this.timeout(30 * 1000)
    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should fail with error', async () => {
      // @ts-expect-error missing arg
      await expect(ipfs.config.get()).to.eventually.rejectedWith('key argument is required')
    })

    it('should retrieve a value through a key', async () => {
      const peerId = await ipfs.config.get('Identity.PeerID')
      expect(peerId).to.exist()
    })

    it('should retrieve a value through a nested key', async () => {
      const swarmAddrs = await ipfs.config.get('Addresses.Swarm')
      expect(swarmAddrs).to.exist()
    })

    it('should fail on non valid key', () => {
      // @ts-expect-error invalid arg
      return expect(ipfs.config.get(1234)).to.eventually.be.rejected()
    })

    it('should fail on non existent key', () => {
      return expect(ipfs.config.get('Bananas')).to.eventually.be.rejected()
    })
  })

  describe('.config.getAll', function () {
    this.timeout(30 * 1000)
    let ipfs: KuboRPCClient

    before(async function () { ipfs = (await factory.spawn()).api })

    after(async function () {
      await factory.clean()
    })

    it('should retrieve the whole config', async () => {
      const config = await ipfs.config.getAll()

      expect(config).to.be.an('object')
    })

    it('should retrieve the whole config with options', async () => {
      const config = await ipfs.config.getAll({ signal: undefined })

      expect(config).to.be.an('object')
    })
  })
}
