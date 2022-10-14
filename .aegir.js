import { createServer } from 'ipfsd-ctl'
import getPort from 'aegir/get-port'

/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    bundlesizeMax: '66KB'
  },
  test: {
    async before (options) {
      // const { PinningService } = await import('aegir/test/utils/mock-pinning-service.js')
      // const pinningService = await PinningService.start()
      const port = await getPort()
      const server = createServer({
        host: '127.0.0.1',
        port: port
      }, {
        type: 'go',
        kuboRpcModule: await import('./src/index.js'),
        ipfsBin: (await import('go-ipfs')).default.path()
      })

      await server.start()
      return {
        server,
        env: {
          IPFSD_SERVER: `http://${server.host}:${server.port}`,
          // PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
          PINNING_SERVICE_ENDPOINT: 'http://127.0.0.1:5001'
        }
      }
    },
    async after (options, before) {
      await before.server.stop()
    }
  }
}
