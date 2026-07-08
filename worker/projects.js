// Projects are first-class, shareable rows (see migrations/0002_projects.sql)
// — a project can have multiple members, unlike the old one-user-owns-a-JSON-blob
// model. Free tier limit is enforced here server-side (counted against
// projects the user OWNS, not ones they've merely been invited into).

const FREE_PROJECT_LIMIT = 2;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}
function err(message, status = 400) {
  return json({ error: message }, { status });
}

function inviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 9);
}

async function isMember(db, projectId, userId) {
  const row = await db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .bind(projectId, userId).first();
  return row ? row.role : null;
}

function shapeProject(row, role) {
  return {
    id: row.id,
    name: row.name,
    colorIndex: row.color_index,
    objectives: JSON.parse(row.objectives_json),
    activeObjectiveId: row.active_objective_id,
    weekNumber: row.week_number,
    role,
    updatedAt: row.updated_at,
  };
}

export async function handleListProjects(request, env, user) {
  const { results } = await env.DB.prepare(
    `SELECT projects.*, project_members.role FROM projects
     JOIN project_members ON project_members.project_id = projects.id
     WHERE project_members.user_id = ?
     ORDER BY projects.created_at ASC`
  ).bind(user.id).all();
  return json({ projects: results.map((r) => shapeProject(r, r.role)) });
}

export async function handleCreateProject(request, env, user) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== 'string' || !body.name.trim()) return err('Project needs a name');

  const ownedCount = await env.DB.prepare('SELECT COUNT(*) as c FROM projects WHERE owner_id = ?').bind(user.id).first();
  if (user.plan === 'free' && ownedCount.c >= FREE_PROJECT_LIMIT) {
    return err(`Free plan is limited to ${FREE_PROJECT_LIMIT} projects. Upgrade to Pro for unlimited projects.`, 403);
  }

  const id = `proj_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const objId = `${id}o1`;
  const objectives = [{ id: objId, objective: '', whyNow: '', krs: [] }];
  const now = Date.now();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO projects (id, name, owner_id, color_index, objectives_json, active_objective_id, week_number, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).bind(id, body.name.trim(), user.id, ownedCount.c, JSON.stringify(objectives), objId, now, now),
    env.DB.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)')
      .bind(id, user.id, 'owner', now),
  ]);

  return json({ project: shapeProject({
    id, name: body.name.trim(), color_index: ownedCount.c, objectives_json: JSON.stringify(objectives),
    active_objective_id: objId, week_number: 1, updated_at: now,
  }, 'owner') });
}

export async function handleUpdateProject(request, env, user, projectId) {
  const role = await isMember(env.DB, projectId, user.id);
  if (!role) return err('Not found', 404);

  const body = await request.json().catch(() => null);
  if (!body) return err('Invalid JSON body');

  const fields = [];
  const values = [];
  if (typeof body.name === 'string' && body.name.trim()) { fields.push('name = ?'); values.push(body.name.trim()); }
  if (Array.isArray(body.objectives)) { fields.push('objectives_json = ?'); values.push(JSON.stringify(body.objectives)); }
  if (typeof body.activeObjectiveId === 'string') { fields.push('active_objective_id = ?'); values.push(body.activeObjectiveId); }
  if (Number.isInteger(body.weekNumber)) { fields.push('week_number = ?'); values.push(body.weekNumber); }
  if (fields.length === 0) return err('Nothing to update');

  fields.push('updated_at = ?');
  values.push(Date.now());
  values.push(projectId);

  await env.DB.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();
  return json({ ok: true });
}

export async function handleDeleteProject(request, env, user, projectId) {
  const role = await isMember(env.DB, projectId, user.id);
  if (role !== 'owner') return err('Only the owner can delete this project', 403);
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();
  return json({ ok: true });
}

export async function handleCreateInvite(request, env, user, projectId) {
  const role = await isMember(env.DB, projectId, user.id);
  if (role !== 'owner') return err('Only the owner can invite people to this project', 403);
  const code = inviteCode();
  await env.DB.prepare('INSERT INTO project_invites (code, project_id, created_by, created_at) VALUES (?, ?, ?, ?)')
    .bind(code, projectId, user.id, Date.now()).run();
  return json({ code });
}

export async function handleAcceptInvite(request, env, user, code) {
  const invite = await env.DB.prepare('SELECT project_id FROM project_invites WHERE code = ?').bind(code).first();
  if (!invite) return err('Invite link is invalid or has expired', 404);

  const existing = await isMember(env.DB, invite.project_id, user.id);
  if (!existing) {
    await env.DB.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)')
      .bind(invite.project_id, user.id, 'member', Date.now()).run();
  }

  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(invite.project_id).first();
  return json({ project: shapeProject(project, existing || 'member') });
}

export async function handleListMembers(request, env, user, projectId) {
  const role = await isMember(env.DB, projectId, user.id);
  if (!role) return err('Not found', 404);
  const { results } = await env.DB.prepare(
    `SELECT users.id, users.name, users.email, project_members.role FROM project_members
     JOIN users ON users.id = project_members.user_id
     WHERE project_members.project_id = ?`
  ).bind(projectId).all();
  return json({ members: results });
}
