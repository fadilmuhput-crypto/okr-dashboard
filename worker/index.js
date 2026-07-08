import {
  hashPassword, verifyPassword, newId, newSessionToken,
  sessionCookie, clearSessionCookie, sessionExpiry, sessionMaxAgeSeconds,
  getUserFromRequest, isValidEmail,
} from './auth.js';
import {
  handleListProjects, handleCreateProject, handleUpdateProject, handleDeleteProject,
  handleCreateInvite, handleAcceptInvite, handleListMembers,
} from './projects.js';

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
    { user: { id, email: email.toLowerCase(), name: name || null, plan: 'free' } },
    { headers: { 'Set-Cookie': sessionCookie(token, sessionMaxAgeSeconds()) } }
  );
}

async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');
  const { email, password } = body;
  if (!isValidEmail(email) || typeof password !== 'string') return err('Enter your email and password');

  const user = await env.DB.prepare('SELECT id, email, name, plan, password_hash FROM users WHERE email = ?')
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
    { user: { id: user.id, email: user.email, name: user.name, plan: user.plan } },
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

async function handleGetCheckins(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  // Checkins are visible to every member of the project (scope column holds
  // the project id) — not just the person who originally submitted them,
  // since a shared board's history should be shared too.
  const { results } = await env.DB.prepare(
    `SELECT id, week_number, scope, objective_id, confidence_snapshot, accomplished, challenges, next_priorities, created_at
     FROM checkins WHERE scope IN (SELECT project_id FROM project_members WHERE user_id = ?)
     ORDER BY week_number ASC, created_at ASC`
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

  const member = await env.DB.prepare('SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?')
    .bind(scope, user.id).first();
  if (!member) return err('You are not a member of this project', 403);

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
  'GET /api/checkins': handleGetCheckins,
  'POST /api/checkins': handlePostCheckin,
  'GET /api/projects': (request, env) => withUser(request, env, handleListProjects),
  'POST /api/projects': (request, env) => withUser(request, env, handleCreateProject),
};

// Parameterized routes: [method, regex, handler(request, env, user, ...params)]
const paramRoutes = [
  ['PATCH', /^\/api\/projects\/([^/]+)$/, handleUpdateProject],
  ['DELETE', /^\/api\/projects\/([^/]+)$/, handleDeleteProject],
  ['POST', /^\/api\/projects\/([^/]+)\/invite$/, handleCreateInvite],
  ['GET', /^\/api\/projects\/([^/]+)\/members$/, handleListMembers],
  ['POST', /^\/api\/invites\/([^/]+)\/accept$/, handleAcceptInvite],
];

async function withUser(request, env, handler) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  return handler(request, env, user);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        const key = `${request.method} ${url.pathname}`;
        const handler = routes[key];
        if (handler) return await handler(request, env);

        for (const [method, pattern, paramHandler] of paramRoutes) {
          if (request.method !== method) continue;
          const match = url.pathname.match(pattern);
          if (!match) continue;
          const user = await getUserFromRequest(request, env.DB);
          if (!user) return err('Not signed in', 401);
          return await paramHandler(request, env, user, ...match.slice(1));
        }

        return err('Not found', 404);
      } catch (e) {
        return err(`Internal error: ${e.message}`, 500);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
