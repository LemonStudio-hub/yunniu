import type { JWTPayload } from './db/models'

export type Env = {
  DB: D1Database
  R2: R2Bucket
  KV: KVNamespace
  JWT_SECRET: string
  ENVIRONMENT?: string
  AVATAR_SERVICE_URL?: string
  AVATAR_FALLBACK_URL?: string
}

export type Bindings = Env

export type Variables = {
  user: JWTPayload
}

export type AppContext = {
  Bindings: Env
  Variables: Variables
}