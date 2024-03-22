import { createLevel } from './level.js'
import { createLs } from './ls.js'
import { createTail } from './tail.js'
import type { ClientOptions } from '../index.js'
import type { Client } from '../lib/core.js'

export function createLog (client: Client): LogAPI {
  return {
    level: createLevel(client),
    ls: createLs(client),
    tail: createTail(client)
  }
}

export interface LogAPI {
  level: (subsystem: string, level: string, options?: ClientOptions) => Promise<any>
  ls: (options?: ClientOptions) => Promise<any>
  tail: (options?: ClientOptions) => AsyncIterable<any>
}
