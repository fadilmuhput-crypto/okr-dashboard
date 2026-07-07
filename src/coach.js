// Goal Coach v0 — rule-based, no LLM. Pure functions over data already in
// memory (state + checkins), so this costs nothing and needs no API call.
// Layering an LLM on top later (P3) means writing better sentences around
// these same signals, not re-deriving them.

export const QUARTER_WEEKS = 13;

const calcKRProgress = (kr) => {
  if (kr.type === 'deadline') {
    const c = Number(kr.current);
    return Number.isFinite(c) ? Math.max(0, Math.min(100, c)) : 0;
  }
  const baseline = Number(kr.baseline), target = Number(kr.target), current = Number(kr.current);
  if (!Number.isFinite(baseline) || !Number.isFinite(target) || !Number.isFinite(current)) return 0;
  if (baseline === target) return current >= target ? 100 : 0;
  const raw = target > baseline
    ? ((current - baseline) / (target - baseline)) * 100
    : ((baseline - current) / (baseline - target)) * 100;
  return raw;
};

/**
 * @param {object} objective - { id, objective, krs }
 * @param {Array} krs - objective.krs (passed separately since caller already has it)
 * @param {Array} checkins - full checkins list for the user (all objectives)
 * @param {number} weekNumber - current week (1-13)
 * @returns {Array<{severity: 'warning'|'info'|'success', message: string}>}
 */
export function computeCoachInsights(objective, krs, checkins, weekNumber) {
  if (!objective || krs.length === 0) return [];

  const insights = [];
  const objectiveCheckins = (checkins || [])
    .filter((c) => c.objectiveId === objective.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  // Rule A — behind pace: expected linear progress by this week vs actual.
  krs.forEach((kr) => {
    if (kr.type !== 'percent') return;
    const expectedPct = (weekNumber / QUARTER_WEEKS) * 100;
    const actualPct = calcKRProgress(kr);
    if (expectedPct - actualPct >= 20 && weekNumber >= 2) {
      insights.push({
        severity: 'warning',
        message: `"${kr.label}" is behind pace — by Week ${weekNumber} you'd expect ~${Math.round(expectedPct)}% progress, but you're at ${Math.round(actualPct)}%.`,
      });
    }
  });

  // Rule B — confidence dropping across the last two check-ins for a KR.
  if (objectiveCheckins.length >= 2) {
    const [prev, latest] = objectiveCheckins.slice(-2);
    krs.forEach((kr) => {
      const prevConf = prev.confidenceSnapshot?.[kr.id];
      const latestConf = latest.confidenceSnapshot?.[kr.id];
      if (typeof prevConf === 'number' && typeof latestConf === 'number' && prevConf - latestConf >= 0.15) {
        insights.push({
          severity: 'warning',
          message: `Confidence for "${kr.label}" dropped from ${prevConf.toFixed(2)} to ${latestConf.toFixed(2)} over your last two check-ins.`,
        });
      }
    });
  }

  // Rule C — no recent check-in logged (momentum / staleness signal).
  if (objectiveCheckins.length > 0) {
    const lastWeek = objectiveCheckins[objectiveCheckins.length - 1].weekNumber;
    const gap = weekNumber - lastWeek;
    if (gap >= 2) {
      insights.push({
        severity: 'warning',
        message: `No check-in logged for ${gap} weeks — last one was Week ${lastWeek}. Momentum may be slipping.`,
      });
    }
  } else if (weekNumber >= 2) {
    insights.push({
      severity: 'info',
      message: `You haven't completed a Weekly Check-in yet this quarter — do one to start tracking your progress over time.`,
    });
  }

  // Rule D — near quarter end with a still-low-confidence KR.
  const weeksLeft = QUARTER_WEEKS - weekNumber;
  if (weeksLeft <= 3 && weeksLeft >= 0) {
    krs.forEach((kr) => {
      if (kr.confidence < 0.5) {
        insights.push({
          severity: 'warning',
          message: `Only ${weeksLeft} week${weeksLeft === 1 ? '' : 's'} left this quarter and "${kr.label}" confidence is still ${kr.confidence.toFixed(2)} — consider re-scoping or focusing effort here.`,
        });
      }
    });
  }

  // Rule E — positive reinforcement when everything's healthy.
  if (insights.length === 0 && krs.every((k) => k.confidence >= 0.7)) {
    insights.push({
      severity: 'success',
      message: `Everything on this objective is tracking well — keep the pace.`,
    });
  }

  return insights;
}
