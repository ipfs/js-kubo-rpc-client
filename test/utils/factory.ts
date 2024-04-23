import { createFactory, type Factory, type KuboNode, type KuboOptions } from 'ipfsd-ctl'
import { path } from 'kubo'
import mergeOpts from 'merge-options'
import { isNode } from 'wherearewe'
import { create } from '../../src/index.js'

const merge = mergeOpts.bind({ ignoreUndefined: true })

const commonOptions: KuboOptions = {
  test: true,
  type: 'kubo',
  rpc: create,
  endpoint: process.env.IPFSD_SERVER,
  bin: isNode ? (process.env.IPFS_GO_EXEC ?? path()) : undefined
}

export const factory = (options: any = {}, overrides: any = {}): Factory<KuboNode> => createFactory(
  merge(commonOptions, options),
  overrides
)
