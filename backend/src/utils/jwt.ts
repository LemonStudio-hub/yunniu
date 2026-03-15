import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '../db/models'

let JWT_SECRET: Uint8Array | null = null

export function initJWT(secret: string): void {
  JWT_SECRET = new TextEncoder().encode(secret)
  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
}

function getSecret(): Uint8Array {
  if (!JWT_SECRET) {
    throw new Error('JWT not initialized. Call initJWT() first')
  }
  return JWT_SECRET
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const secret = getSecret()
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}