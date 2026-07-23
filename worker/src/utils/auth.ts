import type { WorkerEnv } from '../types/env'

export function hasValidApiKey(request: Request, env: WorkerEnv) {
  const expected = env.API_KEY
  if (!expected) {
    return false
  }
  const provided = request.headers.get('x-api-key')
  return provided === expected
}
