// Projects are first-class, shareable rows (see migrations/0002_projects.sql)
// — a project can have multiple members, unlike the old one-user-owns-a-JSON-blob
// model. Free tier limit is enforced here server-side (counted against
// projects the user OWNS, not ones they've merely been invited into).

const FREE_PROJECT_LIMIT = 2;
const MAX_OBJECTIVES = 20;
const MAX_KRS_PER_OBJECTIVE = 5;
const MAX_INITIATIVES_PER_KR = 20;
const MAX_JSON_SIZE_BYTES = 512_000; // 512 KB cap

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}
function err(message, status = 400) {
  return json({ error: message }, { status });
}

// Validate the objectives JSON structure from the client.
// Returns true if valid, or an error string if not.
function validateObjectives(objives) {
  if (!Array.isArray(objives)) return 'objectives must be an array';
  if (objectives.length > MAX_OBJECTIVES) return `Too many objectives (max ${MAX_OBJECTIVES})`;

  for (let i = 0; i < objectives.length; i++) {
    const obj = objectives[i];
    if (!obj || typeof obj !== 'object') return `Objective ${i}: must be an object`;
    if (typeof obj.id !== 'string' || !obj.id) return `Objective ${i}: id is required`;
    if (typeof obj.objective !== 'string') return `Objective ${i}: objective must be a string`;
    if (typeof obj.whyNow !== 'string') return `Objective ${i}: whyNow must be a string`;

    if (!Array.isArray(obj.krs)) return `Objective ${i}: krs must be an array`;
    if (obj.krs.length > MAX_KRS_PER_OBJECTIVE) return `Objective ${i}: max ${MAX_KRS_PER_OBJECTIVE} Key Results`;

    for (let j = 0; j < obj.krs.length; j++) {
      const kr = obj.krs[j];
      if (!kr || typeof kr !== 'object') return `Objective ${i}, KR ${j}: must be an object`;
      if (typeof kr.id !== 'string' || !kr.id) return `Objective ${i}, KR ${j}: id is required`;
      if (typeof kr.label !== 'string') return `Objective ${i}, KR ${j}: label must be a string`;
      if (!['percent', 'deadline'].includes(kr.type)) return `Objective ${i}, KR ${j}: type must be 'percent' or 'deadline'`;
      if (typeof kr.confidence !== 'number' || kr.confidence < 0 || kr.confidence > 1) {
        return `Objective ${i}, KR ${j}: confidence must be 0-1`;
      }
      if (!Array.isArray(kr.initiatives)) return `Objective ${i}, KR ${j}: initiatives must be an array`;
      if (kr.initiatives.length > MAX_INITIATIVES_PER_KR) {
        return `Objective ${i}, KR ${j}: max ${MAX_INITIATIVES_PER_KR} initiatives`;
      }

      for (let k = 0; k < kr.initiatives.length; k++) {
        const ini = kr.initiatives[k];
        if (!ini || typeof ini !== 'object') return `Initiative ${k}: must be an object`;
        if (typeof ini.id !== 'string' || !ini.id) return `Initiative ${k}: id is required`;
        if (typeof ini.title !== 'string') return `Initiative ${k}: title must be a string`;
        if (typeof ini.driver !== 'string') return `Initiative ${k}: driver must be a string`;
        if (!Array.isArray(ini.contributors)) return `Initiative ${k}: contributors must be an array`;
      }
    }
  }
  return true;
}

function inviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 9);
}

const INVITE_EXPIRY_DAYS = 7;
const INVITE_EXPIRY_MS = INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

async function isMember(db, projectId, userId) {
  const row = await db.prepare('SELECT role FROM project_members WHERE project_id = ? AND user_id = ?')
    .bind(projectId, userId).first();
  return row ? row.role : null;
}

function shapeProject(row, role) {
  let objectives;
  try {
    objectives = JSON.parse(row.objectives_json);
  } catch {
    objectives = [];
  }
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    colorIndex: row.color_index,
    objectives,
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
  const type = body.type === 'personal' ? 'personal' : 'team';

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
      `INSERT INTO projects (id, name, type, owner_id, color_index, objectives_json, active_objective_id, week_number, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).bind(id, body.name.trim(), type, user.id, ownedCount.c, JSON.stringify(objectives), objId, now, now),
    env.DB.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)')
      .bind(id, user.id, 'owner', now),
  ]);

  return json({ project: shapeProject({
    id, name: body.name.trim(), type, color_index: ownedCount.c, objectives_json: JSON.stringify(objectives),
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
  if (Array.isArray(body.objectives)) {
    const validation = validateObjectives(body.objectives);
    if (validation !== true) return err(`Invalid objectives: ${validation}`);
    const serialized = JSON.stringify(body.objectives);
    if (serialized.length > MAX_JSON_SIZE_BYTES) return err('Objectives data too large');
    fields.push('objectives_json = ?');
    values.push(serialized);
  }
  if (typeof body.activeObjectiveId === 'string') { fields.push('active_objective_id = ?'); values.push(body.activeObjectiveId); }
  if (Number.isInteger(body.weekNumber)) { fields.push('week_number = ?'); values.push(body.weekNumber); }
  if (typeof body.type === 'string') {
    // Personal -> Team is a one-way, owner-only upgrade — not a generic field.
    if (role !== 'owner' || body.type !== 'team') return err('Cannot change project type this way', 403);
    const current = await env.DB.prepare('SELECT type FROM projects WHERE id = ?').bind(projectId).first();
    if (current.type === 'personal') { fields.push('type = ?'); values.push('team'); }
  }
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
  const project = await env.DB.prepare('SELECT type FROM projects WHERE id = ?').bind(projectId).first();
  if (project.type === 'personal') return err('This project is Personal — upgrade it to Team first to invite people', 403);
  const code = inviteCode();
  const now = Date.now();
  await env.DB.prepare('INSERT INTO project_invites (code, project_id, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(code, projectId, user.id, now, now + INVITE_EXPIRY_MS).run();
  return json({ code });
}

export async function handleAcceptInvite(request, env, user, code) {
  const invite = await env.DB.prepare('SELECT project_id, expires_at FROM project_invites WHERE code = ?').bind(code).first();
  if (!invite) return err('Invite link is invalid or has expired', 404);
  if (invite.expires_at && Date.now() > invite.expires_at) {
    return err('This invite link has expired. Ask the project owner to generate a new one.', 410);
  }

  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(invite.project_id).first();
  if (!project) return err('This project no longer exists', 404);

  const existing = await isMember(env.DB, invite.project_id, user.id);
  if (!existing) {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)')
        .bind(invite.project_id, user.id, 'member', Date.now()),
      env.DB.prepare('UPDATE project_invites SET accepted_by = ? WHERE code = ?')
        .bind(user.id, code),
    ]);
  }

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
