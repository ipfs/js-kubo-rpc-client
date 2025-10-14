import { createFactory } from 'ipfsd-ctl'
import kubo from 'kubo'
// @ts-expect-error needs https://github.com/schnittstabil/merge-options/pull/28
import mergeOpts from 'merge-options'
import { isNode } from 'wherearewe'
import { create } from '../../src/index.js'
import type { Factory, KuboNode, KuboOptions } from 'ipfsd-ctl'

const merge = mergeOpts.bind({ ignoreUndefined: true })

const commonOptions: KuboOptions = {
  test: true,
  type: 'kubo',
  rpc: create,
  endpoint: process.env.IPFSD_SERVER,
  bin: isNode ? (process.env.IPFS_GO_EXEC ?? kubo.path()) : undefined
}

export const factory = (options: any = {}, overrides: any = {}): Factory<KuboNode> => createFactory(
  merge(commonOptions, options),
  overrides
)
