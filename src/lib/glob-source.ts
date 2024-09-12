import fs from 'node:fs'
import fsp from 'node:fs/promises'
import os from 'node:os'
import Path from 'node:path'
import { InvalidParametersError } from '@libp2p/interface'
import glob from 'it-glob'
import type { MtimeLike } from 'ipfs-unixfs'
import type { Options as GlobOptions } from 'it-glob'

export interface GlobSourceOptions {
  /**
   * Include .dot files in matched paths
   */
  hidden?: boolean

  /**
   * follow symlinks
   */
  followSymlinks?: boolean

  /**
   * Preserve mode
   */
  preserveMode?: boolean

  /**
   * Preserve mtime
   */
  preserveMtime?: boolean

  /**
   * mode to use - if preserveMode is true this will be ignored
   */
  mode?: number

  /**
   * mtime to use - if preserveMtime is true this will be ignored
   */
  mtime?: MtimeLike
}

export interface GlobSourceResult {
  path: string
  content: AsyncIterable<Uint8Array> | undefined
  mode: number | undefined
  mtime: MtimeLike | undefined
}

/**
 * Create an async iterator that yields paths that match requested glob pattern
 */
export async function * globSource (cwd: string, pattern: string, options?: GlobSourceOptions): AsyncGenerator<GlobSourceResult> {
  options = options ?? {}

  if (typeof pattern !== 'string') {
    throw new InvalidParametersError('Pattern must be a string')
  }

  if (!Path.isAbsolute(cwd)) {
    cwd = Path.resolve(process.cwd(), cwd)
  }

  if (os.platform() === 'win32') {
    cwd = toPosix(cwd)
  }

  const globOptions: GlobOptions = Object.assign({}, {
    onlyFiles: false,
    absolute: true,
    dot: Boolean(options.hidden),
    followSymbolicLinks: options.followSymlinks ?? true
  } satisfies GlobOptions)

  for await (const p of glob(cwd, pattern, globOptions)) {
    // Workaround for https://github.com/micromatch/micromatch/issues/251
    if (Path.basename(p).startsWith('.') && options.hidden !== true) {
      continue
    }

    const stat = await fsp.stat(p)

    let mode = options.mode

    if (options.preserveMode === true) {
      mode = stat.mode
    }

    let mtime = options.mtime

    if (options.preserveMtime === true) {
      mtime = stat.mtime
    }

    yield {
      path: p.replace(cwd, ''),
      content: stat.isFile() ? fs.createReadStream(p) : undefined,
      mode,
      mtime
    }
  }
}

const toPosix = (path: string): string => path.replace(/\\/g, '/')
