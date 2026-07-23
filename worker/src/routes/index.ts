import type { Env } from '../types/env'
import { getAccountsHandler, createAccountHandler, deactivateAccountHandler, getAccountDetailHandler, getAccountAnalyticsHandler, getAccountPostsHandler, getDashboardHandler, getContentAnalysisHandler, patchPostCategoryHandler } from './handlers'
import { hasValidApiKey } from '../utils/auth'
import { json, text } from '../utils/response'

export async function handleRequest(request: Request, env: Env) {
  const url = new URL(request.url)
  const path = url.pathname
  const segments = path.split('/').filter(Boolean)
  if (segments[0] !== 'api') {
    return new Response('Not found', { status: 404 })
  }

  const method = request.method.toUpperCase()
  const requiresKey = method === 'POST' || method === 'PATCH' || method === 'DELETE'
  if (requiresKey && !hasValidApiKey(request, env)) {
    return json({ message: 'Invalid or missing API key' }, 401)
  }

  try {
    if (segments.length === 2 && segments[1] === 'accounts') {
      if (method === 'GET') return getAccountsHandler(request, env)
      if (method === 'POST') return createAccountHandler(request, env)
    }

    if (segments.length === 3 && segments[1] === 'accounts') {
      const accountId = segments[2]
      if (method === 'GET') return getAccountDetailHandler(request, env, accountId)
      if (method === 'DELETE') return deactivateAccountHandler(request, env, accountId)
    }

    if (segments.length === 4 && segments[1] === 'accounts' && segments[3] === 'analytics' && method === 'GET') {
      return getAccountAnalyticsHandler(request, env, segments[2])
    }

    if (segments.length === 4 && segments[1] === 'accounts' && segments[3] === 'posts' && method === 'GET') {
      return getAccountPostsHandler(request, env, segments[2])
    }

    if (segments.length === 2 && segments[1] === 'dashboard' && method === 'GET') {
      return getDashboardHandler(request, env)
    }

    if (segments.length === 2 && segments[1] === 'content-analysis' && method === 'GET') {
      return getContentAnalysisHandler(request, env)
    }

    if (segments.length === 3 && segments[1] === 'posts' && method === 'PATCH') {
      return patchPostCategoryHandler(request, env, segments[2])
    }

    return new Response('Not found', { status: 404 })
  } catch (error) {
    return json({ message: 'Internal server error', detail: String(error) }, 500)
  }
}

export async function handleScheduled(event: ScheduledEvent, env: Env) {
  const cron = event.cron || ''
  if (cron === '0 6 * * *') {
    return await import('./handlers').then((module) => module.collectAccountSnapshotsHandler(env))
  }
  if (cron === '0 7 * * *') {
    return await import('./handlers').then((module) => module.collectPostSnapshotsHandler(env))
  }
  return text('Unknown scheduled trigger', 400)
}
