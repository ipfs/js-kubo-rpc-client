/* eslint-disable no-undef */

import { logger } from '@libp2p/logger'
import { anySignal } from 'any-signal'
import browserReableStreamToIt from 'browser-readablestream-to-it'
import { URL, URLSearchParams } from 'iso-url'
import all from 'it-all'
import mergeOpts from 'merge-options'
import { isBrowser, isWebWorker } from 'wherearewe'
import { TimeoutError, HTTPError } from './http/error.js'
import { fetch, Request, Headers } from './http/fetch.js'
import type { UploadProgressFn } from '../index.js'
import type { Readable } from 'node:stream'

const merge = mergeOpts.bind({ ignoreUndefined: true })

const log = logger('kubo-rpc-client:fetch')

type Override<T, R> = Omit<T, keyof R> & R

export type FetchOptions = Override<RequestInit, {
  /**
   * Amount of time until request should timeout in ms.
   */
  timeout?: number | string
  /**
   * URL search param.
   */
  searchParams?: URLSearchParams
  /**
   * Can be passed to track upload progress.
   * Note that if this option in passed underlying request will be performed using `XMLHttpRequest` and response will not be streamed.
   */
  onUploadProgress?: UploadProgressFn
  /**
   * Can be passed to track download progress.
   */
  onDownloadProgress?: UploadProgressFn
  overrideMimeType?: string
}>

export interface HTTPOptions extends FetchOptions {
  json?: any
  /**
   * The base URL to use in case url is a relative URL
   */
  base?: string
  /**
   * Throw not ok responses as Errors
   */
  throwHttpErrors?: boolean
  /**
   * Transform search params
   */
  transformSearchParams?(params: URLSearchParams): URLSearchParams
  /**
   * When iterating the response body, transform each chunk with this function.
   */
  transform?(chunk: any): any
  /**
   * Handle errors
   */
  handleError?(rsp: Response): Promise<void>
  /**
   * Control request creation
   */
  agent?: any
}

export interface ExtendedResponse extends Response {
  iterator(): AsyncGenerator<Uint8Array, void, undefined>

  ndjson(): AsyncGenerator<any, void, undefined>
}

const defaults = {
  throwHttpErrors: true,
  credentials: 'same-origin'
}

export class HTTP {
  static HTTPError = HTTPError
  static TimeoutError = TimeoutError

  static post = async (resource: string | Request, options?: HTTPOptions): Promise<ExtendedResponse> => new HTTP(options).post(resource, options)
  static get = async (resource: string | Request, options?: HTTPOptions): Promise<ExtendedResponse> => new HTTP(options).get(resource, options)
  static put = async (resource: string | Request, options?: HTTPOptions): Promise<ExtendedResponse> => new HTTP(options).put(resource, options)
  static delete = async (resource: string | Request, options?: HTTPOptions): Promise<ExtendedResponse> => new HTTP(options).delete(resource, options)
  static options = async (resource: string | Request, options?: HTTPOptions): Promise<ExtendedResponse> => new HTTP(options).options(resource, options)

  public readonly opts: HTTPOptions

  constructor (options: HTTPOptions = {}) {
    this.opts = merge({}, defaults, options)
  }

