import { createServer } from 'ipfsd-ctl'
import getPort from 'aegir/get-port'
import EchoServer from 'aegir/echo-server'
import { sigServer } from '@libp2p/webrtc-star-signalling-server'

/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    bundlesizeMax: '66KB'
  },
  test: {
    bail: false,
    async before (options) {
      const MockPreloadNode = await import('./test/utils/mock-preload-node.js')
      const { PinningService } = await import('./test/utils/mock-pinning-service.js')

      const echoServer = new EchoServer()
      const preloadNode = MockPreloadNode.createNode()
      const pinningService = await PinningService.start()

      await preloadNode.start()
      await echoServer.start()

      if (options.runner !== 'node') {

        const ipfsdPort = await getPort()
        const signalAPort = await getPort()
        const signalBPort = await getPort()
        const ipfsdServer = createServer({
          host: '127.0.0.1',
          port: ipfsdPort
        }, {
          type: 'go',
          kuboRpcModule: await import('./src/index.js'),
          ipfsBin: (await import('go-ipfs')).default.path()
        })
        const sigServerA = await sigServer({
          host: '127.0.0.1',
          port: signalAPort,
          metrics: false
        })
        // the second signalling server is needed for the interface test 'should list peers only once even if they have multiple addresses'
        const sigServerB = await sigServer({
          host: '127.0.0.1',
          port: signalBPort,
          metrics: false
        })

        await ipfsdServer.start()

        return {
          env: {
            IPFSD_SERVER: `http://${ipfsdServer.host}:${ipfsdServer.port}`,
            PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
            PINNING_SERVICE_KEY: pinningService.token,
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`,
            SIGNALA_SERVER: `/ip4/127.0.0.1/tcp/${signalAPort}/ws/p2p-webrtc-star`,
            SIGNALB_SERVER: `/ip4/127.0.0.1/tcp/${signalBPort}/ws/p2p-webrtc-star`
          },
          ipfsdServer,
          echoServer,
          preloadNode,
          sigServerA,
          sigServerB,
          pinningService,
        }
      }
      return {
        env: {
          PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
          PINNING_SERVICE_KEY: pinningService.token,
          ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
        },
        echoServer,
        preloadNode,
        pinningService
      }
    },
    async after (options, before) {
      const { PinningService } = await import('./test/utils/mock-pinning-service.js')

      await before.echoServer.stop()
      await before.preloadNode.stop()
      await PinningService.stop(before.pinningService)

      if (options.runner !== 'node') {
        await before.ipfsdServer.stop()
        await before.sigServerA.stop()
        await before.sigServerB.stop()
      }
    }
  }
}
