import { createServer } from 'ipfsd-ctl'
import getPort from 'aegir/get-port'
import EchoServer from 'aegir/echo-server'

/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    bundlesizeMax: '66KB'
  },
  test: {
    bail: false,
    async before (options) {
      const { PinningService } = await import('./test/utils/mock-pinning-service.js')
      const pinningService = await PinningService.start()
      const server = createServer({
        host: '127.0.0.1',
        port: 0
      }, {
        type: 'go',
        kuboRpcModule: await import('./src/index.js'),
        ipfsBin: (await import('go-ipfs')).default.path()
      })

      const echoServer = new EchoServer()
      await echoServer.start()

      await server.start()
      return {
        server,
        echoServer,
        pinningService,
        env: {
          IPFSD_SERVER: `http://${server.host}:${server.port}`,
          PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
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
