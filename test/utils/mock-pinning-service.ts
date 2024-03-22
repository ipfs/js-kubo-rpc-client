
import http from 'http'
// @ts-expect-error no types
import { setup } from 'mock-ipfs-pinning-service'
import getPort from 'aegir/get-port'

const defaultPort = 1139
const defaultToken = 'secret'

export class PinningService {
  server: any
  host: string
  port: number
  token: any

  static async start ({ port = defaultPort, token = defaultToken }: { port?: number, token?: string|null } = {}): Promise<PinningService> {
    const service = await setup({ token })
    const server = http.createServer(service)
    const host = '127.0.0.1'
    port = await getPort(port)
    await new Promise(resolve => server.listen(port, host, () => {
      resolve(null)
    }))

    return new PinningService({ server, host, port, token })
  }

  constructor ({ server, host, port, token }: { server: any, host: string, port: number, token: any }) {
    this.server = server
    this.host = host
    this.port = port
    this.token = token
  }

  get endpoint () {
    return `http://${this.host}:${this.port}`
  }

  async stop (): Promise<void> {
    return await new Promise((resolve, reject) => {
      this.server.close((error: any) => {
        if (error != null) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  }
}
