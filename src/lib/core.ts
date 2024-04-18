/* eslint-env browser */

import { logger } from '@libp2p/logger'
import { isMultiaddr } from '@multiformats/multiaddr'
import mergeOpts from 'merge-options'
import parseDuration from 'parse-duration'
import { isBrowser, isWebWorker, isNode } from 'wherearewe'
import getAgent from './agent.js'
import { HTTP, type ExtendedResponse, type HTTPOptions } from './http.js'
import { toUrlString } from './to-url-string.js'
import type { Options } from '../index.js'
import type { Multiaddr } from '@multiformats/multiaddr'

const log = logger('js-kubo-rpc-client:lib:error-handler')
const merge = mergeOpts.bind({ ignoreUndefined: true })

const DEFAULT_PROTOCOL = isBrowser || isWebWorker ? location.protocol : 'http'
const DEFAULT_HOST = isBrowser || isWebWorker ? location.hostname : 'localhost'
const DEFAULT_PORT = isBrowser || isWebWorker ? location.port : '5001'

const normalizeOptions = (options: Options | URL | Multiaddr | string = {}): Options => {
  let url
  let opts: Options = {}
  let agent

  if (typeof options === 'string' || isMultiaddr(options)) {
    url = new URL(toUrlString(options))
  } else if (options instanceof URL) {
    url = options
  } else if (typeof options.url === 'string' || isMultiaddr(options.url)) {
    url = new URL(toUrlString(options.url))
    opts = options
  } else if (options.url instanceof URL) {
    url = options.url
    opts = options
  } else {
    opts = options ?? {}

    const protocol = (opts.protocol ?? DEFAULT_PROTOCOL).replace(':', '')
    const host = (opts.host ?? DEFAULT_HOST).split(':')[0]
    const port = (opts.port ?? DEFAULT_PORT)

    url = new URL(`${protocol}://${host}:${port}`)
  }

  if (opts.apiPath != null) {
    url.pathname = opts.apiPath
  } else if (url.pathname === '/' || url.pathname === undefined) {
    url.pathname = 'api/v0'
  }

  if (isNode) {
    const Agent = getAgent(url)

    agent = opts.agent ?? new Agent({
      keepAlive: true,
      // Similar to browsers which limit connections to six per host
      maxSockets: 6
    })
  }

  return {
    ...opts,
    host: url.host,
    protocol: url.protocol.replace(':', ''),
    port: Number(url.port),
    apiPath: url.pathname,
    url,
    agent
  }
}

export const errorHandler = async (response: Response): Promise<void> => {
  let msg: string | undefined

  try {
    if ((response.headers.get('Content-Type') ?? '').startsWith('application/json')) {
      const data = await response.json()
      log(data)
      msg = data.Message ?? data.message
    } else {
      msg = await response.text()
    }
  } catch (err: any) {
    log('Failed to parse error response', err)
    // Failed to extract/parse error message from response
    msg = err.message
  }

  let error: Error = new HTTP.HTTPError(response)

  if (msg != null) {
    // This is what rs-ipfs returns where there's a timeout
    if (msg.includes('deadline has elapsed')) {
      error = new HTTP.TimeoutError()
    }

    // This is what go-ipfs returns where there's a timeout
    if (msg.includes('context deadline exceeded')) {
      error = new HTTP.TimeoutError()
    }

    // This also gets returned
    if (msg.includes('request timed out')) {
      error = new HTTP.TimeoutError()
    }

    // If we managed to extract a message from the response, use it
    error.message = msg
  }

  throw error
}

const KEBAB_REGEX = /[A-Z\u00C0-\u00D6\u00D8-\u00DE]/g

const kebabCase = (str: string): string => {
  return str.replace(KEBAB_REGEX, function (match) {
    return '-' + match.toLowerCase()
  })
}

const parseTimeout = (value: string | number): number => {
  return typeof value === 'string' ? parseDuration(value) ?? 0 : value
}

export interface HTTPRPCClient extends Exclude<HTTP, 'put' | 'get' | 'delete' | 'options'> {

}

export class Client extends HTTP implements HTTPRPCClient {
  constructor (options: Options | URL | Multiaddr | string = {}) {
    const opts = normalizeOptions(options)

    super({
      timeout: opts.timeout != null ? parseTimeout(opts.timeout) : undefined,
      headers: opts.headers,
      base: `${opts.url}`,
      handleError: errorHandler,
      transformSearchParams: (search: URLSearchParams) => {
        const out = new URLSearchParams()

        for (const [key, value] of search) {
          if (
            value !== 'undefined' &&
            value !== 'null' &&
            key !== 'signal' &&
            key !== 'timeout'
          ) {
            out.append(kebabCase(key), value)
          }

          if (key === 'timeout' && !isNaN(parseInt(value))) {
            out.append(kebabCase(key), value)
          }
        }

        return out
      },
      agent: opts.agent
    })

    // @ts-expect-error - cannot delete non-optional fields
    delete this.get
    // @ts-expect-error - cannot delete non-optional fields
    delete this.put
    // @ts-expect-error - cannot delete non-optional fields
    delete this.delete
    // @ts-expect-error - cannot delete non-optional fields
    delete this.options

    const fetch = this.fetch

    this.fetch = async (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> => {
      if (typeof resource === 'string' && !resource.startsWith('/')) {
        resource = `${opts.url}/${resource}`
      }

      return fetch.call(this, resource, merge(options, {
        method: 'POST'
      }))
    }
  }
}

export const HTTPError = HTTP.HTTPError
