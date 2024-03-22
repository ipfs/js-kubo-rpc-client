import { createServer } from 'ipfsd-ctl'
import EchoServer from 'aegir/echo-server'

/**
 * @typedef {object} BeforeType
 * @property {import('ipfsd-ctl').Controller} server
 * @property {EchoServer} echoServer
 * @property {typeof import('./dist/test/utils/mock-pinning-service.js')} pinningService
 * @property {Record<string, string>} env
 */
/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    bundlesizeMax: '66KB'
  },
  test: {
    bail: false,
    /**
     *
     * @param {Parameters<import('aegir').Options['test']['before']>[0]} options
     * @returns {Promise<BeforeType>}
     */
    async before (options) {
      const { PinningService } = await import('./dist/test/utils/mock-pinning-service.js')
      const pinningService = await PinningService.start()
      const server = createServer({
        port: 0
      }, {
        type: 'go',
        kuboRpcModule: await import('./dist/src/index.js'),
        ipfsBin: (await import('go-ipfs')).default.path()
      })

      const echoServer = new EchoServer()
      await echoServer.start()

      await server.start()
      /**
       * @type {BeforeType}
       */
      return {
        server,
        echoServer,
        pinningService,
        env: {
          NODE_OPTIONS: '--no-experimental-fetch',
          IPFSD_SERVER: `http://${server.host}:${server.server.info.port}`,
          PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
          PINNING_SERVICE_KEY: 'secret',
          ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`,
        }
      }
    },
    async after (options, before) {
      await before.echoServer.stop()
      await before.server.stop()
      await before.pinningService.stop()
    }
  }
}
