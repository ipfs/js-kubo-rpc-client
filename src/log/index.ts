import { createGetLevel } from './get-level.js'
import { createLevel } from './level.js'
import { createLs } from './ls.js'
import { createTail } from './tail.js'
import type { HTTPRPCOptions } from '../index.js'
import type { HTTPRPCClient } from '../lib/core.js'

export interface LogAPI {
  getLevel(subsystem?: string, options?: HTTPRPCOptions): Promise<Record<string, string>>
  level(subsystem: string, level: string, options?: HTTPRPCOptions): Promise<any>
  ls(options?: HTTPRPCOptions): Promise<any>
  tail(options?: HTTPRPCOptions): AsyncIterable<any>
}

export function createLog (client: HTTPRPCClient): LogAPI {
  return {
    getLevel: createGetLevel(client),
    level: createLevel(client),
    ls: createLs(client),
    tail: createTail(client)
  }
}
