import type { MultibaseCodec } from 'multiformats/bases/interface'

export interface LoadBaseFn { (codeOrName: string): Promise<MultibaseCodec<any>> }

const LOAD_BASE: LoadBaseFn = async (name) => Promise.reject(new Error(`No base found for "${name}"`))

export interface MultibasesInit {
  loadBase?: LoadBaseFn
  bases: Array<MultibaseCodec<any>>
}

export class Multibases {
  private readonly _basesByName: Record<string, MultibaseCodec<any>>
  private readonly _basesByPrefix: Record<string, MultibaseCodec<any>>
  private readonly _loadBase: LoadBaseFn

  constructor (options: MultibasesInit) {
    // Object with current list of active resolvers
    this._basesByName = {}

    // Object with current list of active resolvers
    this._basesByPrefix = {}

    this._loadBase = options.loadBase ?? LOAD_BASE

    // Enable all supplied codecs
    for (const base of options.bases) {
      this.addBase(base)
    }
  }

  /**
   * Add support for a multibase codec
   */
  addBase (base: MultibaseCodec<any>): void {
    if (this._basesByName[base.name] != null && this._basesByPrefix[base.prefix] != null) {
      throw new Error(`Codec already exists for codec "${base.name}"`)
    }

    this._basesByName[base.name] = base
    this._basesByPrefix[base.prefix] = base
  }

  /**
   * Remove support for a multibase codec
   */
  removeBase (base: MultibaseCodec<any>): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._basesByName[base.name]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._basesByPrefix[base.prefix]
  }

  async getBase (nameOrPrefix: string): Promise<MultibaseCodec<any>> {
    if (this._basesByName[nameOrPrefix] != null) {
      return this._basesByName[nameOrPrefix]
    }

    if (this._basesByPrefix[nameOrPrefix] != null) {
      return this._basesByPrefix[nameOrPrefix]
    }

    // If not supported, attempt to dynamically load this codec
    const base = await this._loadBase(nameOrPrefix)

    if (this._basesByName[base.name] == null && this._basesByPrefix[base.prefix] == null) {
      this.addBase(base)
    }

    return base
  }

  listBases (): Array<MultibaseCodec<any>> {
    return Object.values(this._basesByName)
  }
}
