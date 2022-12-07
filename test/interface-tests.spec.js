/* eslint-env mocha */

import { isBrowser, isWebWorker } from 'ipfs-utils/src/env.js'
import { isWindows, isFirefox } from './constants.js'
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
        name: 'should add with mode as string',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add with mode as number',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add with mtime as Date',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add with mtime as { nsecs, secs }',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add with mtime as timespec',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add with mtime as hrtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should export a chunk of a file',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should ls with metadata',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should ls single file with metadata',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should ls single file without containing directory with metadata',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should override raw leaves when file is smaller than one block and metadata is present',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should add directories with metadata',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should support bidirectional streaming',
        reason: 'Not supported by http'
      },
      {
        name: 'should error during add-all stream',
        reason: 'Not supported by http'
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
    ).concat(isBrowser || isWebWorker
      ? [
          'should get a directory', // [mocha] output truncated to 8192 characters, see "maxDiffSize" reporter-option
          'should get a nested directory', // [mocha] output truncated to 8192 characters, see "maxDiffSize" reporter-option
          'should compress a directory as a tarball' // [mocha] output truncated to 8192 characters, see "maxDiffSize" reporter-option
        ].map((name) => ({ name, reason: 'FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56' }))
      : []
    )
  })

  tests.bitswap(commonFactory, {
    skip: [
      {
        name: '.bitswap.unwant',
        reason: 'TODO not implemented in kubo yet'
      }
    ]
  })

  tests.block(commonFactory)

  tests.bootstrap(commonFactory)

  tests.config(commonFactory, {
    skip: [
      // config.replace
      {
        name: 'replace',
        reason: 'FIXME Waiting for fix on kubo https://github.com/ipfs/js-ipfs-http-client/pull/307#discussion_r69281789 and https://github.com/ipfs/kubo/issues/2927'
      },
      {
        name: 'should list config profiles',
        reason: 'TODO: Not implemented in kubo'
      },
      {
        name: 'should strip private key from diff output',
        reason: 'TODO: Not implemented in kubo'
      }
    ]
  })

  tests.dag(commonFactory, {
    skip: [
      // dag.get:
      {
        name: 'should get only a CID, due to resolving locally only',
        reason: 'FIXME: kubo does not support localResolve option'
      },
      {
        name: 'should get a node added as CIDv0 with a CIDv1',
        reason: 'kubo doesn\'t use CIDv0 for DAG API anymore'
      }
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
        name: 'should ls directory',
        reason: 'TODO unskip when kubo supports --long https://github.com/ipfs/kubo/pull/6528'
      },
      {
        name: 'should list a file directly',
        reason: 'TODO unskip when kubo supports --long https://github.com/ipfs/kubo/pull/6528'
      },
      {
        name: 'should ls directory and include metadata',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should read from outside of mfs',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should ls from outside of mfs',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update the mode for a file',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update the mode for a directory',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update the mode for a hamt-sharded-directory',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update modes with basic symbolic notation that adds bits',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update modes with basic symbolic notation that removes bits',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update modes with basic symbolic notation that overrides bits',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update modes with multiple symbolic notation',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update modes with special symbolic notation',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should apply special execute permissions to world',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should apply special execute permissions to user',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should apply special execute permissions to user and group',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should apply special execute permissions to sharded directories',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update file mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update directory mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should update the mtime for a hamt-sharded-directory',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should create an empty file',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should respect metadata when copying files',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should respect metadata when copying directories',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should respect metadata when copying from outside of mfs',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should have default mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should set mtime as Date',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should set mtime as { nsecs, secs }',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should set mtime as timespec',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should set mtime as hrtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and have default mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mode as string',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mode as number',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mtime as Date',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mtime as { nsecs, secs }',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mtime as timespec',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should make directory and specify mtime as hrtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mode as a string',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mode as a number',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mtime as Date',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mtime as { nsecs, secs }',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mtime as timespec',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should write file and specify mtime as hrtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat file with mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat file with mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat dir with mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat dir with mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat sharded dir with mode',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should stat sharded dir with mtime',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'lists a raw node',
        reason: 'TODO kubo does not support ipfs paths for all mfs commands'
      },
      {
        name: 'lists a raw node in an mfs directory',
        reason: 'TODO kubo does not support non-ipfs nodes in mfs'
      },
      {
        name: 'writes a small file with an escaped slash in the title',
        reason: 'TODO kubo does not support escapes in paths'
      },
      {
        name: 'overwrites a file with a different CID version',
        reason: 'TODO kubo does not support changing the CID version'
      },
      {
        name: 'partially overwrites a file with a different CID version',
        reason: 'TODO kubo does not support changing the CID version'
      },
      {
        name: 'refuses to copy multiple files to a non-existent child directory',
        reason: 'TODO kubo does not support copying multiple files at once'
      },
      {
        name: 'refuses to copy files to an unreadable node',
        reason: 'TODO kubo does not support identity format, maybe in 0.5.0?'
      },
      {
        name: 'copies a file to a pre-existing directory',
        reason: 'TODO kubo does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'copies multiple files to new location',
        reason: 'TODO kubo does not support copying multiple files at once'
      },
      {
        name: 'copies files to deep mfs paths and creates intermediate directories',
        reason: 'TODO kubo does not support the parents flag in the cp command'
      },
      {
        name: 'copies a sharded directory to a normal directory',
        reason: 'TODO kubo does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'copies a normal directory to a sharded directory',
        reason: 'TODO kubo does not copying files into existing directories if the directory is specify as the target path'
      },
      {
        name: 'removes multiple files',
        reason: 'TODO kubo does not support removing multiple files'
      },
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
        name: 'stats a dag-cbor node',
        reason: 'TODO kubo does not support non-dag-pb nodes in mfs'
      },
      {
        name: 'stats an identity CID',
        reason: 'TODO kubo does not support non-dag-pb nodes in mfs'
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
      // key.export
      {
        name: 'export',
        reason: 'TODO not implemented in kubo yet'
      },
      // key.import
      {
        name: 'import',
        reason: 'TODO not implemented in kubo yet'
      }
    ]
  })

  tests.miscellaneous(commonFactory, {
    skip: [
      {
        name: 'should include the interface-ipfs-core version',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should include the ipfs-http-client version',
        reason: 'TODO not implemented in kubo yet'
      },
      {
        name: 'should have protocols property',
        reason: 'TODO not implemented in kubo yet'
      },
      // FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56
      ...['should resolve IPNS link recursively by default', 'should resolve IPNS link non-recursively if recursive==false'].map((name) => ({ name, reason: 'FIXME: HTTPError: routing: operation or key not supported' }))
    ]
  })

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

  /**
   * FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56
   * I recommend we remove these tests from the kubo-rpc-client as we have a pinning-service client that should be used instead
   *
   * @see https://github.com/ipfs-shipyard/js-pinning-service-http-client
   */
  tests.pin(commonFactory, {
    skip: [
      {
        name: 'should list pins with metadata',
        reason: 'not implemented in kubo'
      }
    ].concat(isWebWorker
      ? [
          'should pin dag-cbor' // only seems to fail when running all tests together.
        ].map((name) => ({ name, reason: 'FIXME: https://github.com/ipfs/js-kubo-rpc-client/issues/56' }))
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

describe('kubo-rpc-client tests against kubo', async function () {
  const goVersionsToTest = ['current']
  /**
   * Enable running the tests across all go-ipfs versions listed below.
   * Works best with `--bail=false` otherwise the tests will stop at the first
   * failure.
   */
  if (process.env.GO_IPFS_GAMUT != null) {
    goVersionsToTest.push(...['12.0', '12', '13', '14', '15', '16'])
  }

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
    describe(`go-ipfs ${version}${ipfsBin != null ? `at ${ipfsBin}` : ''}`, () => {
      executeTests(commonFactory)
    })
  }
})
