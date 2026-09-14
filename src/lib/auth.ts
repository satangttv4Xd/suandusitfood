import { addUser, findUserByUsername, getDatabase, uid, updateUserPassword } from './db'
import type { User } from './types'

/**
 * Admin authentication.
 *
 * Passwords are never stored in the clear: each account keeps a random salt and
 * a PBKDF2-SHA256 derivation of the password, and comparison happens over the
 * derived bytes. Sessions live in sessionStorage, so closing the tab ends them
 * the way a server-side session cookie would.
 *
 * What a client-only build genuinely cannot do: keep an attacker with access to
 * the browser's devtools out of the data. Treat this as coursework-grade auth —
 * `README.md` explains what moving to a real server would change.
 */

const SESSION_KEY = 'sdfg.session.v1'
const CSRF_KEY = 'sdfg.csrf.v1'
const THROTTLE_KEY = 'sdfg.login-throttle.v1'

const PBKDF2_ITERATIONS = 150_000
const SESSION_HOURS = 8
const MAX_ATTEMPTS = 8
const LOCKOUT_MINUTES = 10

export const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' } as const

export interface Session {
  userId: string
  username: string
  displayName: string
  expiresAt: number
}

// ------------------------------------------------------------------ hashing

const toBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

export function randomSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toBase64(bytes.buffer)
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256,
  )
  return toBase64(bits)
}

/** Length-independent comparison so a wrong guess costs the same time as a right one. */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function verifyPassword(password: string, user: User): Promise<boolean> {
  const hash = await hashPassword(password, user.salt)
  return constantTimeEquals(hash, user.passwordHash)
}

// ------------------------------------------------------------ account setup

/** Create the starter admin the first time the app runs. */
export async function ensureDefaultAdmin(): Promise<void> {
  if (getDatabase().users.length > 0) return
  const salt = randomSalt()
  addUser({
    id: uid('user'),
    username: DEFAULT_ADMIN.username,
    displayName: 'ผู้ดูแลระบบ',
    passwordHash: await hashPassword(DEFAULT_ADMIN.password, salt),
    salt,
    role: 'admin',
    createdAt: new Date().toISOString(),
  })
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  nextPassword: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = getDatabase().users.find((candidate) => candidate.id === userId)
  if (!user) return { ok: false, error: 'ไม่พบบัญชีผู้ใช้' }
  if (!(await verifyPassword(currentPassword, user))) {
    return { ok: false, error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }
  }
  if (nextPassword.length < 8) {
    return { ok: false, error: 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร' }
  }
  const salt = randomSalt()
  updateUserPassword(userId, await hashPassword(nextPassword, salt), salt)
  return { ok: true }
}

// ----------------------------------------------------------------- sessions

const sessionListeners = new Set<() => void>()

function publishSession() {
  sessionListeners.forEach((listener) => listener())
}

export function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}

let sessionCache: Session | null | undefined

export function getSession(): Session | null {
  if (sessionCache !== undefined) return sessionCache
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return (sessionCache = null)
    const session = JSON.parse(raw) as Session
    if (!session.expiresAt || session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY)
      return (sessionCache = null)
    }
    return (sessionCache = session)
  } catch {
    return (sessionCache = null)
  }
}

function setSession(session: Session | null) {
  sessionCache = session
  try {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
      sessionStorage.setItem(CSRF_KEY, randomSalt())
    } else {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(CSRF_KEY)
    }
  } catch {
    /* storage unavailable — the in-memory session still works for this tab */
  }
  publishSession()
}

// ------------------------------------------------------------ login attempts

interface Throttle {
  attempts: number
  lockedUntil: number
}

function readThrottle(): Throttle {
  try {
    return JSON.parse(localStorage.getItem(THROTTLE_KEY) ?? '') as Throttle
  } catch {
    return { attempts: 0, lockedUntil: 0 }
  }
}

function writeThrottle(throttle: Throttle) {
  try {
    localStorage.setItem(THROTTLE_KEY, JSON.stringify(throttle))
  } catch {
    /* ignore */
  }
}

export function lockoutSecondsLeft(): number {
  const { lockedUntil } = readThrottle()
  return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
}

export type LoginResult = { ok: true; session: Session } | { ok: false; error: string }

export async function login(username: string, password: string): Promise<LoginResult> {
  const throttle = readThrottle()
  if (throttle.lockedUntil > Date.now()) {
    const minutes = Math.ceil((throttle.lockedUntil - Date.now()) / 60000)
    return { ok: false, error: `พยายามเข้าสู่ระบบผิดหลายครั้ง กรุณารออีก ${minutes} นาที` }
  }

  const user = findUserByUsername(username)
  // Hash even when the username is unknown, so a missing account and a wrong
  // password take the same amount of time to answer.
  const ok = user
    ? await verifyPassword(password, user)
    : (await hashPassword(password, 'decoy-salt'), false)

  if (!ok || !user) {
    const attempts = throttle.attempts + 1
    writeThrottle({
      attempts,
      lockedUntil: attempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MINUTES * 60_000 : 0,
    })
    const left = MAX_ATTEMPTS - attempts
    return {
      ok: false,
      error:
        left > 0
          ? `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (เหลืออีก ${left} ครั้ง)`
          : `พยายามเข้าสู่ระบบผิดหลายครั้ง ระบบล็อกชั่วคราว ${LOCKOUT_MINUTES} นาที`,
    }
  }

  writeThrottle({ attempts: 0, lockedUntil: 0 })
  const session: Session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  }
  setSession(session)
  return { ok: true, session }
}

export function logout() {
  setSession(null)
}

// --------------------------------------------------------------------- CSRF

/**
 * A per-session token that every admin form echoes back on submit.
 *
 * With no server there is no cross-site POST to forge, so this is defence in
 * depth rather than the whole defence: it makes a stale or replayed form
 * (an old tab whose session has since been replaced) fail loudly instead of
 * writing to the store, and it keeps the form contract identical to the
 * server-rendered version described in `database/database.sql`.
 */
export function getCsrfToken(): string {
  try {
    let token = sessionStorage.getItem(CSRF_KEY)
    if (!token) {
      token = randomSalt()
      sessionStorage.setItem(CSRF_KEY, token)
    }
    return token
  } catch {
    return 'no-storage'
  }
}

export function verifyCsrfToken(token: string): boolean {
  return constantTimeEquals(token, getCsrfToken())
}
