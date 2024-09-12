import http from 'http'
import getPort from 'aegir/get-port'
// @ts-expect-error no types
import { setup } from 'mock-ipfs-pinning-service'

const defaultPort = 1139
const defaultToken = 'secret'

export interface PinningServiceStartOptions {
  port?: number
  token?: string
}

export interface PinningServiceInit {
  server: http.Server
  host: string
  port: number
  token?: string
}

export class PinningService {
  static async start ({ port = defaultPort, token = defaultToken }: PinningServiceStartOptions = {}): Promise<PinningService> {
    const service = await setup({ token })
    const server = http.createServer(service)
    const host = '127.0.0.1'
    port = await getPort(port)
    await new Promise(resolve => server.listen(port, host, () => {
      resolve(null)
    }))

    return new PinningService({ server, host, port, token })
  }

  server: http.Server
  host: string
  port: number
  token?: string

  constructor ({ server, host, port, token }: PinningServiceInit) {
    this.server = server
    this.host = host
    this.port = port
    this.token = token
  }

  get endpoint (): string {
    return `http://${this.host}:${this.port}`
  }

  async stop (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.server.close((err?: Error | undefined) => {
        if (err != null) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}
