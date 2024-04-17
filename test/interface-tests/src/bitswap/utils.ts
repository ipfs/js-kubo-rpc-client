import delay from 'delay'
import type { KuboRPCClient } from '../../../../src/index.js'
import type { PeerId } from '@libp2p/interface'

export interface WaitOptions {
  timeout?: number
  interval?: number
  peerId?: PeerId
}

export async function waitForWantlistKey (ipfs: KuboRPCClient, key: string, opts: WaitOptions = {}): Promise<void> {
  opts.timeout = opts.timeout ?? 10000
  opts.interval = opts.interval ?? 100

  const end = Date.now() + opts.timeout

  while (Date.now() < end) {
    let list

    if (opts.peerId != null) {
      list = await ipfs.bitswap.wantlistForPeer(opts.peerId)
    } else {
      list = await ipfs.bitswap.wantlist()
    }

    if (list.some(cid => cid.toString() === key)) {
      return
    }

    await delay(opts.interval)
  }

  throw new Error(`Timed out waiting for ${key} in wantlist`)
}

export async function waitForWantlistKeyToBeRemoved (ipfs: KuboRPCClient, key: string, opts: WaitOptions = {}): Promise<void> {
  opts.timeout = opts.timeout ?? 10000
  opts.interval = opts.interval ?? 100

  const end = Date.now() + opts.timeout

  while (Date.now() < end) {
    let list

    if (opts.peerId != null) {
      list = await ipfs.bitswap.wantlistForPeer(opts.peerId)
    } else {
      list = await ipfs.bitswap.wantlist()
    }

    if (list.some(cid => cid.toString() === key)) {
      await delay(opts.interval)

      continue
    }

    return
  }

  throw new Error(`Timed out waiting for ${key} to be removed from wantlist`)
}
