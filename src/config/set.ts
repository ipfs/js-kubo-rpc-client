import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { ConfigAPI } from './index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export function createSet (client: HTTPRPCClient): ConfigAPI['set'] {
  return async function set (key, value, options = {}) {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const params = {
      ...options,
      ...encodeParam(key, value)
    }

    const res = await client.post('config', {
      signal: options.signal,
      searchParams: toUrlSearchParams(params),
      headers: options.headers
    })

    await res.text()
  }
}

function encodeParam (key: any, value: any): any {
  switch (typeof value) {
    case 'boolean':
      return { arg: [key, value.toString()], bool: true }
    case 'string':
      return { arg: [key, value] }
    default:
      return { arg: [key, JSON.stringify(value)], json: true }
  }
}
