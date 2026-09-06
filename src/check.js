/**
 * Deterministic validation of a delivered program (scheda).
 *
 * The framework's rules are prose; this module turns the checkable ones into
 * arithmetic. It answers "does this document hold together?" — not "is this
 * good coaching", which no parser can judge.
 */

const REQUIRED_SECTIONS = [
  { re: /^#+\s*Block aim/im, name: 'Block aim' },
  { re: /^#+\s*Active constraints/im, name: 'Active constraints' },
  { re: /^#+\s*Weekly volume budget/im, name: 'Weekly volume budget' },
  { re: /^#+\s*Weekly schedule/im, name: 'Weekly schedule' },
  { re: /^#+\s*Progression plan/im, name: 'Progression plan' },
  { re: /^#+\s*Autoregulation/im, name: 'Autoregulation' },
  { re: /^#+\s*Exercise cards/im, name: 'Exercise cards' },
  { re: /^#+\s*Deload/im, name: 'Deload' },
  { re: /^#+\s*Review/im, name: 'Review' },
  { re: /^#+\s*Changelog/im, name: 'Changelog' },
];

/** Card subsections that make a card usable by an athlete training alone. */
const REQUIRED_CARD_PARTS = [
  'Setup',
  'Execution',
  'Cues',
  'Breathing',
  'Range of motion standard',
  'Common faults',
  'Risk notes',
  'Regressions',
  'Progressions',
  'Substitutes',
  'References',
];

/** Session sub-headings whose exercises must carry a full card. */
const CARD_REQUIRED_PHASES = /^(skill|constraint work|primary strength|secondary)/i;

/** Movement patterns the volume budget accounts for. */
export const PATTERNS = [
  'vertical pull',
  'horizontal pull',
  'straight-arm pull',
  'vertical push',
  'horizontal push',
  'straight-arm push',
  'knee-dominant',
  'hip hinge',
  'anti-extension',
  'anti-rotation',
];

const PULL_PATTERNS = new Set(['vertical pull', 'horizontal pull', 'straight-arm pull']);
const PUSH_PATTERNS = new Set(['vertical push', 'horizontal push', 'straight-arm push']);

/**
 * Map a card's Pattern text onto exactly one budget pattern.
 * "vertical pull — straight-arm" is straight-arm work: it runs on the tendon
 * clock, not the muscle clock, so it must not land in the vertical pull budget.
 */
export function classifyPattern(text) {
  const t = String(text || '').toLowerCase();
  if (!t) return null;
  // Work deliberately outside the pattern budget: constraint/tolerance drills.
  if (/constraint work|tolerance|prehab/.test(t)) return 'excluded';
  if (/straight[- ]arm/.test(t)) {
    if (/pull/.test(t)) return 'straight-arm pull';
    if (/push|planche/.test(t)) return 'straight-arm push';
  }
  return PATTERNS.find((p) => t.includes(p)) ?? null;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

const isTableRow = (line) => /^\s*\|/.test(line);
const isSeparator = (line) => /^\s*\|[\s:|-]+\|?\s*$/.test(line);

const cells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

/** Strip markdown emphasis and code ticks from a cell so it can be matched. */
export const plain = (s) =>
  String(s)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*|__|\*|_/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();

/**
 * Split a document into tables, each tagged with the H1/H2/H3 it sits under.
 * Fenced code blocks are skipped — they are illustrative, not prescriptive.
 */
export function parseTables(md) {
  const lines = md.split('\n');
  const tables = [];
  let h1 = '';
  let h2 = '';
  let h3 = '';
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const text = plain(h[2]);
      if (h[1].length === 1) {
        h1 = text;
        h2 = '';
        h3 = '';
      } else if (h[1].length === 2) {
        h2 = text;
        h3 = '';
      } else if (h[1].length === 3) {
        h3 = text;
      }
      continue;
    }

    if (isTableRow(line) && isTableRow(lines[i + 1] ?? '') && isSeparator(lines[i + 1])) {
      const header = cells(line).map(plain);
      const rows = [];
      let j = i + 2;
      for (; j < lines.length && isTableRow(lines[j]); j++) {
        rows.push({ line: j + 1, cells: cells(lines[j]) });
      }
      tables.push({ line: i + 1, h1, h2, h3, header, rows });
      i = j - 1;
    }
  }
  return tables;
}

/** Find a column index by fuzzy header name. */
function col(header, ...names) {
  for (const name of names) {
    const i = header.findIndex((h) => h.toLowerCase().includes(name.toLowerCase()));
    if (i !== -1) return i;
  }
  return -1;
}

/**
 * Sets prescribed for a given week, from a session-table cell.
 * Returns null when the cell does not express a set count (rt, ladder, blank).
 *
 *   "4"          -> 4            "4 x 8"     -> 4
 *   "3 e 4 x 5"  -> 3 (wk<=3), 4 (wk>=4)
 *   "2-"         -> 2 + (week-1)
 *   "3\4"        -> 3            "rt" | "ladder" -> null
 */
export function parseSets(cell, week = 1) {
  const s = plain(cell).replace(/\s+/g, ' ').trim().toLowerCase();
  if (!s || s === '\\\\' || s === '—' || s === '-') return null;
  if (/^(rt\b|ladder\b|emom\b|amrap\b)/.test(s)) return null;

  const range = /^(\d+)\s*e\s*(\d+)/.exec(s);
  if (range) return week <= 3 ? Number(range[1]) : Number(range[2]);

  const climbing = /^(\d+)\s*-(?!\d)/.exec(s);
  if (climbing) return Number(climbing[1]) + (week - 1);

  const either = /^(\d+)\s*[\\/]\s*(\d+)/.exec(s);
  if (either) return Number(either[1]);

  const plainN = /^(\d+)/.exec(s);
  return plainN ? Number(plainN[1]) : null;
}

/**
 * Seconds of work in one set, for the session-time estimate.
 * A hold window uses its upper bound; reps use reps x the tempo sum.
 */
export function parseWorkSeconds(prescription, tempo) {
  const s = plain(prescription).toLowerCase();

  const hold = /(\d+)\s*-\s*(\d+)\s*["”]/.exec(s) || /x\s*(\d+)\s*["”]/.exec(s);
  if (hold) return Number(hold[2] ?? hold[1]);

  const reps = /x\s*(\d+)(?:\s*-\s*(\d+))?/.exec(s);
  const repCount = reps ? Number(reps[2] ?? reps[1]) : 8;

  const t = plain(tempo || '');
  const digits = t.match(/\d|x/gi);
  const perRep = digits && digits.length >= 3
    ? digits.reduce((a, d) => a + (/x/i.test(d) ? 1 : Number(d)), 0)
    : 4;

  return repCount * Math.max(perRep, 2);
}

/** Upper bound of a hold window, in seconds. `5 x 8-12"` -> 12. */
export function holdSeconds(prescription) {
  const s = plain(prescription);
  const window = /(\d+)\s*-\s*(\d+)\s*["”]/.exec(s);
  if (window) return Number(window[2]);
  const single = /x\s*(\d+)\s*["”]/.exec(s);
  return single ? Number(single[1]) : 0;
}

const parseRest = (cell) => {
  const m = /(\d+)/.exec(plain(cell));
  return m ? Number(m[1]) : 90;
};

/**
 * A trigger the athlete can act on alone: either a number, or a named symptom
 * ("any front-shoulder pinch"), or a named technical fault ("the low back
 * arches"). "It feels hard" is none of those.
 */
export function isCheckableTrigger(text) {
  const t = String(text).toLowerCase();
  if (/\d/.test(t)) return true;
  return /\b(pain|pinch|ache|symptom|discomfort|sag|arch|bend|collaps|valgus|round|swing|shrug|break|drift|flare)/.test(
    t
  );
}

const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const isRealDate = (s) => {
  const m = ISO_DATE.exec(s);
  if (!m) return false;
  const d = new Date(`${m[0]}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === m[0];
};

// ---------------------------------------------------------------------------
// The checker
// ---------------------------------------------------------------------------

export function checkProgram(md, { path: filePath = 'program.md' } = {}) {
  const findings = [];
  const add = (level, rule, message, line) =>
    findings.push({ level, rule, message, line, file: filePath });
  const error = (rule, message, line) => add('error', rule, message, line);
  const warn = (rule, message, line) => add('warn', rule, message, line);

  const tables = parseTables(md);
  const lines = md.split('\n');

  // --- structure ----------------------------------------------------------
  for (const { re, name } of REQUIRED_SECTIONS) {
    if (!re.test(md)) error('structure', `missing required section: ${name}`);
  }

  // --- placeholders left in --------------------------------------------
  const placeholders = [
    [/YYYY-MM-DD/g, 'unfilled date placeholder (YYYY-MM-DD)'],
    [/<focus>|<athlete>|<N>|<one sentence>/gi, 'unfilled template placeholder'],
  ];
  for (const [re, msg] of placeholders) {
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*(<!--|>)/.test(lines[i])) continue;
      if (new RegExp(re.source, re.flags.replace('g', '')).test(lines[i])) {
        error('placeholder', msg, i + 1);
        break;
      }
    }
  }

  // --- dates --------------------------------------------------------------
  const header = md;
  const dateRange = /Dates?:\s*(\d{4}-\d{2}-\d{2})\s*(?:to|–|-)\s*(\d{4}-\d{2}-\d{2})/i.exec(header);
  if (!dateRange) {
    warn('dates', 'no block date range found in the header (expected "Dates: YYYY-MM-DD to YYYY-MM-DD")');
  } else {
    const [, start, end] = dateRange;
    if (!isRealDate(start) || !isRealDate(end)) error('dates', 'block dates are not valid calendar dates');
    else if (new Date(end) <= new Date(start)) error('dates', 'block end date is not after the start date');

    const review = /Review due:\s*(\d{4}-\d{2}-\d{2})/i.exec(header);
    if (!review) warn('dates', 'no "Review due" date in the header');
    else if (new Date(review[1]) < new Date(end))
      error('dates', `review date ${review[1]} falls before the block ends (${end})`);
  }

  // --- constraints --------------------------------------------------------
  const constraintBlock = section(md, /^#+\s*Active constraints/im);
  const constraintIds = [...constraintBlock.matchAll(/\[([A-Z]+-\d+)\]/g)].map((m) => m[1]);
  const declaresNone = /constraints?:?\s*none|none\b/i.test(constraintBlock.slice(0, 400));
  if (constraintIds.length === 0 && !declaresNone) {
    error('constraints', 'Active constraints is empty — state the constraints, or write "none" explicitly');
  }
  for (const id of constraintIds) {
    const bullet = constraintBlock.slice(constraintBlock.indexOf(`[${id}]`));
    const scope = bullet.slice(0, bullet.indexOf('\n\n') + 1 || bullet.length);
    if (!/instead:/i.test(scope))
      error('constraints', `[${id}] removes work without naming a substitution ("Instead:")`);
    if (!/earns it back:/i.test(scope))
      error('constraints', `[${id}] has no earn-it-back criterion`);
    if (!/re-?test:/i.test(scope) || !isRealDate(scope))
      error('constraints', `[${id}] has no real re-test date`);
  }

  // --- cards --------------------------------------------------------------
  const cardTables = tables.filter((t) => /exercise cards/i.test(t.h1));
  const cardNames = new Map(); // lower name -> {pattern, line}
  const cardHeadingRe = /^##\s+(.+)$/gm;
  let inCards = false;
  let current = null;
  const cardParts = new Map();
  for (let i = 0; i < lines.length; i++) {
    const h1 = /^#\s+(.+)$/.exec(lines[i]);
    if (h1) {
      inCards = /exercise cards/i.test(plain(h1[1]));
      current = null;
      continue;
    }
    if (!inCards) continue;
    const h2 = /^##\s+(.+)$/.exec(lines[i]);
    if (h2) {
      current = plain(h2[1]);
      cardNames.set(current.toLowerCase(), { line: i + 1, pattern: null });
      cardParts.set(current, new Set());
      continue;
    }
    const h3 = /^###\s+(.+)$/.exec(lines[i]);
    if (h3 && current) cardParts.get(current).add(plain(h3[1]).replace(/\s*\(.*/, '').trim());
  }
  cardHeadingRe.lastIndex = 0;

  for (const t of cardTables) {
    const row = t.rows.find((r) => /pattern/i.test(plain(r.cells[0])));
    if (!row) continue;
    // Attribute the pattern to the nearest card heading above the table.
    const name = [...cardNames.entries()]
      .filter(([, v]) => v.line < t.line)
      .sort((a, b) => b[1].line - a[1].line)[0];
    if (name) name[1].pattern = plain(row.cells[1] ?? '').toLowerCase();
  }

  for (const [name, parts] of cardParts) {
    const missing = REQUIRED_CARD_PARTS.filter(
      (p) => ![...parts].some((got) => got.toLowerCase().startsWith(p.toLowerCase()))
    );
    if (missing.length) {
      error(
        'card',
        `card "${name}" is missing: ${missing.join(', ')}`,
        cardNames.get(name.toLowerCase())?.line
      );
    }
  }

  // --- sessions -----------------------------------------------------------
  const sessionTables = tables.filter((t) => /^session\b/i.test(t.h1));
  if (sessionTables.length === 0) error('structure', 'no session tables found (expected "# Session A …")');

  const prescribed = []; // {name, phase, sets(week), rest, work, line, session}
  for (const t of sessionTables) {
    const iName = col(t.header, 'exercise');
    if (iName === -1) continue;
    const iSets = col(t.header, 'sets x reps', 'sets x time', 'sets', 'prescription');
    const iTempo = col(t.header, 'tempo');
    const iRest = col(t.header, 'rest');
    const iCard = col(t.header, 'card');

    for (const r of t.rows) {
      const name = plain(r.cells[iName] ?? '');
      if (!name || /^-+$/.test(name)) continue;
      const prescription = iSets === -1 ? '' : r.cells[iSets] ?? '';
      prescribed.push({
        name,
        session: t.h1,
        phase: t.h2 || t.h3 || '',
        prescription,
        sets: (w) => parseSets(prescription, w),
        rest: iRest === -1 ? 90 : parseRest(r.cells[iRest]),
        work: parseWorkSeconds(prescription, iTempo === -1 ? '' : r.cells[iTempo]),
        card: iCard === -1 ? '' : plain(r.cells[iCard] ?? ''),
        line: r.line,
      });
    }
  }

  // C1 — every skill/primary/secondary exercise needs a card
  for (const ex of prescribed) {
    if (!CARD_REQUIRED_PHASES.test(ex.phase)) continue;
    if (!cardNames.has(ex.name.toLowerCase())) {
      error('card', `"${ex.name}" (${ex.session}, ${ex.phase}) has no exercise card`, ex.line);
    }
  }

  // C4 — cards nothing uses
  const used = new Set(prescribed.map((e) => e.name.toLowerCase()));
  for (const [name, meta] of cardNames) {
    if (!used.has(name)) warn('card', `card "${name}" is not prescribed in any session`, meta.line);
  }

  // --- progression plan ---------------------------------------------------
  const progTable = tables.find((t) => /progression plan/i.test(t.h1) || /progression plan/i.test(t.h2));
  if (!progTable) {
    error('progression', 'no progression plan table found');
  } else {
    const iName = col(progTable.header, 'exercise');
    const iProg = col(progTable.header, 'progress when', 'progress');
    const iReg = col(progTable.header, 'regress when', 'regress');
    if (iProg === -1 || iReg === -1)
      error('progression', 'progression plan needs both a "Progress when" and a "Regress when" column', progTable.line);

    const planned = new Map();
    for (const r of progTable.rows) {
      const name = plain(r.cells[iName] ?? '');
      if (!name) continue;
      planned.set(name.toLowerCase(), r);
      const prog = plain(r.cells[iProg] ?? '');
      const reg = plain(r.cells[iReg] ?? '');
      if (!prog) error('progression', `"${name}" has no progress trigger`, r.line);
      else if (!isCheckableTrigger(prog))
        warn('progression', `"${name}" progress trigger is not checkable by the athlete alone`, r.line);
      if (!reg) error('progression', `"${name}" has no regress trigger`, r.line);
      else if (!isCheckableTrigger(reg))
        warn('progression', `"${name}" regress trigger is not checkable by the athlete alone`, r.line);
    }

    for (const ex of prescribed) {
      if (!CARD_REQUIRED_PHASES.test(ex.phase)) continue;
      const hit = [...planned.keys()].some(
        (k) => k.includes(ex.name.toLowerCase()) || ex.name.toLowerCase().includes(k)
      );
      if (!hit) error('progression', `"${ex.name}" has no row in the progression plan`, ex.line);
    }
  }

  // --- volume budget ------------------------------------------------------
  const budgetTable = tables.find((t) => /weekly volume budget/i.test(t.h1) || /weekly volume budget/i.test(t.h2));
  if (budgetTable) {
    const declared = new Map();
    let declaredRatio = null;
    let declaredTut = null;
    for (const r of budgetTable.rows) {
      const label = plain(r.cells[0] ?? '').toLowerCase();
      const n = Number((plain(r.cells[1] ?? '').match(/\d+/) || [])[0]);
      if (/push\s*:\s*pull/.test(label)) {
        declaredRatio = plain(r.cells[1] ?? '');
        continue;
      }
      if (/tut/.test(label)) {
        if (Number.isFinite(n)) declaredTut = n;
        continue;
      }
      const pattern = PATTERNS.find((p) => label.includes(p));
      if (pattern && Number.isFinite(n)) declared.set(pattern, n);
    }

    const computed = new Map();
    let computedTut = 0;
    let unattributed = 0;
    for (const ex of prescribed) {
      if (!CARD_REQUIRED_PHASES.test(ex.phase)) continue;
      const sets = ex.sets(1);
      if (sets == null) continue;

      // Skill work is budgeted as time under tension, not as hard sets — it
      // runs on the tendon clock. Count it there and nowhere else.
      if (/^skill/i.test(ex.phase)) {
        computedTut += sets * holdSeconds(ex.prescription);
        continue;
      }

      const pattern = classifyPattern(cardNames.get(ex.name.toLowerCase())?.pattern ?? '');
      if (pattern === 'excluded') continue;
      if (!pattern) {
        unattributed += 1;
        continue;
      }
      computed.set(pattern, (computed.get(pattern) ?? 0) + sets);
    }

    if (declaredTut != null && computedTut && declaredTut !== computedTut) {
      error(
        'budget',
        `budget declares ${declaredTut} s of week-1 skill TUT, the skill rows contain ${computedTut} s`,
        budgetTable.line
      );
    }

    for (const [pattern, n] of declared) {
      const got = computed.get(pattern) ?? 0;
      if (got !== n) {
        error(
          'budget',
          `budget declares ${n} week-1 sets of ${pattern}, the sessions contain ${got}`,
          budgetTable.line
        );
      }
    }
    for (const [pattern, got] of computed) {
      if (!declared.has(pattern))
        warn('budget', `${got} week-1 sets of ${pattern} are prescribed but not budgeted`, budgetTable.line);
    }
    if (unattributed)
      warn('budget', `${unattributed} exercise(s) could not be attributed to a pattern (check the card's Pattern row)`);

    const pull = sumPatterns(computed, PULL_PATTERNS);
    const push = sumPatterns(computed, PUSH_PATTERNS);
    if (push > pull)
      error('budget', `push volume (${push}) exceeds pull volume (${pull}) — pull must be >= push`, budgetTable.line);
    if (declaredRatio && !/\d/.test(declaredRatio))
      warn('budget', 'push:pull row has no numbers', budgetTable.line);
  }

  // --- structural balance -------------------------------------------------
  // The mechanical half of the six-axis audit in structural-balance.md.
  {
    const present = new Set();
    let unilateral = 0;
    for (const ex of prescribed) {
      const card = cardNames.get(ex.name.toLowerCase());
      const p = classifyPattern(card?.pattern ?? '');
      if (p && p !== 'excluded') present.add(p);
      if (/\bx\s*l\b/i.test(plain(ex.prescription)) || /(single|one)[- ]arm|(single|one)[- ]leg|split squat|per side|unilateral/i.test(
          `${ex.name} ${card?.pattern ?? ''}`
        ))
        unilateral += 1;
    }

    const has = (...ps) => ps.some((p) => present.has(p));
    const axes = [
      ['horizontal', has('horizontal push'), has('horizontal pull'), 'horizontal push', 'horizontal pull'],
      ['vertical', has('vertical push'), has('vertical pull', 'straight-arm pull'), 'vertical push', 'vertical pull'],
      ['lower body', has('knee-dominant'), has('hip hinge'), 'knee-dominant', 'hip hinge'],
      ['core', has('anti-extension'), has('anti-rotation'), 'anti-extension (linear)', 'anti-rotation / lateral'],
    ];

    // Only audit balance once the program is substantial enough to have axes.
    if (prescribed.length >= 4 && present.size >= 2) {
      for (const [axis, a, b, aName, bName] of axes) {
        if (a && !b) warn('balance', `${axis} axis is one-sided: ${aName} present, no ${bName}`);
        else if (b && !a) warn('balance', `${axis} axis is one-sided: ${bName} present, no ${aName}`);
      }
      if (present.has('vertical pull') || present.has('straight-arm pull')) {
        if (!present.has('horizontal pull'))
          warn(
            'balance',
            'no horizontal pulling — the scapular retractors, posterior deltoids and external rotators are the most commonly under-trained group in this sport'
          );
      }
      if (unilateral === 0)
        warn('balance', 'no unilateral work — bilateral training alone leaves the stabilisers untrained');
    }
  }

  // --- session time -------------------------------------------------------
  const declaredLength = /Session length:\s*(\d+)\s*min/i.exec(md);
  if (declaredLength) {
    const budgetMin = Number(declaredLength[1]);
    const bySession = new Map();
    for (const ex of prescribed) {
      const sets = ex.sets(1) ?? 1;
      const seconds = sets * (ex.work + ex.rest);
      bySession.set(ex.session, (bySession.get(ex.session) ?? 0) + seconds);
    }
    const WARMUP_COOLDOWN_MIN = 15;
    for (const [session, seconds] of bySession) {
      const est = Math.round(seconds / 60) + WARMUP_COOLDOWN_MIN;
      if (est > budgetMin * 1.25)
        error('time', `${session} estimates ~${est} min against a ${budgetMin} min budget — cut an exercise`, undefined);
      else if (est > budgetMin * 1.05)
        warn('time', `${session} estimates ~${est} min against a ${budgetMin} min budget`, undefined);
    }
  } else {
    warn('time', 'no "Session length: N min" in the header — cannot check the time budget');
  }

  // --- autoregulation -----------------------------------------------------
  const autoreg = section(md, /^#+\s*Autoregulation/im);
  for (const [re, label] of [
    [/bad day/i, 'bad day'],
    [/short day/i, 'short day'],
    [/amber/i, 'amber pain'],
    [/red/i, 'red pain'],
    [/missed/i, 'missed sessions'],
  ]) {
    if (!re.test(autoreg)) error('autoregulation', `Autoregulation does not cover: ${label}`);
  }

  // --- notation -----------------------------------------------------------
  const notation = section(md, /^#+\s*Notation/im);
  const shorthandUsed = new Set();
  for (const ex of prescribed) {
    const p = plain(ex.prescription);
    if (/^\d+\s*e\s*\d+/.test(p)) shorthandUsed.add('N e M');
    if (/^\d+\s*-(?!\d)/.test(p)) shorthandUsed.add('N-');
    if (/\brt\b/i.test(p)) shorthandUsed.add('rt');
    if (/\bx\s*l\b/i.test(p)) shorthandUsed.add('x l');
    if (/ladder/i.test(p)) shorthandUsed.add('ladder');
  }
  if (shorthandUsed.size && !notation)
    error('notation', `session tables use shorthand (${[...shorthandUsed].join(', ')}) but there is no Notation legend`);

  // --- citation keys ------------------------------------------------------
  // Only scan the References subsections of cards: that is where citation keys
  // belong, and it keeps constraint ids and template placeholders out of scope.
  const referenceText = collectSubsections(md, /^###\s+References\b/i);
  const citedKeys = new Set(
    [...referenceText.matchAll(/\[([A-Z][A-Z0-9]{1,7})\]/g)].map((m) => m[1])
  );
  if (citedKeys.size) {
    const bib = section(md, /^#+\s*Bibliography/im);
    if (!bib) {
      error(
        'bibliography',
        `citation keys used (${[...citedKeys].join(', ')}) but there is no Bibliography section`
      );
    } else {
      for (const key of citedKeys) {
        if (!new RegExp(`\\[${key}\\]`).test(bib.replace(/^#.*$/m, ''))) {
          error('bibliography', `citation key [${key}] is not defined in the Bibliography`);
        }
      }
    }
  }

  // --- constraint review aid ---------------------------------------------
  const banned = [...constraintBlock.matchAll(/(?:^|\s)No\s+([a-z][a-z-]*(?:\s+[a-z][a-z-]*)?)/g)]
    .map((m) => m[1].trim().toLowerCase())
    .filter((t) => t.length > 3);
  for (const term of new Set(banned)) {
    const head = term.split(/\s+/)[0].replace(/(ing|s)$/, '');
    const hits = prescribed.filter((e) => e.name.toLowerCase().includes(head));
    for (const hit of hits) {
      warn(
        'constraint-review',
        `"${hit.name}" matches a constrained term ("No ${term}") — confirm it is the permitted variant`,
        hit.line
      );
    }
  }

  return {
    findings,
    stats: {
      sessions: new Set(prescribed.map((e) => e.session)).size,
      exercises: prescribed.length,
      cards: cardNames.size,
      constraints: constraintIds.length,
    },
  };
}

function sumPatterns(map, set) {
  let n = 0;
  for (const [k, v] of map) if (set.has(k)) n += v;
  return n;
}

/** Concatenated text of every section whose heading matches, at any depth. */
function collectSubsections(md, headingRe) {
  const lines = md.split('\n');
  const out = [];
  let level = 0;
  let collecting = false;
  for (const line of lines) {
    const h = /^(#+)\s/.exec(line);
    if (h) {
      if (collecting && h[1].length <= level) collecting = false;
      if (headingRe.test(line)) {
        collecting = true;
        level = h[1].length;
        continue;
      }
    }
    if (collecting) out.push(line);
  }
  return out.join('\n');
}

/** Text of the section a heading opens, up to the next heading of the same or higher level. */
function section(md, headingRe) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => headingRe.test(l));
  if (start === -1) return '';
  const level = (/^(#+)/.exec(lines[start]) || ['', '#'])[1].length;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = /^(#+)\s/.exec(lines[i]);
    if (h && h[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}
