import { createCp } from './cp.js'
import { createFlush } from './flush.js'
import { createLs } from './ls.js'
import { createMkdir } from './mkdir.js'
import { createMv } from './mv.js'
import { createRead } from './read.js'
import { createRm } from './rm.js'
import { createStat } from './stat.js'
import { createWrite } from './write.js'
import type { AddProgressFn, HTTPRPCOptions, IPFSPath } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'
import type { Mtime, MtimeLike } from 'ipfs-unixfs'
import type { CID, Version } from 'multiformats/cid'

export interface MFSEntry {
  /**
   * The object's name
   */
  name: string

  /**
   * The object's type (directory or file)
   */
  type: 'directory' | 'file'

  /**
   * The size of the file in bytes
   */
  size: number

  /**
   * The CID of the object
   */
  cid: CID

  /**
   * The UnixFS mode as a Number
   */
  mode?: number

  /**
   * An object with numeric secs and nsecs properties
   */
  mtime?: Mtime
}

export interface MFSOptions extends HTTPRPCOptions {
  /**
   * If true the changes will be immediately flushed to disk
   */
  flush?: boolean
}

export interface FilesChmodOptions extends MFSOptions {
  /**
   * If true mode will be applied to the entire tree under path
   */
  recursive?: boolean

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number
}

export interface FilesCpOptions extends MFSOptions {
  /**
   * The value or node that was fetched during the get operation
   */
  parents?: boolean

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number
}

export interface FilesMkdirOptions extends MFSOptions {
  /**
   * If true, create intermediate directories
   */
  parents?: boolean

  /**
   * An integer that represents the file mode
   */
  mode?: number

  /**
   * A Date object, an object with { secs, nsecs } properties where secs is the number of seconds since (positive) or before (negative) the Unix Epoch began and nsecs is the number of nanoseconds since the last full second, or the output of process.hrtime()
   */
  mtime?: MtimeLike

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number
}

export interface FilesStatOptions extends HTTPRPCOptions {
  /**
   * If true, return only the CID
   */
  hash?: boolean

  /**
   * If true, return only the size
   */
  size?: boolean

  /**
   * If true, compute the amount of the DAG that is local and if possible the total size
   */
  withLocal?: boolean
}

export interface FilesStatResult {
  /**
   * A CID instance
   */
  cid: CID

  /**
   * The file size in Bytes
   */
  size: number

  /**
   * The size of the DAGNodes making up the file in Bytes
   */
  cumulativeSize: number

  /**
   * Either directory or file
   */
  type: 'directory' | 'file'

  /**
   * If type is directory, this is the number of files in the directory. If it is file it is the number of blocks that make up the file
   */
  blocks: number

  /**
   * Indicates if locality information is present
   */
  withLocality: boolean

  /**
   * Indicates if the queried dag is fully present locally
   */
  local?: boolean

  /**
   * Indicates the cumulative size of the data present locally
   */
  sizeLocal?: number

  /**
   * UnixFS mode if applicable
   */
  mode?: number

  /**
   * UnixFS mtime if applicable
   */
  mtime?: Mtime
}

export interface FilesTouchOptions extends MFSOptions {
  /**
   * A Date object, an object with { secs, nsecs } properties where secs is the number of seconds since (positive) or before (negative) the Unix Epoch began and nsecs is the number of nanoseconds since the last full second, or the output of process.hrtime()
   */
  mtime?: MtimeLike

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number
}

export interface FilesRmOptions extends MFSOptions {
  /**
   * If true all paths under the specifed path(s) will be removed
   */
  recursive?: boolean

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number
}

export interface FilesReadOptions extends HTTPRPCOptions {
  /**
   * An offset to start reading the file from
   */
  offset?: number

  /**
   * An optional max length to read from the file
   */
  length?: number
}

export interface FilesWriteOptions extends MFSOptions {
  /**
   * An offset within the file to start writing at
   */
  offset?: number

  /**
   * Optionally limit how many bytes are written
   */
  length?: number

  /**
   * Create the MFS path if it does not exist
   */
  create?: boolean

  /**
   * Create intermediate MFS paths if they do not exist
   */
  parents?: boolean

  /**
   * Truncate the file at the MFS path if it would have been larger than the passed content
   */
  truncate?: boolean

  /**
   * If true, DAG leaves will contain raw file data and not be wrapped in a protobuf
   */
  rawLeaves?: boolean

  /**
   * An integer that represents the file mode
   */
  mode?: number

  /**
   * A Date object, an object with { secs, nsecs } properties where secs is the number of seconds since (positive) or before (negative) the Unix Epoch began and nsecs is the number of nanoseconds since the last full second, or the output of process.hrtime()
   */
  mtime?: MtimeLike

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number

  /**
   * If writing a file and only a single leaf would be present, store the file data in the root node
   */
  reduceSingleLeafToSelf?: boolean

  /**
   * What sort of DAG structure to create
   */
  strategy?: 'balanced' | 'trickle'

  /**
   * Callback to be notified of write progress
   */
  progress?: AddProgressFn
}

