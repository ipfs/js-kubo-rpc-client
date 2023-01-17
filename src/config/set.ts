import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createSet (client: Client) {
  const set = async (key: string, value: any, options?: ClientOptions): Promise<void> => {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type')
    }

    const params = {
      ...options,
      ...encodeParam(key, value)
    }

    const res = await client.post('config', {
      signal: options?.signal,
      searchParams: toUrlSearchParams(params),
      headers: options?.headers
    })

    await res.text()
  }

  return set
}

const encodeParam = (key: string, value: any): object => {
  switch (typeof value) {
    case 'boolean':
      return { arg: [key, value.toString()], bool: true }
    case 'string':
      return { arg: [key, value] }
    default:
      return { arg: [key, JSON.stringify(value)], json: true }
  }
}
