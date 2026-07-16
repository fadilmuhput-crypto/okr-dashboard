import React, { memo, useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Circle, PauseCircle, Flag, Users, ArrowRight } from 'lucide-react';
import { C, STATUS_META } from '../theme.js';
import { timeliness, fmtDate, calcKRProgress, confColor } from '../utils.js';

function InitiativeItem({ ini, kr, onJump }) {
  const isDone = ini.status === 'done';
  const isCancelled = ini.status === 'cancelled';
  const t = timeliness(ini);
  const isDelayed = t === 'delayed';
  const statusMeta = STATUS_META[ini.status];
  const StatusIcon = statusMeta?.icon || Circle;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: isDone || isCancelled ? C.bg : C.white, border: `1px solid ${C.border}`, borderRadius: 8, opacity: isDone || isCancelled ? 0.6 : 1 }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, background: statusMeta?.bg || C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <StatusIcon size={11} color={statusMeta?.color || C.muted} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text, textDecoration: isDone ? 'line-through' : 'none' }}>{ini.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Flag size={9} color={C.primary} /> {ini.driver}
          </span>
          {ini.contributors.length > 0 && (
            <span style={{ fontSize: 10.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              <Users size={9} color={C.secondary} /> {ini.contributors.join(', ')}
            </span>
          )}
          {(ini.startDate || ini.endDate) && (
            <span style={{ fontSize: 10.5, color: C.muted }}>
              {fmtDate(ini.startDate) || '?'} – {fmtDate(ini.endDate) || '?'}
            </span>
          )}
        </div>
      </div>
      {isDelayed && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 12, background: C.redSoft, color: C.red, textTransform: 'uppercase', flexShrink: 0 }}>
          <Clock size={9} /> Delayed
        </span>
      )}
    </div>
  );
}

const WeeklyPlanner = memo(function WeeklyPlanner({ krs, weekNumber, onJump }) {
  const sections = useMemo(() => {
    const allInitiatives = [];

    for (const kr of krs) {
      for (const ini of kr.initiatives) {
        if (ini.status === 'done' || ini.status === 'cancelled') continue;
        allInitiatives.push({ ini, kr });
      }
    }

    const delayed = allInitiatives.filter(({ ini }) => timeliness(ini) === 'delayed');
    const active = allInitiatives.filter(({ ini }) => ini.status === 'in_progress');
    const todo = allInitiatives.filter(({ ini }) => ini.status === 'todo');
    const hold = allInitiatives.filter(({ ini }) => ini.status === 'hold');

    return { delayed, active, todo, hold, total: allInitiatives.length };
  }, [krs]);

  const Section = ({ title, items, icon: Icon, color, bgColor }) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: bgColor, padding: '1px 6px', borderRadius: 8 }}>
            {items.length}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map(({ ini, kr }) => (
            <InitiativeItem key={ini.id} ini={ini} kr={kr} />
          ))}
        </div>
      </div>
    );
  };

  if (sections.total === 0) {
    return (
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '32px 20px', textAlign: 'center' }}>
        <CheckCircle2 size={28} color={C.green} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>All clear for this week!</div>
        <div style={{ fontSize: 12.5, color: C.muted }}>No active initiatives to work on. Add initiatives to your Key Results to start planning.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>Week {weekNumber} Focus</div>
        <div style={{ fontSize: 12, color: C.muted }}>
          {sections.delayed.length > 0 && <span style={{ color: C.red, fontWeight: 600 }}>{sections.delayed.length} delayed</span>}
          {sections.delayed.length > 0 && sections.active.length > 0 && ' · '}
          {sections.active.length} in progress · {sections.todo.length} to do
          {sections.hold.length > 0 && ` · ${sections.hold.length} on hold`}
        </div>
      </div>

      <Section title="Delayed — Needs Attention" items={sections.delayed} icon={AlertTriangle} color={C.red} bgColor={C.redSoft} />
      <Section title="In Progress" items={sections.active} icon={Clock} color={C.secondary} bgColor={C.blueSoft} />
      <Section title="To Do" items={sections.todo} icon={Circle} color={C.muted} bgColor={C.grayPill} />
      <Section title="On Hold" items={sections.hold} icon={PauseCircle} color={C.yellow} bgColor={C.yellowSoft} />
    </div>
  );
});

export default WeeklyPlanner;