  /**
   * Fetch
   */
  async fetch (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    const opts = merge({}, this.opts, options)
    const headers = new Headers(opts.headers)

    // validate resource type
    if (typeof resource !== 'string' && !(resource instanceof URL || resource instanceof Request)) {
      throw new TypeError('`resource` must be a string, URL, or Request')
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const url = new URL(resource.toString(), opts.base)

    const {
      searchParams,
      transformSearchParams,
      json
    } = opts

    if (searchParams != null) {
      if (typeof transformSearchParams === 'function') {
        url.search = transformSearchParams(new URLSearchParams(opts.searchParams))
      } else {
        url.search = new URLSearchParams(opts.searchParams).toString()
      }
    }

    if (json != null) {
      opts.body = JSON.stringify(opts.json)
      headers.set('content-type', 'application/json')
    }

    const signals = [opts.signal]

    if (opts.timeout != null && isNaN(opts.timeout) && opts.timeout > 0) {
      signals.push(AbortSignal.timeout(opts.timeout))
    }

    const signal = anySignal(signals)

    try {
      if (globalThis.ReadableStream != null && opts.body instanceof globalThis.ReadableStream && (isBrowser || isWebWorker)) {
        // https://bugzilla.mozilla.org/show_bug.cgi?id=1387483
        opts.body = new Blob(await all(browserReableStreamToIt<Uint8Array>(opts.body)))
      }

      log.trace('outgoing headers', opts.headers)
      log.trace('%s %s', opts.method, url)

      // @ts-expect-error extra properties are added later
      const response: ExtendedResponse = await fetch(url.toString(), {
        ...opts,
        signal: opts.signal,
        timeout: undefined,
        headers,

        // https://fetch.spec.whatwg.org/#dom-requestinit-duplex
        // https://github.com/whatwg/fetch/issues/1254
        duplex: 'half'
      })

      log('%s %s %d', opts.method, url, response.status)
      log.trace('incoming headers', response.headers)

      if (!response.ok && opts.throwHttpErrors === true) {
        if (opts.handleError != null) {
          await opts.handleError(response)
        }
        throw new HTTPError(response)
      }

      response.iterator = async function * () {
        yield * fromStream(response.body)
      }

      response.ndjson = async function * () {
        for await (const chunk of ndjson(response.iterator())) {
          if (options.transform != null) {
            yield options.transform(chunk)
          } else {
            yield chunk
          }
        }
      }

      return response
    } finally {
      signal.clear()
    }
  }

  async post (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    return this.fetch(resource, { ...options, method: 'POST' })
  }

  async get (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    return this.fetch(resource, { ...options, method: 'GET' })
  }

  async put (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    return this.fetch(resource, { ...options, method: 'PUT' })
  }

  async delete (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    return this.fetch(resource, { ...options, method: 'DELETE' })
  }

  async options (resource: string | Request, options: HTTPOptions = {}): Promise<ExtendedResponse> {
    return this.fetch(resource, { ...options, method: 'OPTIONS' })
  }
}

/**
 * Parses NDJSON chunks from an iterator
 */
const ndjson = async function * (source: AsyncIterable<Uint8Array>): AsyncIterable<any> {
  const decoder = new TextDecoder()
  let buf = ''

  for await (const chunk of source) {
    buf += decoder.decode(chunk, { stream: true })
    const lines = buf.split(/\r?\n/)

    for (let i = 0; i < lines.length - 1; i++) {
      const l = lines[i].trim()
      if (l.length > 0) {
        yield JSON.parse(l)
      }
    }
    buf = lines[lines.length - 1]
  }
  buf += decoder.decode()
  buf = buf.trim()
  if (buf.length !== 0) {
    yield JSON.parse(buf)
  }
}

/**
 * Stream to AsyncIterable
 *
 * @template TChunk
 * @param {ReadableStream<TChunk> | NodeReadableStream | null} source
 * @returns {AsyncIterable<TChunk>}
 */
const fromStream = <TChunk> (source: ReadableStream<TChunk> | Readable | null): AsyncIterable<TChunk> => {
  if (isAsyncIterable(source)) {
    return source
  }

  // Workaround for https://github.com/node-fetch/node-fetch/issues/766
  if (isNodeReadableStream(source)) {
    const iter = source[Symbol.asyncIterator]()
    return {
      [Symbol.asyncIterator] () {
        return {
          next: iter.next.bind(iter),
          return (value: any): any {
            source.destroy()
            if (typeof iter.return === 'function') {
              return iter.return()
            }
            return Promise.resolve({ done: true, value })
          }
        }
      }
    }
  }

  if (isWebReadableStream(source)) {
    const reader = source.getReader()
    return (async function * () {
      try {
        while (true) {
          // Read from the stream
          const { done, value } = await reader.read()
          // Exit if we're done
          if (done) return
          // Else yield the chunk
          if (value != null) {
            yield value
          }
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new TypeError('Body can\'t be converted to AsyncIterable')
}

/**
 * Check if it's an AsyncIterable
 */
const isAsyncIterable = <TChunk> (value: any): value is AsyncIterable<TChunk> => {
  return value !== null && typeof value[Symbol.asyncIterator] === 'function'
}

/**
 * Check for web readable stream
 */
const isWebReadableStream = <TChunk> (value: any): value is ReadableStream<TChunk> => {
  return value != null && typeof value.getReader === 'function'
}

/**
 * Check for node readable stream
 */
const isNodeReadableStream = (value: any): value is Readable =>
  Object.prototype.hasOwnProperty.call(value, 'readable') &&
  Object.prototype.hasOwnProperty.call(value, 'writable')
