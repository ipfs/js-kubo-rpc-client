import { createPublish } from './publish.js'
import { createResolve } from './resolve.js'
import { createPubsub } from './pubsub/index.js'

/**
 * @param {import('../types').Options} config
 * @returns {import('../types').IPFS<import('../types').HTTPClientExtraOptions>['name']}
 */
export function createName (config) {
  return {
    publish: createPublish(config),
    resolve: createResolve(config),
    pubsub: createPubsub(config)
  }
}
