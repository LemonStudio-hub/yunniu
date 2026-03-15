import { SignJWT, jwtVerify } from 'jose'
import type { JWTPayload } from '../db/models'

const JWT_SECRET = new TextEncoder().encode(
  (globalThis as any).JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function generateToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}