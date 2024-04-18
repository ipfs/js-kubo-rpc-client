import type { BlockCodec } from 'multiformats/codecs/interface'

export interface LoadCodecFn { (codeOrName: number | string): Promise<BlockCodec<any, any>> }

const LOAD_CODEC: LoadCodecFn = async (codeOrName) => Promise.reject(new Error(`No codec found for "${codeOrName}"`))

export interface MultihashesInit {
  loadCodec?: LoadCodecFn
  codecs: Array<BlockCodec<any, any>>
}

export class Multicodecs {
  private readonly _codecsByName: Record<string, BlockCodec<any, any>>
  private readonly _codecsByCode: Record<number, BlockCodec<any, any>>
  private readonly _loadCodec: LoadCodecFn

  constructor (options: MultihashesInit) {
    // Object with current list of active resolvers
    this._codecsByName = {}

    // Object with current list of active resolvers
    this._codecsByCode = {}

    this._loadCodec = options.loadCodec ?? LOAD_CODEC

    // Enable all supplied codecs
    for (const codec of options.codecs) {
      this.addCodec(codec)
    }
  }

  /**
   * Add support for a block codec
   */
  addCodec (codec: BlockCodec<any, any>): void {
    if (this._codecsByName[codec.name] != null || this._codecsByCode[codec.code] != null) {
      throw new Error(`Resolver already exists for codec "${codec.name}"`)
    }

    this._codecsByName[codec.name] = codec
    this._codecsByCode[codec.code] = codec
  }

  /**
   * Remove support for a block codec
   */
  removeCodec (codec: BlockCodec<any, any>): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._codecsByName[codec.name]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this._codecsByCode[codec.code]
  }

  async getCodec (code: number | string): Promise<BlockCodec<any, any>> {
    const table = typeof code === 'string' ? this._codecsByName : this._codecsByCode

    // @ts-expect-error cannot derive code type
    if (table[code] != null) {
      // @ts-expect-error cannot derive code type
      return table[code]
    }

    // If not supported, attempt to dynamically load this codec
    const codec = await this._loadCodec(code)

    // @ts-expect-error cannot derive code type
    if (table[code] == null) {
      this.addCodec(codec)
    }

    return codec
  }

  listCodecs (): Array<BlockCodec<any, any>> {
    return Object.values(this._codecsByName)
  }
}
