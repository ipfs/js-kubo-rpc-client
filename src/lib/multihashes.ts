import type { MultihashHasher } from 'multiformats/hashes/interface'

export interface LoadHasherFn { (codeOrName: number | string): Promise<MultihashHasher> }

const LOAD_HASHER: LoadHasherFn = async (codeOrName) => Promise.reject(new Error(`No hasher found for "${codeOrName}"`))

export interface MultihashesInit {
  loadHasher?: LoadHasherFn
  hashers: MultihashHasher[]
}

export class Multihashes {
  private readonly _hashersByName: Record<string, MultihashHasher>
  private readonly _hashersByCode: Record<number, MultihashHasher>
  private readonly _loadHasher: LoadHasherFn

  constructor (options: MultihashesInit) {
    // Object with current list of active hashers
    this._hashersByName = {}

    // Object with current list of active hashers
    this._hashersByCode = {}

    this._loadHasher = options.loadHasher ?? LOAD_HASHER

    // Enable all supplied hashers
    for (const hasher of options.hashers) {
      this.addHasher(hasher)
    }
  }

  /**
   * Add support for a multibase hasher
   */
  addHasher (hasher: MultihashHasher): void {
    if (this._hashersByName[hasher.name] != null || this._hashersByCode[hasher.code] != null) {
      throw new Error(`Resolver already exists for codec "${hasher.name}"`)
    }

    this._hashersByName[hasher.name] = hasher
    this._hashersByCode[hasher.code] = hasher
  }

  /**
   * Remove support for a multibase hasher
   */
  removeHasher (hasher: MultihashHasher): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._hashersByName[hasher.name]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._hashersByCode[hasher.code]
  }

  /**
   * @param {number | string} code
   */
  async getHasher (code: number | string): Promise<MultihashHasher> {
    const table = typeof code === 'string' ? this._hashersByName : this._hashersByCode

    // @ts-expect-error cannot derive code type
    if (table[code] != null) {
      // @ts-expect-error cannot derive code type
      return table[code]
    }

    // If not supported, attempt to dynamically load this hasher
    const hasher = await this._loadHasher(code)

    // @ts-expect-error cannot derive code type
    if (table[code] == null) {
      this.addHasher(hasher)
    }

    return hasher
  }

  listHashers (): MultihashHasher[] {
    return Object.values(this._hashersByName)
  }
}
