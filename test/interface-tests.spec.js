/* eslint-env mocha */

import { isWebWorker } from 'ipfs-utils/src/env.js'
import { isWindows, isFirefox, isChrome } from './constants.js'
import * as tests from './interface-tests/src/index.js'
import { factory } from './utils/factory.js'

/** @typedef {import("ipfsd-ctl").ControllerOptions} ControllerOptions */

/**
 * @param {Factory<ControllerType>} [commonFactory]
 */
function executeTests (commonFactory) {
  tests.root(commonFactory, {
    skip: [
      {
        name: 'should support bidirectional streaming',
        reason: 'Not supported by http'
      },
      {
        name: 'should error during add-all stream',
        reason: 'Not supported by http'
      },
      {
        name: '.refs',
        reason: 'FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/77'
      }
    ].concat(isFirefox
      ? [{
          name: 'should add a BIG Uint8Array',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }, {
          name: 'should add a BIG Uint8Array with progress enabled',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }, {
          name: 'should add big files',
          reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
        }]
      : []
    )
  })

  tests.bitswap(commonFactory)

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory, {
    skip: [
      // config.replace
      {
        name: 'replace',
        reason: 'FIXME Waiting for fix on kubo https://github.com/ipfs/js-ipfs-http-client/pull/307#discussion_r69281789 and https://github.com/ipfs/kubo/issues/2927'
      }
    ]
  })

  tests.dag(commonFactory, {
    skip: [
      // dag.get:
      ...[
        /**
         * This test is intermittently failing with
         * 1. mismatched CIDs
         * 2. pinErrorMsg strings being empty when they're not supposed to be
         * 3. across browser and node runtimes
         *
         * I've tried debugging this one and it seems to have a race condition or other intricate and implicit dependent that I am unaware of.
         */
        'should import car with roots but no blocks'
      ].map((name) => ({ name, reason: 'FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56' }))
    ]
  })

  tests.dht(commonFactory, {
    skip: [
      {
        name: 'should error when DHT not available',
        reason: 'go returns a query error'
      }
    ]
  })

  tests.files(commonFactory, {
    skip: [
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a file',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "85675" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a subshard',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "2109" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a file from a subshard of a subshard',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "170441" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when removing a subshard of a subshard',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "11463" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a new file',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "5835" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when creating a new subshard',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "8038" to type "bool" (for option "-size")'
      },
      {
        name: ' results in the same hash as a sharded directory created by the importer when adding a file to a subshard',
        reason: 'TODO kubo errors out with HTTPError: Could not convert value "6620" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a file to a subshard',
        reason: 'HTTPError: Could not convert value "6620" to type "bool" (for option "-size")'
      },
      {
        name: 'results in the same hash as a sharded directory created by the importer when adding a file to a subshard of a subshard',
        reason: 'HTTPError: Could not convert value "170441" to type "bool" (for option "-size")'
      },
      {
        name: 'limits how many bytes to write to a file (Really large file)',
        reason: 'TODO kubo drops the connection'
      }
    ]
      .concat(isFirefox
        ? [{
            name: 'overwrites start of a file without truncating (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'limits how many bytes to write to a file (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'pads the start of a new file when an offset is specified (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'expands a file when an offset is specified (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'expands a file when an offset is specified and the offset is longer than the file (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'truncates a file after writing (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }, {
            name: 'writes a file with raw blocks for newly created leaf nodes (Really large file)',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }]
        : [])
  })

  tests.key(commonFactory, {
    skip: [
      // key.import
      {
        name: 'import',
        reason: 'FIXME: see https://github.com/ipfs/js-kubo-rpc-client/issues/56 & https://github.com/ipfs/js-ipfs/issues/3547'
      }
    ]
  })

  tests.miscellaneous(commonFactory)

  tests.name(factory({
    type: 'go',
    ipfsOptions: {
      offline: true
    }
  }))

  tests.namePubsub(factory({
    type: 'go',
    ipfsOptions: {
      EXPERIMENTAL: {
        ipnsPubsub: true
      }
    }
  }), {
    skip: [
      // name.pubsub.cancel
      {
        name: 'should cancel a subscription correctly returning true',
        reason: 'kubo is really slow for publishing and resolving ipns records, unless in offline mode'
      },
      // name.pubsub.subs
      {
        name: 'should get the list of subscriptions updated after a resolve',
        reason: 'kubo is really slow for publishing and resolving ipns records, unless in offline mode'
      },
      // name.pubsub
      {
        name: 'should publish and then resolve correctly',
        reason: 'js-ipfs and kubo behaviour differs'
      },
      {
        name: 'should self resolve, publish and then resolve correctly',
        reason: 'js-ipfs and kubo behaviour differs'
      },
      {
        name: 'should handle event on publish correctly',
        reason: 'js-ipfs and kubo behaviour differs'
      }
    ]
  })

  tests.object(commonFactory, {
    skip: [
      {
        name: 'should get data by base58 encoded multihash string',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should get object by base58 encoded multihash string',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should get links by base58 encoded multihash',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should get links by base58 encoded multihash string',
        reason: 'FIXME kubo throws invalid encoding: base58'
      },
      {
        name: 'should put a Protobuf encoded Uint8Array',
        reason: 'FIXME kubo throws invalid encoding: protobuf'
      }
    ]
      .concat(isFirefox
        ? [{
            name: 'should supply unaltered data',
            reason: 'https://github.com/microsoft/playwright/issues/4704#issuecomment-826782602'
          }]
        : [])
  })

  tests.pin(commonFactory, {
    skip: [
    ].concat(isWebWorker
      ? [
          'should pin dag-cbor' // only seems to fail when running all tests together.
        ].map((name) => ({ name, reason: 'FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56' }))
      : [])
      .concat(isChrome
        ? [{
            name: 'should default to blocking pin',
            reason: 'FIXME: intermittently failing. see https://github.com/ipfs/js-kubo-rpc-client/issues/56'
          }]
        : [])
  })

  tests.ping(commonFactory, {
    skip: [
      {
        name: 'should fail when pinging a peer that is not available',
        reason: 'FIXME kubo return success with text: Looking up peer <cid>'
      }
    ]
  })

  tests.pubsub(factory({
    type: 'go'
  }, {
    go: {
      args: ['--enable-pubsub-experiment']
    }
  }), {
    skip: isWindows
      ? [{
          name: 'should send/receive 100 messages',
          reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/kubo/issues/4778'
        },
        {
          name: 'should receive multiple messages',
          reason: 'FIXME https://github.com/ipfs/interface-ipfs-core/pull/188#issuecomment-354673246 and https://github.com/ipfs/kubo/issues/4778'
        }]
      : []
  })

  tests.repo(commonFactory)

  tests.stats(commonFactory)

  tests.swarm(commonFactory)
}

describe('kubo-rpc-client tests against kubo', function () {
  const goVersionsToTest = ['current']
  /**
   * Enable running the tests across all go-ipfs versions listed below.
   * Works best with `--bail=false` otherwise the tests will stop at the first
   * failure.
   */
  if (process.env.GO_IPFS_GAMUT != null) {
    goVersionsToTest.push(...['12.0', '12', '13', '14', '15', '16'])
  }
  (async function () {
    for (const version of goVersionsToTest) {
      let ipfsBin
      try {
        const { path } = await import(`go-ipfs-${version}`)
        ipfsBin = path()
      } catch {
        ipfsBin = undefined
      }

      const commonFactory = factory({
        type: 'go',
        ipfsBin,
        test: true
      }, {
        go: {
          ipfsBin
        }
      })
      describe(`go-ipfs ${version}${ipfsBin != null ? `at ${ipfsBin}` : ''}`, function () {
        executeTests(commonFactory)
      })
    }
  })()
})
