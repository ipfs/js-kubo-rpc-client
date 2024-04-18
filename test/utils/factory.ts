import { createFactory } from 'ipfsd-ctl'
import { path } from 'kubo'
import mergeOpts from 'merge-options'
import { isNode } from 'wherearewe'
import * as kuboRpcModule from '../../src/index.js'
import type { KuboRPCFactory } from '../interface-tests/src/index.js'

const merge = mergeOpts.bind({ ignoreUndefined: true })

const commonOptions = {
  test: true,
  type: 'go',
  kuboRpcModule,
  endpoint: process.env.IPFSD_SERVER
}

const commonOverrides = {
  go: {
    ipfsBin: isNode ? (process.env.IPFS_GO_EXEC ?? path()) : undefined
  }
}

export const factory = (options: any = {}, overrides: any = {}): KuboRPCFactory => createFactory(
  merge(commonOptions, options),
  merge(commonOverrides, overrides)
) as unknown as KuboRPCFactory
