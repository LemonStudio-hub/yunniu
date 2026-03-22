import type { JWTPayload } from './db/models'

export type Env = {
  DB: D1Database
  R2: R2Bucket
  KV: KVNamespace
  JWT_SECRET: string
  ENVIRONMENT?: string
}

export type Bindings = Env

export type Variables = {
  user: JWTPayload
  userId?: string
  currentUser?: any
  userRole?: string
  codeAttachmentService?: any
}

export type AppContext = {
  Bindings: Env
  Variables: Variables
}