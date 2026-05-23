/**
 * Centralized environment access + mock-mode detection.
 *
 * Each endpoint checks `mode.*` to know whether it should call the real service
 * or return canned data. This lets you run the whole API locally without
 * signing up for anything, then activate services one at a time by adding
 * their keys to .env.local.
 */

export const env = {
  // Anthropic (Claude vision)
  anthropicKey: process.env.ANTHROPIC_API_KEY,

  // Cloudinary (file storage)
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,

  // Neon (Postgres)
  databaseUrl: process.env.DATABASE_URL,

  // Pusher (realtime)
  pusherAppId: process.env.PUSHER_APP_ID,
  pusherKey: process.env.PUSHER_KEY,
  pusherSecret: process.env.PUSHER_SECRET,
  pusherCluster: process.env.PUSHER_CLUSTER,
}

export const mode = {
  // Each is "real" when its required keys are present, "mock" otherwise.
  claude: env.anthropicKey ? 'real' : 'mock',
  storage: env.cloudinaryName && env.cloudinaryKey && env.cloudinarySecret ? 'real' : 'mock',
  db: env.databaseUrl ? 'real' : 'mock',
  realtime:
    env.pusherAppId && env.pusherKey && env.pusherSecret && env.pusherCluster
      ? 'real'
      : 'mock',
}

/** Log mode summary the first time something imports this module (dev only). */
if (process.env.NODE_ENV !== 'production') {
  console.log(
    '[magicthon api] mode:',
    JSON.stringify(mode),
  )
}
