// Hand-rolled auth: PBKDF2 password hashing + random session tokens.
// Chosen over Better Auth for P0 — fewer moving parts to verify correctly
// in the Workers runtime, no adapter/version risk, and the schema is small
// enough that owning it directly is simpler than wiring an adapter.

const PBKDF2_ITERATIONS = 100000;
const SESSION_DAYS = 30;

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return `${bufToHex(salt)}:${bufToHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = hexToBuf(saltHex);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }, key, 256);
  return bufToHex(bits) === hashHex;
}

export function newId() {
  return crypto.randomUUID();
}

export function newSessionToken() {
  return bufToHex(crypto.getRandomValues(new Uint8Array(32)));
}

export function sessionCookie(token, maxAgeSeconds) {
  const parts = [
    `session=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  return parts.join('; ');
}

export function clearSessionCookie() {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

export function sessionExpiry() {
  return Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
}

export function sessionMaxAgeSeconds() {
  return SESSION_DAYS * 24 * 60 * 60;
}

function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getUserFromRequest(request, db) {
  const token = getCookie(request, 'session');
  if (!token) return null;
  const row = await db
    .prepare('SELECT users.id, users.email, users.name, users.plan FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token = ? AND sessions.expires_at > ?')
    .bind(token, Date.now())
    .first();
  return row || null;
}

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
