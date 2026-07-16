// Pure helper functions shared across the app.
// Eliminates duplication of calcKRProgress, confColor, confLabel,
// timeliness, fmtDate, and newId across multiple files.

import { useState, useEffect } from 'react';
import { MONTHS } from './theme.js';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
};

export const QUARTER_WEEKS = 13;

export const calcKRProgress = (kr) => {
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

export const confColor = (c) => {
  if (c >= 0.7) return '#1E8449'; // green
  if (c >= 0.5) return '#D68910'; // yellow
  return '#C0392B';               // red
};

export const confLabel = (c) => {
  if (c >= 0.7) return 'On Track';
  if (c >= 0.5) return 'Watch';
  return 'At Risk';
};

export const confEmoji = (c) => {
  if (c >= 0.7) return '🟢';
  if (c >= 0.5) return '🟡';
  return '🔴';
};

export const timeliness = (ini) => {
  if (ini.status === 'done' || ini.status === 'cancelled') return null;
  if (!ini.endDate) return null;
  const end = new Date(ini.endDate + 'T00:00:00');
  if (isNaN(end.getTime())) return null;
  return end < new Date() ? 'delayed' : 'on_track';
};

export const fmtDate = (d) => {
  if (!d) return null;
  const dt = new Date(d + 'T00:00:00');
  if (isNaN(dt.getTime())) return null;
  return `${MONTHS[dt.getMonth()]} ${dt.getDate()}`;
};

export const newId = (prefix, items) => {
  const nums = items.map(it => parseInt(String(it.id).replace(prefix, ''), 10)).filter(n => !isNaN(n));
  return prefix + (Math.max(0, ...nums) + 1);
};
