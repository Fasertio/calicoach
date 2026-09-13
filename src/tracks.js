/**
 * The athlete's training track.
 *
 * An archetype shapes one block; a track shapes the arc the blocks sit on. It
 * decides which archetypes are in play at all, which volume axis leads a
 * session, and therefore what a block has to contain to be the thing it claims
 * to be. Without it, every block is a strength block and a skill goal is
 * something bolted onto the end of one.
 *
 * The point of encoding it rather than writing it down: a skill block whose
 * skill axis is empty is a strength block wearing a label, and prose cannot
 * catch that. A rule only the doctrine states is a rule that gets broken.
 */

import { section, parseTables, plain } from './check.js';

export const TRACKS = {
  strength: {
    summary: 'Get stronger and bigger. The default, and what a first block is.',
    archetypes: ['foundation', 'hypertrophy', 'strength', 'peaking', 'deload', 'return-to-training'],
    requires: [],
    leads: 'the heaviest compound of the day',
  },
  skill: {
    summary:
      'Own a position: planche, front lever, handstand, muscle-up, flag. High frequency, low fatigue, quality-capped.',
    archetypes: ['foundation', 'skill', 'peaking', 'deload', 'return-to-training'],
    // Volume measured in time under tension, not sets: a hold has no reps.
    requires: [{ axis: /skill\s*tut/i, label: 'Skill TUT' }],
    leads: 'the skill, performed fresh',
  },
  endurance: {
    summary: 'Build the engine: work capacity, density, repeatable output.',
    archetypes: ['foundation', 'endurance', 'deload', 'return-to-training'],
    requires: [{ axis: /conditioning/i, label: 'Conditioning' }],
    leads: 'the conditioning piece',
  },
  hybrid: {
    summary: 'Strength and conditioning together, with an explicit interference budget.',
    archetypes: ['foundation', 'hypertrophy', 'strength', 'deload', 'return-to-training'],
    requires: [{ axis: /conditioning/i, label: 'Conditioning' }],
    leads: 'the strength work; conditioning comes after it, never before',
  },
};

export const DEFAULT_TRACK = 'strength';

/**
 * The track a document declares. Returns the default when nothing is said —
 * a profile written before tracks existed is a strength athlete — and null
 * when something unrecognised is said, which is a different problem.
 */
export function trackOf(md) {
  const m = /(?:^|[|>*\s])Track:?\**\s*[:|]?\s*([A-Za-z-]+)/m.exec(String(md ?? ''));
  if (!m) return DEFAULT_TRACK;
  const named = m[1].toLowerCase();
  return Object.hasOwn(TRACKS, named) ? named : null;
}

/** The archetype a block header declares. */
function archetypeOf(md) {
  return /Archetype:\s*([A-Za-z/-]+)/i.exec(String(md ?? ''))?.[1]?.toLowerCase() ?? null;
}

/** Volume axes the block's budget carries a non-zero number for. */
function axesWithVolume(md) {
  const budget = section(String(md ?? ''), /^#+\s*Weekly volume budget/im);
  const out = [];
  for (const t of parseTables(budget)) {
    for (const r of t.rows) {
      const name = plain(r.cells[0] ?? '');
      if (!name) continue;
      const any = r.cells.slice(1).some((c) => /[1-9]/.test(plain(c ?? '')));
      if (any) out.push(name);
    }
  }
  return out;
}

/**
 * Hold a block to the track it claims. Returns findings in the checker's
 * shape, so the caller reports them the same way it reports everything else.
 */
export function checkTrack(md) {
  const findings = [];
  const add = (level, message) => findings.push({ level, rule: 'track', message });

  const declared = /(?:^|[|>*\s])Track:?\**\s*[:|]?\s*([A-Za-z-]+)/m.exec(String(md ?? ''));
  const name = trackOf(md);
  if (name === null) {
    add('error', `unknown track "${declared?.[1]}" — expected one of ${Object.keys(TRACKS).join(', ')}`);
    return findings;
  }

  const track = TRACKS[name];

  if (track.unbuilt) {
    add('error', `this block declares the ${name} track, but ${track.unbuilt}`);
  }

  const archetype = archetypeOf(md);
  if (archetype && !track.archetypes.some((a) => archetype.startsWith(a) || a.startsWith(archetype))) {
    add(
      'error',
      `archetype "${archetype}" is not part of the ${name} track — it permits ${track.archetypes.join(', ')}`
    );
  }

  const axes = axesWithVolume(md);
  for (const req of track.requires) {
    if (!axes.some((a) => req.axis.test(a))) {
      add(
        'error',
        `the ${name} track requires ${req.label} volume, and the budget has none — a block that does not train the thing the track is for is that track in name only`
      );
    }
  }
  return findings;
}
