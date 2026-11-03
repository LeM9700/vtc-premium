import { NextRequest, NextResponse } from 'next/server'
import { clearDriverSession, createDriverSession, validPassword } from '@/lib/driverAuth'

export async function POST(request: NextRequest) {
  const body = await request.json() as { password?: string }
  if (!body.password || !validPassword(body.password)) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }
  await createDriverSession(); return NextResponse.json({ ok: true })
}

export async function DELETE() {
  await clearDriverSession(); return NextResponse.json({ ok: true })
}
