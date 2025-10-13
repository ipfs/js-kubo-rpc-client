import { multiaddr } from '@multiformats/multiaddr'
import { multiaddrToUri } from '@multiformats/multiaddr-to-uri'
import type { Multiaddr } from '@multiformats/multiaddr'

export function toUrlString (url: string | Multiaddr | URL): string {
  try {
    // @ts-expect-error cannot pass URL
    url = multiaddrToUri(multiaddr(url))
  } catch { }

  url = url.toString()

  return url
}
