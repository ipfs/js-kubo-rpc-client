const isWindows = globalThis.process && globalThis.process.platform && globalThis.process.platform === 'win32'
const isFirefox = globalThis.navigator?.userAgent?.toLowerCase().includes('firefox')

/**
 * Simple wrapper around constant `true` (for now) to ensure that unreachable code is not removed.
 *
 * Should be used in places where we want to keep unreachable code for documentation purposes.
 *
 * @example
 * if (notImplemented()) {
 *  return this.skip('Not implemented in kubo yet')
 * }
 * @returns {boolean}
 */
const notImplemented = () => true

/**
 * Simple fix for broken tests that occurred during https://github.com/ipfs/js-kubo-rpc-client/issues/5
 *
 * @todo These tests should be fixed, but i'm handing these fixes off to kubo team.
 * @returns {boolean}
 */
const brokenDuringKuboRpcClientMigration = () => true

export {
  isWindows,
  isFirefox,
  notImplemented,
  brokenDuringKuboRpcClientMigration
}
