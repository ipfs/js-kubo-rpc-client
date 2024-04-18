/* eslint-env mocha */

import { expect } from 'aegir/chai'
import all from 'it-all'
import { CID } from 'multiformats/cid'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { KuboRPCFactory } from '../index.js'

export function testDisabled (factory: KuboRPCFactory, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('disabled', function () {
    this.timeout(80 * 1000)

    let nodeA: KuboRPCClient
    let nodeB: KuboRPCClient

    before(async function () {
      nodeA = (await factory.spawn({
        ipfsOptions: {
          config: {
            Routing: {
              Type: 'none'
            }
          }
        }
      })).api
      nodeB = (await factory.spawn()).api
      const nodeBId = await nodeB.id()
      await nodeA.swarm.connect(nodeBId.addresses[0])
    })

    after(async function () {
      await factory.clean()
    })

    it('should error when DHT not available', async () => {
      const events = await all(nodeA.dht.query(CID.parse('QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ')))

      expect(events.filter(event => event.name === 'QUERY_ERROR')).to.not.be.empty()
    })
  })
}
