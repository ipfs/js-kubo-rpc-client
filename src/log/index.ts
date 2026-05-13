import { createLevel } from './level.ts'
import { createLs } from './ls.ts'
import { createTail } from './tail.ts'
import type { HTTPRPCOptions } from '../index.ts'
import type { HTTPRPCClient } from '../lib/core.ts'

export interface LogAPI {
  level(subsystem: string, level: string, options?: HTTPRPCOptions): Promise<any>
  ls(options?: HTTPRPCOptions): Promise<any>
  tail(options?: HTTPRPCOptions): AsyncIterable<any>
}

export function createLog (client: HTTPRPCClient): LogAPI {
  return {
    level: createLevel(client),
    ls: createLs(client),
    tail: createTail(client)
  }
}
