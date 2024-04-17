import { webSockets } from '@libp2p/websockets'
import { all } from '@libp2p/websockets/filters'

const transportKey = webSockets.prototype[Symbol.toStringTag]

export function ipfsOptionsWebsocketsFilterAll (): any {
  return {
    libp2p: {
      config: {
        transport: {
          [transportKey]: {
            filter: all
          }
        }
      }
    }
  }
}
