import type { Client } from './lib/core.js'

export function createGetEndpointConfig (client: Client) {
  return () => {
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
