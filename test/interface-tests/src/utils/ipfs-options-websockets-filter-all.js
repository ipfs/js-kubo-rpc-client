// @ts-expect-error no types
import { webSockets } from '@libp2p/websockets'
// @ts-expect-error no types
import { all } from '@libp2p/websockets/filters'

const transportKey = webSockets.prototype[Symbol.toStringTag]

export function ipfsOptionsWebsocketsFilterAll () {
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
