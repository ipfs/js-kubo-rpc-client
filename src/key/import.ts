import { anySignal } from 'any-signal'
import { multipartRequest } from '../lib/multipart-request.ts'
import { objectToCamel } from '../lib/object-to-camel.ts'
import { toUrlSearchParams } from '../lib/to-url-search-params.ts'
import type { Key, KeyAPI, KeyImportOptions } from './index.ts'
import type { HTTPRPCOptions, ToContent } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export function createImport (client: HTTPRPCClient): KeyAPI['import'] {
  return async function importKey (name: string, data: ToContent, optionsOrPassword: KeyImportOptions | string = {}, legacyOptions: HTTPRPCOptions = {}) {
    if (typeof optionsOrPassword === 'string') {
      const res = await client.post('key/import', {
        signal: legacyOptions.signal,
        searchParams: toUrlSearchParams({
          arg: name,
          pem: data,
          password: optionsOrPassword,
          ...legacyOptions
        }),
        headers: legacyOptions.headers
      })
      return objectToCamel<Key>(await res.json())
    }

    const { ipnsBase, allowAnyKeyType, headers, signal: callerSignal, ...options } = optionsOrPassword
    const controller = new AbortController()
    const signal = anySignal([controller.signal, callerSignal])

    try {
      const res = await client.post('key/import', {
        signal,
        searchParams: toUrlSearchParams({
          arg: name,
          'ipns-base': ipnsBase,
          'allow-any-key-type': allowAnyKeyType,
          ...options
        }),
        ...await multipartRequest([data], controller, headers)
      })
      return objectToCamel<Key>(await res.json())
    } finally {
      signal.clear()
    }
  }
}
