import { createCmds } from './cmds.ts'
import { createNet } from './net.ts'
import { createSys } from './sys.ts'
import type { HTTPRPCOptions } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

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