export interface FilesMvOptions extends MFSOptions {
  /**
   * Create intermediate MFS paths if they do not exist
   */
  parents?: boolean

  /**
   * The hash algorithm to use for any updated entries
   */
  hashAlg?: string

  /**
   * The CID version to use for any updated entries
   */
  cidVersion?: Version

  /**
   * The threshold for splitting any modified folders into HAMT shards
   */
  shardSplitThreshold?: number

  recursive?: boolean
}

export interface LSOptions extends HTTPRPCOptions {
  long?: boolean
}

export interface FilesAPI {
  /**
   * Copy files from one location to another
   *
   * - If from has multiple values then to must be a directory.
   * - If from has a single value and to exists and is a directory, from will be copied into to.
   * - If from has a single value and to exists and is a file, from must be a file and the contents of to will be replaced with the contents of from otherwise an error will be returned.
   * - If from is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.
   * - If from is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.
   *
   * @example
   * ```js
   * // To copy a file
   * await ipfs.files.cp('/src-file', '/dst-file')
   *
   * // To copy a directory
   * await ipfs.files.cp('/src-dir', '/dst-dir')
   *
   * // To copy multiple files to a directory
   * await ipfs.files.cp('/src-file1', '/src-file2', '/dst-dir')
   * ```
   */
  cp(from: IPFSPath | IPFSPath[], to: string, options?: FilesCpOptions): Promise<void>

  /**
   * Make a directory in your MFS
   */
  mkdir(path: string, options?: FilesMkdirOptions): Promise<void>

  /**
   * Get file or directory statistics
   */
  stat(ipfsPath: IPFSPath, options?: FilesStatOptions): Promise<FilesStatResult>

  /**
   * Remove a file or directory
   *
   * @example
   * ```js
   * // To remove a file
   * await ipfs.files.rm('/my/beautiful/file.txt')
   *
   * // To remove multiple files
   * await ipfs.files.rm(['/my/beautiful/file.txt', '/my/other/file.txt'])
   *
   * // To remove a directory
   * await ipfs.files.rm('/my/beautiful/directory', { recursive: true })
   * ```
   */
  rm(ipfsPaths: string | string[], options?: FilesRmOptions): Promise<void>

  /**
   * Read a file
   *
   * @example
   * ```js
   * const chunks = []
   *
   * for await (const chunk of ipfs.files.read('/hello-world')) {
   *   chunks.push(chunk)
   * }
   *
   * console.log(uint8ArrayConcat(chunks).toString())
   * // Hello, World!
   * ```
   */
  read(ipfsPath: IPFSPath, options?: FilesReadOptions): AsyncIterable<Uint8Array>

  /**
   * Write to an MFS path
   *
   * @example
   * ```js
   * await ipfs.files.write('/hello-world', new TextEncoder().encode('Hello, world!'))
   * ```
   */
  write(ipfsPath: string, content: string | Uint8Array | Blob | AsyncIterable<Uint8Array> | Iterable<Uint8Array>, options?: FilesWriteOptions): Promise<void>

  /**
   * Move files from one location to another
   *
   * - If from has multiple values then to must be a directory.
   * - If from has a single value and to exists and is a directory, from will be moved into to.
   * - If from has a single value and to exists and is a file, from must be a file and the contents of to will be replaced with the contents of from otherwise an error will be returned.
   * - If from is an IPFS path, and an MFS path exists with the same name, the IPFS path will be chosen.
   * - If from is an IPFS path and the content does not exist in your node's repo, only the root node of the source file with be retrieved from the network and linked to from the destination. The remainder of the file will be retrieved on demand.
   * - All values of from will be removed after the operation is complete unless they are an IPFS path.
   *
   * @example
   * ```js
   * await ipfs.files.mv('/src-file', '/dst-file')
   *
   * await ipfs.files.mv('/src-dir', '/dst-dir')
   *
   * await ipfs.files.mv('/src-file1', '/src-file2', '/dst-dir')
   * ```
   */
  mv(from: string | string[], to: string, options?: FilesMvOptions): Promise<void>

  /**
   * Flush a given path's data to the disk
   *
   * @example
   * ```js
   * const cid = await ipfs.files.flush('/')
   * ```
   */
  flush(ipfsPath: string, options?: HTTPRPCOptions): Promise<CID>

  /**
   * List directories in the local mutable namespace
   *
   * @example
   * ```js
   * for await (const file of ipfs.files.ls('/screenshots')) {
   *   console.log(file.name)
   * }
   * // 2018-01-22T18:08:46.775Z.png
   * // 2018-01-22T18:08:49.184Z.png
   * ```
   */
  ls(ipfsPath: IPFSPath, options?: LSOptions): AsyncIterable<MFSEntry>
}

export function createFiles (client: HTTPRPCClient): FilesAPI {
  return {
    cp: createCp(client),
    flush: createFlush(client),
    ls: createLs(client),
    mkdir: createMkdir(client),
    mv: createMv(client),
    read: createRead(client),
    rm: createRm(client),
    stat: createStat(client),
    write: createWrite(client)
  }
}
