import { createCmds } from './cmds.js'
import { createNet } from './net.js'
import { createSys } from './sys.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export interface DiagCmdsResult {
  active: boolean
  args: string[]
  endTime: Date
  id: string
  options: Record<string, any>
  startTime: Date
}

export interface DiagAPI {
  cmds(options?: HTTPRPCOptions): Promise<DiagCmdsResult[]>
  net(options?: HTTPRPCOptions): Promise<any>
  sys(options?: HTTPRPCOptions): Promise<any>
}

export function createDiag (client: HTTPRPCClient): DiagAPI {
  return {
    cmds: createCmds(client),
    net: createNet(client),
    sys: createSys(client)
  }
}
