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

// ── Security headers middleware ──
function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // CSP: allow inline scripts (needed for Vite dev & GA4), connect to self + Google Analytics
  headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
  ].join('; '));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Rate limiter — in-memory sliding window per IP ──
// Works within a single Worker isolate. Not distributed across
// Workers' edge locations, but sufficient to slow down brute-force
// from a single origin. For stronger protection, add Cloudflare
// Rate Limiting rules at the DNS level.
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;
const RATE_LIMIT_CLEANUP_INTERVAL = 60 * 1000; // cleanup every 60s
let lastCleanup = Date.now();

function getClientIp(request) {
  return request.headers.get('CF-Connecting-IP')
    || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim()
    || 'unknown';
}

function isRateLimited(ip, action) {
  const key = `${ip}:${action}`;
  const now = Date.now();

  // Periodic cleanup of expired entries
  if (now - lastCleanup > RATE_LIMIT_CLEANUP_INTERVAL) {
    for (const [k, v] of rateLimitStore) {
      if (now - v.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(k);
    }
    lastCleanup = now;
  }

  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { windowStart: now, attempts: 1 });
    return false;
  }
  entry.attempts++;
  return entry.attempts > RATE_LIMIT_MAX_ATTEMPTS;
}

async function handleRegister(request, env) {
  const ip = getClientIp(request);
  if (isRateLimited(ip, 'register')) {
    return err('Too many registration attempts. Try again later.', 429);
  }

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
  const ip = getClientIp(request);
  if (isRateLimited(ip, 'login')) {
    return err('Too many login attempts. Try again later.', 429);
  }

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
  const checkins = results.map((r) => {
    let confidenceSnapshot;
    try {
      confidenceSnapshot = JSON.parse(r.confidence_snapshot);
    } catch {
      confidenceSnapshot = {};
    }
    return {
      id: r.id,
      weekNumber: r.week_number,
      scope: r.scope,
      objectiveId: r.objective_id,
      confidenceSnapshot,
      accomplished: r.accomplished,
      challenges: r.challenges,
      nextPriorities: r.next_priorities,
      createdAt: r.created_at,
    };
  });
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

  // Validate text field lengths to prevent DB bloat
  const MAX_TEXT_LENGTH = 5000;
  for (const [name, val] of [['accomplished', accomplished], ['challenges', challenges], ['nextPriorities', nextPriorities]]) {
    if (typeof val === 'string' && val.length > MAX_TEXT_LENGTH) {
      return err(`${name} is too long (max ${MAX_TEXT_LENGTH} characters)`);
    }
  }

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO checkins (id, user_id, week_number, scope, objective_id, confidence_snapshot, accomplished, challenges, next_priorities, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, user.id, weekNumber, scope, objectiveId,
    JSON.stringify(confidenceSnapshot),
    (accomplished || '').slice(0, MAX_TEXT_LENGTH) || null,
    (challenges || '').slice(0, MAX_TEXT_LENGTH) || null,
    (nextPriorities || '').slice(0, MAX_TEXT_LENGTH) || null,
    Date.now()
  ).run();

  return json({ id, ok: true });
}

async function handleGenerateOKR(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.goal !== 'string' || body.goal.trim().length < 5) {
    return err('Please provide a goal description (at least 5 characters)');
  }

  const goal = body.goal.trim();
  const prompt = `You are an OKR coach. Convert this raw goal into a structured OKR.

Goal: "${goal}"

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "objective": "A clear, inspiring objective statement (1-2 sentences)",
  "whyNow": "Why this matters this quarter specifically (1 sentence)",
  "krs": [
    {
      "label": "Measurable key result",
      "type": "percent",
      "baseline": 0,
      "target": 100,
      "current": 0,
      "unit": "appropriate unit"
    }
  ]
}

Rules:
- Create 2-3 Key Results, each measurable with a clear unit
- Use "percent" type for all KRs (baseline → target progression)
- Keep language concise and action-oriented
- The objective should be aspirational, not a task
- Each KR should have a realistic baseline and ambitious but achievable target`;

  try {
    const aiResult = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = aiResult.response || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return err('AI could not generate a valid OKR. Please try again.');
    }

    const okr = JSON.parse(jsonMatch[0]);
    if (!okr.objective || !Array.isArray(okr.krs) || okr.krs.length === 0) {
      return err('AI response was incomplete. Please try again.');
    }

    return json({ okr });
  } catch (e) {
    return err(`AI generation failed: ${e.message}`);
  }
}

