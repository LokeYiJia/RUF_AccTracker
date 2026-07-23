import { handleRequest, handleScheduled } from './routes/index'
import type { Env } from './types/env'

export default {
  async fetch(request: Request, env: Env) {
    return handleRequest(request, env)
  },
  async scheduled(event: ScheduledEvent, env: Env) {
    return handleScheduled(event, env)
  },
}
