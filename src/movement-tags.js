/**
 * The controlled vocabulary that makes a contraindication machine-checkable.
 *
 * A constraint in `screening.md` says what is removed in prose, for the athlete
 * to read. It also declares a `Forbids:` line in these tags, for the checker to
 * read. The two must agree; the prose is what a human trusts, the tags are what
 * catches a violation that slipped into a 2000-line program.
 *
 * Every tag here comes from a "Remove" cell in
 * `skills/movement-screening/references/contraindications.md`. Do not invent
 * tags: if a real constraint cannot be expressed, add it there first, then here.
 */

/** tag -> { why, name } — `name` matches an exercise by its written name. */
const LEXICON = {
  'overhead-press': {
    why: 'pressing with the humerus travelling above roughly 120°',
    name: /\b(overhead press|ohp\b|military press|shoulder press|strict press|z[- ]press|pike push[- ]?up|handstand push[- ]?up|hspu)\b/,
  },
  'overhead-load': {
    why: 'any loaded position with the arms overhead',
    name: /\b(handstand|hspu|overhead (carry|squat|hold|walk)|wall walk)\b/,
  },
  'behind-neck': {
    why: 'loading at end-range external rotation behind the head',
    name: /behind[- ](the[- ])?neck/,
  },
  dip: {
    why: 'the dip pattern, where depth drives shoulder and sternoclavicular load',
    name: /\bdips?\b/,
  },
  'support-hold': {
    why: 'a straight-arm support on bar or rings',
    name: /\b(support hold|rto support|ring support)\b/,
  },
  'straight-arm': {
    why: 'straight-arm loading — the elbow and shoulder tendon clock',
    name: /\b(planche|front lever|back lever|maltese|iron cross|straight[- ]arm|ice[- ]cream maker|hefesto)\b/,
  },
  'false-grip': { why: 'false-grip loading of the wrist flexors', name: /false[- ]grip/ },
  weighted: {
    why: 'external load added to a bodyweight movement',
    name: /\b(weighted|\+\s*\d+\s*kg)\b/,
  },
  kipping: { why: 'ballistic kipping', name: /\bkip(ping)?\b/ },
  'loaded-spinal-flexion': {
    why: 'loading the spine into flexion',
    name: /\b(sit[- ]?up|crunch|toes[- ]to[- ]bar|v[- ]?up|jackknife|loaded spinal flexion)\b/,
  },
  'end-range-spinal-extension': {
    why: 'loading the spine at end-range extension',
    name: /\b(bridge|back extension|superman|arch (hold|body)|hyperextension)\b/,
  },
  'loaded-hinge': {
    why: 'a loaded hip hinge',
    name: /\b(deadlift|rdl|romanian deadlift|good morning|loaded carry|farmer)\b/,
  },
  'deep-squat': {
    why: 'squatting below the pain-free or mobility-available depth',
    name: /\b(deep squat|ass[- ]to[- ]grass|atg|full squat|sissy squat)\b/,
  },
  'deep-knee-flexion': {
    why: 'loaded knee flexion past roughly 90°',
    name: /\b(sissy squat|deep lunge|shrimp squat|kneeling quad)\b/,
  },
  pistol: { why: 'the pistol squat pattern', name: /\bpistol\b/ },
  impact: {
    why: 'impact and plyometric loading',
    name: /\b(jump|jumping|plyo\w*|bound|sprint|hop|skip(ping)?|box jump|run(ning)?|depth drop)\b/,
  },
  'flat-hand-loading': {
    why: 'weight-bearing on a flat hand in wrist extension',
    name: /\b(floor push[- ]?up|flat[- ]hand|handstand)\b/,
  },
  'wide-stance-hip': {
    why: 'loading the adductors at length',
    name: /\b(cossack|straddle|human flag|wide[- ]stance|sumo|copenhagen)\b/,
  },
  'high-hip-flexion': {
    why: 'loaded hip flexion above roughly 90°',
    name: /\b(l[- ]?sit|leg raise|knee raise|toes[- ]to[- ]bar|dragon flag|hanging (leg|knee))\b/,
  },
  'end-range-external-rotation': {
    why: 'loading the shoulder at end-range external rotation',
    name: /\b(behind[- ]neck|dislocate|skin the cat|german hang)\b/,
  },
  'stretched-pec': {
    why: 'loading the pec at maximal length',
    name: /\b(fly|flye|deep bench|pec deck|chest stretch)\b/,
  },
  'heavy-grip': {
    why: 'high grip demand',
    name: /\b(dead ?hang|towel|thick[- ]?bar|fat ?grip|pinch|farmer)\b/,
  },
  'pronated-grip': { why: 'loaded pronated-grip work', name: /\b(pronated|overhand)\b/ },
  'sustained-elbow-flexion': {
    why: 'holding the elbow flexed under load',
    name: /\b(hold at (90|the top)|top hold|flexed[- ]arm hang|chin[- ]over[- ]bar hold)\b/,
  },
  'single-leg-balance': {
    why: 'balancing on one leg under load',
    name: /\b(single[- ]leg (balance|stand|deadlift|rdl)|pistol|shrimp|airplane)\b/,
  },
  'maximal-single': { why: 'a maximal single repetition', name: /\b(1rm|max single|max attempt)\b/ },
  'maximal-valsalva': {
    why: 'maximal breath-holding against a closed glottis',
    name: /\b(1rm|max single|maximal (lift|effort))\b/,
  },
  'long-maximal-isometric': {
    why: 'a long isometric held at maximal effort',
    name: /\b(max hold|maximal hold|to failure hold)\b/,
  },
};

/** The valid `Forbids:` tokens, in declaration order. */
export const TAGS = Object.keys(LEXICON);

/** Why a tag exists — used to explain a violation to the coach. */
export const tagReason = (tag) => LEXICON[tag]?.why ?? tag;

const normalise = (s) => String(s).trim().toLowerCase().replace(/\s+/g, '-');

/**
 * Read a constraint's `Forbids:` line.
 * Returns the recognised tags and, separately, anything invented — an unknown
 * token is a silent hole in the check, so it is reported rather than dropped.
 */
export function parseForbids(text) {
  const m = /^\s*(?:[-*]\s*)?(?:\*\*)?forbids(?:\*\*)?\s*:\s*(.+)$/im.exec(String(text ?? ''));
  if (!m) return { tags: [], unknown: [] };

  const tags = [];
  const unknown = [];
  for (const raw of m[1].split(/[,;]/)) {
    const token = normalise(raw.replace(/[`.*]/g, ''));
    if (!token) continue;
    if (token === 'none') continue;
    if (LEXICON[token]) tags.push(token);
    else unknown.push(token);
  }
  return { tags, unknown };
}

/**
 * The forbidden qualities a prescribed exercise carries.
 *
 * `name` is what the session table calls it, `pattern` the card's Pattern row,
 * `explicit` an optional declaration from the card for movements the lexicon
 * does not know. Declaration adds to detection; it never suppresses it — a card
 * cannot tag its way out of a constraint.
 */
export function tagsFor({ name = '', pattern = '', explicit = [] } = {}) {
  const haystack = String(name).toLowerCase();
  const found = new Set();

  for (const [tag, { name: re }] of Object.entries(LEXICON)) {
    if (re.test(haystack)) found.add(tag);
  }

  const p = String(pattern).toLowerCase();
  if (/straight[- ]arm/.test(p)) found.add('straight-arm');

  for (const raw of explicit) {
    const token = normalise(raw);
    if (LEXICON[token]) found.add(token);
  }

  // An overhead press is by definition an overhead load.
  if (found.has('overhead-press')) found.add('overhead-load');

  return found;
}