async function handleUpdateReminderPref(request, env) {
  const user = await getUserFromRequest(request, env.DB);
  if (!user) return err('Not signed in', 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.enabled !== 'boolean') {
    return err('Missing enabled field');
  }
  await env.DB.prepare('UPDATE users SET email_reminder_enabled = ? WHERE id = ?')
    .bind(body.enabled ? 1 : 0, user.id).run();
  return json({ ok: true, enabled: body.enabled });
}

const routes = {
  'POST /api/auth/register': handleRegister,
  'POST /api/auth/login': handleLogin,
  'POST /api/auth/logout': handleLogout,
  'GET /api/auth/me': handleMe,
  'GET /api/checkins': handleGetCheckins,
  'POST /api/checkins': handlePostCheckin,
  'POST /api/ai/generate-okr': handleGenerateOKR,
  'PATCH /api/user/reminder': handleUpdateReminderPref,
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

async function sendReminderEmail(env, to, name) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[Email] RESEND_API_KEY not set, skipping email');
    return;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="width: 48px; height: 48px; background: #E72D33; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <span style="font-size: 24px; color: white;">🎯</span>
        </div>
        <h1 style="font-size: 20px; font-weight: 800; color: #1F1F1F; margin: 0;">Weekly OKR Check-in Reminder</h1>
      </div>
      <p style="font-size: 14px; color: #7A7A7A; line-height: 1.6; margin: 0 0 20px;">
        Hi ${name || 'there'}, it's Monday again! Time for your weekly confidence check-in.
      </p>
      <p style="font-size: 14px; color: #7A7A7A; line-height: 1.6; margin: 0 0 24px;">
        Take 2 minutes to answer one honest question per Key Result: <strong style="color: #1F1F1F;">how confident are you that you'll reach this goal?</strong>
      </p>
      <div style="text-align: center;">
        <a href="https://owntheway.my.id/app" style="display: inline-block; padding: 12px 24px; background: #E72D33; color: white; font-weight: 700; font-size: 14px; border-radius: 8px; text-decoration: none;">
          Do Weekly Check-in →
        </a>
      </div>
      <p style="font-size: 12px; color: #7A7A7A; margin: 24px 0 0; text-align: center;">
        Confidence tracking is what makes OKR Board different from spreadsheets. Don't skip it!
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OTW <onboarding@owntheway.my.id>',
        to: [to],
        subject: '🎯 Weekly OKR Check-in Reminder',
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Email] Failed to send:', err);
    }
  } catch (e) {
    console.error('[Email] Error:', e.message);
  }
}

async function handleWeeklyReminders(env) {
  console.log('[Cron] Running weekly reminder check...');

  const { results: users } = await env.DB.prepare(
    `SELECT id, email, name, email_reminder_enabled FROM users WHERE email_reminder_enabled = 1`
  ).all();

  console.log(`[Cron] Found ${users.length} users with reminders enabled`);

  for (const user of users) {
    const { results: projects } = await env.DB.prepare(
      `SELECT project_id FROM project_members WHERE user_id = ?`
    ).bind(user.id).all();

    for (const { project_id } of projects) {
      const latestCheckin = await env.DB.prepare(
        `SELECT week_number FROM checkins WHERE scope = ? AND user_id = ? ORDER BY week_number DESC LIMIT 1`
      ).bind(project_id, user.id).first();

      const currentWeek = 1;
      if (!latestCheckin || latestCheckin.week_number < currentWeek) {
        await sendReminderEmail(env, user.email, user.name);
        break;
      }
    }
  }

  console.log('[Cron] Weekly reminders complete');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        const key = `${request.method} ${url.pathname}`;
        const handler = routes[key];
        if (handler) return withSecurityHeaders(await handler(request, env));

        for (const [method, pattern, paramHandler] of paramRoutes) {
          if (request.method !== method) continue;
          const match = url.pathname.match(pattern);
          if (!match) continue;
          const user = await getUserFromRequest(request, env.DB);
          if (!user) return err('Not signed in', 401);
          return withSecurityHeaders(await paramHandler(request, env, user, ...match.slice(1)));
        }

        return withSecurityHeaders(err('Not found', 404));
      } catch (e) {
        return withSecurityHeaders(err(`Internal error: ${e.message}`, 500));
      }
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },

  async scheduled(event, env) {
    await handleWeeklyReminders(env);
  },
};
