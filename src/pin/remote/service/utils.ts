import type { RemotePinServiceWithStat, Stat } from './index.js'

export function encodeEndpoint (url: URL): string {
  const href = String(url)
  if (href === 'undefined') {
    throw Error('endpoint is required')
  }
  // Workaround trailing `/` issue in go-ipfs
  // @see https://github.com/ipfs/go-ipfs/issues/7826
  return href[href.length - 1] === '/' ? href.slice(0, -1) : href
}

export function decodeRemoteService (json: any): RemotePinServiceWithStat {
  const service: RemotePinServiceWithStat = {
    service: json.Service,
    endpoint: new URL(json.ApiEndpoint)
  }

  if (json.Stat != null) {
    service.stat = decodeStat(json.Stat)
  }

  return service
}

export function decodeStat (json: any): Stat {
  switch (json.Status) {
    case 'valid': {
      const { Pinning, Pinned, Queued, Failed } = json.PinCount
      return {
        status: 'valid',
        pinCount: {
          queued: Queued,
          pinning: Pinning,
          pinned: Pinned,
          failed: Failed
        }
      }
    }
    case 'invalid': {
      return { status: 'invalid' }
    }
    default: {
      return { status: json.Status }
    }
  }
}
