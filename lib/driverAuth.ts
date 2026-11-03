import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

const COOKIE = 'vtcland_driver_session'
const TTL_SECONDS = 8 * 60 * 60

function signature(expiresAt: string): string {
  return createHmac('sha256', process.env.DRIVER_SESSION_SECRET ?? 'missing-session-secret').update(expiresAt).digest('hex')
}

export function validPassword(value: string): boolean {
  const expected = process.env.DRIVER_DASHBOARD_PASSWORD ?? ''
  const left = Buffer.from(value); const right = Buffer.from(expected)
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right)
}

export async function createDriverSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + TTL_SECONDS)
  const jar = await cookies()
  jar.set(COOKIE, `${expiresAt}.${signature(expiresAt)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
    path: '/', maxAge: TTL_SECONDS,
  })
}

export async function clearDriverSession() {
  const jar = await cookies(); jar.delete(COOKIE)
}

export async function isDriverAuthenticated(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value
  if (!value) return false
  const [expiresAt, supplied] = value.split('.')
  if (!expiresAt || !supplied || Number(expiresAt) < Date.now() / 1000) return false
  const expected = signature(expiresAt)
  const left = Buffer.from(supplied); const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function driverApiConfig() {
  const url = process.env.VTCLAND_API_URL; const token = process.env.VTCLAND_DRIVER_API_TOKEN
  if (!url || !token) throw new Error('Configuration API chauffeur manquante')
  return { url: url.replace(/\/$/, ''), token }
}
