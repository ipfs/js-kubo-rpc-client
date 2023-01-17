import type { Client } from '../lib/core.js'
import type { ClientOptions } from '../index.js'
import { createCmds } from './cmds.js'
import { createSys } from './sys.js'

export function createDiag (client: Client): DiagAPI {
  return {
    cmds: createCmds(client),
    sys: createSys(client)
  }
}

export interface DiagAPI {
  cmds: (options?: ClientOptions) => Promise<CmdsResult[]>
  sys: (options?: ClientOptions) => Promise<any>
}

export interface CmdsResult {
  active: boolean
  args: string[]
  endTime: Date
  id: string
  options: Record<string, any>
  startTime: Date
}
