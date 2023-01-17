import { CID } from 'multiformats/cid'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import { createStat } from './files/stat.js'
import type { IPFSPath } from './index.js'
import type { Client } from './lib/core.js'
import type { IPFSEntry, ListOptions } from './root.js'

export function createLs (client: Client) {
  const stat = createStat(client)

  async function * ls (path: IPFSPath, options?: ListOptions): AsyncIterable<IPFSEntry> {
    const pathStr = `${path instanceof CID ? path.toString() : path}`

    async function mapLink (link: any): Promise<IPFSEntry> {
      const hash: string = link.Hash
      let cid: CID

      if (hash.includes('/')) {
        // the hash is a path, but we need the CID
        const ipfsPath = hash.startsWith('/ipfs/') ? hash : `/ipfs/${hash}`
        const stats = await stat(ipfsPath)

        cid = stats.cid
      } else {
        cid = CID.parse(hash)
      }

      const entry: IPFSEntry = {
        name: link.Name,
        path: pathStr + (typeof link.Name === 'string' ? `/${String(link.Name)}` : ''),
        size: link.Size,
        cid,
        type: typeOf(link)
      }

      if (link.Mode != null) {
        entry.mode = parseInt(link.Mode, 8)
      }

      if (link.Mtime !== undefined && link.Mtime !== null) {
        entry.mtime = {
          secs: link.Mtime
        }

        if (link.MtimeNsecs !== undefined && link.MtimeNsecs !== null) {
          entry.mtime.nsecs = link.MtimeNsecs
        }
      }

      return entry
    }

    const res = await client.post('ls', {
      signal: options?.signal,
      searchParams: toUrlSearchParams({
        arg: pathStr,
        ...options
      }),
      headers: options?.headers
    })

    for await (let result of res.ndjson()) {
      result = result.Objects

      if (result == null) {
        throw new Error('expected .Objects in results')
      }

      result = result[0]
      if (result == null) {
        throw new Error('expected one array in results.Objects')
      }

      const links = result.Links
      if (!Array.isArray(links)) {
        throw new Error('expected one array in results.Objects[0].Links')
      }

      if (links.length === 0) {
        // no links, this is a file, yield a single result
        yield mapLink(result)

        return
      }

      yield * links.map(mapLink)
    }
  }

  return ls
}

function typeOf (link: any): ('dir' | 'file') {
  switch (link.Type) {
    case 1:
    case 5:
      return 'dir'
    case 2:
      return 'file'
    default:
      return 'file'
  }
}
