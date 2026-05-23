/**
 * Lazy initializers for external services. Each returns null when the
 * corresponding env vars aren't set — callers must handle that.
 */

import Anthropic from '@anthropic-ai/sdk'
import { v2 as cloudinary } from 'cloudinary'
import { neon } from '@neondatabase/serverless'
import Pusher from 'pusher'
import { env, mode } from './env.js'

let _anthropic
export function getAnthropic() {
  if (mode.claude !== 'real') return null
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: env.anthropicKey })
  return _anthropic
}

let _cloudinaryConfigured = false
export function getCloudinary() {
  if (mode.storage !== 'real') return null
  if (!_cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: env.cloudinaryName,
      api_key: env.cloudinaryKey,
      api_secret: env.cloudinarySecret,
      secure: true,
    })
    _cloudinaryConfigured = true
  }
  return cloudinary
}

let _sql
export function getSql() {
  if (mode.db !== 'real') return null
  if (!_sql) _sql = neon(env.databaseUrl)
  return _sql
}

let _pusher
export function getPusher() {
  if (mode.realtime !== 'real') return null
  if (!_pusher) {
    _pusher = new Pusher({
      appId: env.pusherAppId,
      key: env.pusherKey,
      secret: env.pusherSecret,
      cluster: env.pusherCluster,
      useTLS: true,
    })
  }
  return _pusher
}
