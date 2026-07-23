import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { WorkerEnv } from '../types/env'

export function createSupabaseClient(env: WorkerEnv): SupabaseClient {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: globalThis.fetch.bind(globalThis),
      headers: {
        'x-application-name': 'instagram-tracker-worker',
      },
    },
  })
}
