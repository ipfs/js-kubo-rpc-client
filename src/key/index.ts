import { createGen } from './gen.js'
import { createImport } from './import.js'
import { createList } from './list.js'
import { createRename } from './rename.js'
import { createRm } from './rm.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export type KeyType = 'ed25519' | 'rsa'

export interface KeyGenOptions extends HTTPRPCOptions {
  type?: KeyType
  size?: number
  'ipns-base'?: string
}

export interface Key {
  id: string
  name: string
}

export interface KeyRenameResult {
  id: string
  was: string
  now: string
  overwrite: boolean
}

export interface KeyAPI {
  /**
   * Generate a new key
   *
   * @example
   * ```js
   * const key = await ipfs.key.gen('my-key', {
   *   type: 'rsa',
   *   size: 2048
   * })
   *
   * console.log(key)
   * // { id: 'QmYWqAFvLWb2G5A69JGXui2JJXzaHXiUEmQkQgor6kNNcJ',
   * //  name: 'my-key' }
   * ```
   */
  gen(name: string, options?: KeyGenOptions): Promise<Key>

  /**
   * List all the keys
   *
   * @example
   * ```js
   * const keys = await ipfs.key.list()
   *
   * console.log(keys)
   * // [
   * //   { id: 'QmTe4tuceM2sAmuZiFsJ9tmAopA8au71NabBDdpPYDjxAb',
   * //     name: 'self' },
   * //   { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //     name: 'my-key' }
   * // ]
   * ```
   */
  list(options?: HTTPRPCOptions): Promise<Key[]>

  /**
   * Remove a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.rm('my-key')
   *
   * console.log(key)
   * // { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
   * //   name: 'my-key' }
   * ```
   */
  rm(name: string, options?: HTTPRPCOptions): Promise<Key>

  /**
   * Rename a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.rename('my-key', 'my-new-key')
   *
   * console.log(key)
   * // { id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
   * //   was: 'my-key',
   * //   now: 'my-new-key',
   * //   overwrite: false }
   * ```
   */
  rename(oldName: string, newName: string, options?: HTTPRPCOptions): Promise<KeyRenameResult>

  /**
   * Remove a key
   *
   * @example
   * ```js
   * const key = await ipfs.key.import('clone', pem, 'password')
   *
   * console.log(key)
   * // { id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ',
   * //   name: 'clone' }
   * ```
   */
  import(name: string, pem: string, password: string, options?: HTTPRPCOptions): Promise<Key>
}

export function createKey (client: HTTPRPCClient): KeyAPI {
  return {
    gen: createGen(client),
    import: createImport(client),
    list: createList(client),
    rename: createRename(client),
    rm: createRm(client)
  }
}
