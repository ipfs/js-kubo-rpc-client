/* eslint-env mocha */

import { expect } from 'aegir/chai'
import { getDescribe, getIt, type MochaConfig } from '../utils/mocha.js'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { Factory, KuboNode } from 'ipfsd-ctl'

export function testReplace (factory: Factory<KuboNode>, options: MochaConfig): void {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.config.replace', function () {
    this.timeout(30 * 1000)
    let ipfs: KuboRPCClient

    before(async function () {
      ipfs = (await factory.spawn()).api
    })

    after(async function () {
      await factory.clean()
    })

    it('should replace the config', async () => {
      const config = {
        Addresses: {
          API: '/ip4/1.2.3.4/tcp/54321/'
        }
      }

      await ipfs.config.replace(config)

      const _config = await ipfs.config.getAll()

      // only include, everything is reset to the default values for golang
      expect(cleanConfig(_config)).to.deep.include({
        ...config,
        Datastore: {
          BloomFilterSize: 0,
          GCPeriod: '',
          HashOnRead: false,
          StorageGCWatermark: 0,
          StorageMax: ''
        }
        // ..etc
      })
    })

    it('should replace to empty config', async () => {
      await ipfs.config.replace({})

      const _config = await ipfs.config.getAll()
      expect(cleanConfig(_config)).to.deep.include({
        Datastore: {
          BloomFilterSize: 0,
          GCPeriod: '',
          HashOnRead: false,
          StorageGCWatermark: 0,
          StorageMax: ''
        }
        // ...etc
      })
    })
  })
}

// cleanConfig removes all null properties of the configuration. When replacing
// a configuration, Kubo always fills missing properties with null values.
function cleanConfig (config: any): any {
  if (Array.isArray(config)) {
    return config.filter(e => Boolean(e))
  }

  return Object.keys(config).reduce<any>((acc, key) => {
    if (config[key] == null) {
      return acc
    }

    if (typeof config[key] === 'object') {
      const o = cleanConfig(config[key])
      if (o != null && (Object.keys(o).length > 0)) {
        acc[key] = o
      }
    } else if (config[key] != null) {
      acc[key] = config[key]
    }

    return acc
  }, {})
}
