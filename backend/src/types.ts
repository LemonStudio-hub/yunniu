import type { JWTPayload } from './db/models'

export type Env = {
  DB: D1Database
  R2: R2Bucket
  KV: KVNamespace
}

export type Bindings = Env

export type Variables = {
  user: JWTPayload
}

export type AppContext = {
  Bindings: Env
  Variables: Variables
}