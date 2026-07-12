// Shared color palette & design tokens — single source of truth.
// Imported by every component; eliminates the 6-way copy-paste of `C`.

export const C = {
  primary: '#E72D33',
  secondary: '#2E4DA0',
  green: '#1E8449',
  yellow: '#D68910',
  red: '#C0392B',
  text: '#1F1F1F',
  muted: '#7A7A7A',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  greenSoft: '#EAF5EE',
  yellowSoft: '#FDF6E3',
  redSoft: '#FBEAEA',
  blueSoft: '#E8F0FE',
  grayPill: '#EDEDED',
};

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const CURRENT_YEAR = new Date().getFullYear();

export const STATUS_META = {
  todo:        { label: 'To Do',       color: C.muted,     bg: C.grayPill,   icon: 'Circle' },
  in_progress: { label: 'In Progress', color: C.secondary,  bg: C.blueSoft,   icon: 'PauseCircle' },
  hold:        { label: 'On Hold',     color: C.yellow,     bg: C.yellowSoft, icon: 'PauseOctagon' },
  cancelled:   { label: 'Cancelled',   color: C.muted,      bg: C.grayPill,   icon: 'XCircle' },
  done:        { label: 'Done',        color: C.green,      bg: C.greenSoft,  icon: 'CheckCircle2' },
};
export const STATUS_ORDER = ['todo', 'in_progress', 'hold', 'cancelled', 'done'];

export const PROJECT_COLORS = [C.primary, C.secondary, '#7C3AED', '#059669', '#D97706', '#DB2777'];
export const FREE_PROJECT_LIMIT = 2;

export const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const SAMPLE_PERSONAL_OBJECTIVES = [
  {
    id: 'obj_sample_p1',
    objective: 'Build a healthy, productive daily routine',
    whyNow: 'Consistency compounds — small daily improvements lead to outsized results over the quarter.',
    krs: [
      {
        id: 'kr_sample_p1_1',
        label: 'Exercise 4+ times per week',
        type: 'percent',
        baseline: 0,
        target: 100,
        current: 40,
        unit: '% weeks',
        confidence: 0.6,
        initiatives: [
          { id: 'ini_sample_p1_1a', title: 'Schedule morning runs Mon/Wed/Fri', driver: 'Self', contributors: [], status: 'in_progress', startDate: '', endDate: '' },
          { id: 'ini_sample_p1_1b', title: 'Join a weekend basketball group', driver: 'Self', contributors: [], status: 'todo', startDate: '', endDate: '' },
        ],
      },
      {
        id: 'kr_sample_p1_2',
        label: 'Read 12 books this quarter',
        type: 'percent',
        baseline: 0,
        target: 12,
        current: 3,
        unit: 'books',
        confidence: 0.5,
        initiatives: [
          { id: 'ini_sample_p1_2a', title: 'Set 30-min reading block before bed', driver: 'Self', contributors: [], status: 'done', startDate: '', endDate: '' },
        ],
      },
    ],
  },
];

export const SAMPLE_TEAM_OBJECTIVES = [
  {
    id: 'obj_sample_t1',
    objective: 'Deliver an exceptional onboarding experience for new users',
    whyNow: 'Activation rate is the strongest predictor of long-term retention — improving first-week experience will directly impact revenue.',
    krs: [
      {
        id: 'kr_sample_t1_1',
        label: 'Increase Day-7 retention from 30% to 50%',
        type: 'percent',
        baseline: 30,
        target: 50,
        current: 35,
        unit: '%',
        confidence: 0.55,
        initiatives: [
          { id: 'ini_sample_t1_1a', title: 'Redesign welcome email sequence', driver: 'Growth', contributors: ['Design'], status: 'in_progress', startDate: '', endDate: '' },
          { id: 'ini_sample_t1_1b', title: 'Add interactive product tour', driver: 'Eng', contributors: ['Design', 'PM'], status: 'todo', startDate: '', endDate: '' },
        ],
      },
      {
        id: 'kr_sample_t1_2',
        label: 'Reduce time-to-first-value to under 5 minutes',
        type: 'percent',
        baseline: 15,
        target: 5,
        current: 12,
        unit: 'min',
        confidence: 0.4,
        initiatives: [
          { id: 'ini_sample_t1_2a', title: 'Streamline signup flow (remove 2 steps)', driver: 'Eng', contributors: [], status: 'in_progress', startDate: '', endDate: '' },
        ],
      },
      {
        id: 'kr_sample_t1_3',
        label: 'Achieve NPS ≥ 50 from new users',
        type: 'percent',
        baseline: 20,
        target: 50,
        current: 28,
        unit: 'pts',
        confidence: 0.6,
        initiatives: [
          { id: 'ini_sample_t1_3a', title: 'Launch in-app feedback widget', driver: 'Product', contributors: ['Eng'], status: 'done', startDate: '', endDate: '' },
        ],
      },
    ],
  },
];
