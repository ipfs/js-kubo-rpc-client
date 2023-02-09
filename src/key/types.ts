import type { AbortOptions } from '../types'

export type KeyType = 'ed25519' | 'rsa'

export interface Key {
  id: string
  name: string
}

export interface GenOptions extends AbortOptions {
  type: KeyType
  size?: number
}

export interface RenameKeyResult {
  id: string
  was: string
  now: string
  overwrite: boolean
}

export interface KeyAPI<OptionExtension = {}> {
  export: (name: string, password: string, options?: AbortOptions & OptionExtension) => Promise<string>
  gen: (name: string, options?: GenOptions & OptionExtension) => Promise<Key>
  import: (name: string, pem: string, password: string, options?: AbortOptions & OptionExtension) => Promise<Key>
  list: (options?: AbortOptions & OptionExtension) => Promise<Key[]>
  rename: (oldName: string, newName: string, options?: AbortOptions & OptionExtension) => Promise<RenameKeyResult>
  rm: (name: string, options?: AbortOptions & OptionExtension) => Promise<Key>
}
