import {
  hashPassword, verifyPassword, newId, newSessionToken,
  sessionCookie, clearSessionCookie, sessionExpiry, sessionMaxAgeSeconds,
  getUserFromRequest, isValidEmail,
} from './auth.js';

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

function err(message, status = 400) {
  return json({ error: message }, { status });
}

async function handleRegister(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');
  const { email, password, name } = body;
  if (!isValidEmail(email)) return err('Enter a valid email address');
  if (typeof password !== 'string' || password.length < 8) return err('Password must be at least 8 characters');

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase()).first();
  if (existing) return err('An account with this email already exists', 409);

  const id = newId();
  const passwordHash = await hashPassword(password);
  await env.DB.prepare('INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(id, email.toLowerCase(), passwordHash, name || null, Date.now())
    .run();

  const token = newSessionToken();
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(token, id, sessionExpiry(), Date.now())
    .run();

  return json(
    { user: { id, email: email.toLowerCase(), name: name || null } },
    { headers: { 'Set-Cookie': sessionCookie(token, sessionMaxAgeSeconds()) } }
  );
}

async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');
  const { email, password } = body;
  if (!isValidEmail(email) || typeof password !== 'string') return err('Enter your email and password');

  const user = await env.DB.prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?')
    .bind(email.toLowerCase())
    .first();
  if (!user) return err('Incorrect email or password', 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return err('Incorrect email or password', 401);

  const token = newSessionToken();
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(token, user.id, sessionExpiry(), Date.now())
    .run();

  return json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { headers: { 'Set-Cookie': sessionCookie(token, sessionMaxAgeSeconds()) } }
  );
}

async function handleLogout(request, env) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(/(?:^|;\s*)session=([^;]+)/);
  if (match) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(match[1]).run();
  }
  return json({ ok: true }, { headers: { 'Set-Cookie': clearSessionCookie() } });
}

async function handleMe(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  return json({ user });
}

async function handleGetState(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const row = await env.DB.prepare('SELECT state_json, updated_at FROM okr_state WHERE user_id = ?').bind(user.id).first();
  if (!row) return json({ state: null, updatedAt: null });
  return json({ state: JSON.parse(row.state_json), updatedAt: row.updated_at });
}

async function handlePutState(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.state !== 'object') return err('Missing state');

  const stateJson = JSON.stringify(body.state);
  if (stateJson.length > 1_000_000) return err('State too large', 413);

  await env.DB.prepare(
    `INSERT INTO okr_state (user_id, state_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`
  ).bind(user.id, stateJson, Date.now()).run();

  return json({ ok: true });
}

async function handleGetCheckins(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const { results } = await env.DB.prepare(
    'SELECT id, week_number, scope, objective_id, confidence_snapshot, accomplished, challenges, next_priorities, created_at FROM checkins WHERE user_id = ? ORDER BY week_number ASC, created_at ASC'
  ).bind(user.id).all();
  const checkins = results.map((r) => ({
    id: r.id,
    weekNumber: r.week_number,
    scope: r.scope,
    objectiveId: r.objective_id,
    confidenceSnapshot: JSON.parse(r.confidence_snapshot),
    accomplished: r.accomplished,
    challenges: r.challenges,
    nextPriorities: r.next_priorities,
    createdAt: r.created_at,
  }));
  return json({ checkins });
}

async function handlePostCheckin(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');
  const { weekNumber, scope, objectiveId, confidenceSnapshot, accomplished, challenges, nextPriorities } = body;
  if (!Number.isInteger(weekNumber) || !scope || !objectiveId || typeof confidenceSnapshot !== 'object') {
    return err('Missing required check-in fields');
  }

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO checkins (id, user_id, week_number, scope, objective_id, confidence_snapshot, accomplished, challenges, next_priorities, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.id, weekNumber, scope, objectiveId,
    JSON.stringify(confidenceSnapshot),
    accomplished || null, challenges || null, nextPriorities || null,
    Date.now()
  ).run();

  return json({ id, ok: true });
}

const routes = {
  'POST /api/auth/register': handleRegister,
  'POST /api/auth/login': handleLogin,
  'POST /api/auth/logout': handleLogout,
  'GET /api/auth/me': handleMe,
  'GET /api/state': handleGetState,
  'PUT /api/state': handlePutState,
  'GET /api/checkins': handleGetCheckins,
  'POST /api/checkins': handlePostCheckin,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      const key = `${request.method} ${url.pathname}`;
      const handler = routes[key];
      if (!handler) return err('Not found', 404);
      try {
        return await handler(request, env);
      } catch (e) {
        return err(`Internal error: ${e.message}`, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
