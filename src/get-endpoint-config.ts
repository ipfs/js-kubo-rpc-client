import type { KuboRPCClient } from './index.ts'
import type { HTTPRPCClient } from './lib/core.ts'

export function createGetEndpointConfig (client: HTTPRPCClient): KuboRPCClient['getEndpointConfig'] {
  return function getEndpointConfig () {
    const url = new URL(client.opts.base ?? '')
    return {
      host: url.hostname,
      port: url.port,
      protocol: url.protocol,
      pathname: url.pathname,
      'api-path': url.pathname
    }
  }
}
