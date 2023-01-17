import { createGen } from './gen.js'
import { createImport } from './import.js'
import { createList } from './list.js'
import { createRename } from './rename.js'
import { createRm } from './rm.js'
import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'

export function createKey (client: Client): KeyAPI {
  return {
    gen: createGen(client),
    import: createImport(client),
    list: createList(client),
    rename: createRename(client),
    rm: createRm(client)
  }
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
  gen: (name: string, options?: GenOptions) => Promise<Key>

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
  list: (options?: ClientOptions) => Promise<Key[]>

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
  rm: (name: string, options?: ClientOptions) => Promise<Key>

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
  rename: (oldName: string, newName: string, options?: ClientOptions) => Promise<RenameKeyResult>

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
  import: (name: string, pem: string, password: string, options?: ClientOptions) => Promise<Key>
}

export type KeyType = 'ed25519' | 'rsa'

export interface GenOptions extends ClientOptions {
  type: KeyType
  size?: number
}

export interface Key {
  id: string
  name: string
}

export interface RenameKeyResult {
  id: string
  was: string
  now: string
  overwrite: boolean
}
