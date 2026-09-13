import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TRACKS, trackOf, checkTrack } from '../src/tracks.js';

test('every track names the archetypes it permits and the axis that leads', () => {
  for (const [id, t] of Object.entries(TRACKS)) {
    assert.ok(t.archetypes.length > 0, `${id}: no archetypes`);
    assert.ok(t.summary, `${id}: no summary an athlete could read`);
    assert.ok(Array.isArray(t.requires), `${id}: must say what volume it requires`);
  }
});

test('strength is the default, so a profile that says nothing still works', () => {
  assert.equal(trackOf(''), 'strength');
  assert.equal(trackOf('# Athlete Profile\n\nnothing about tracks here'), 'strength');
});

test('a profile that declares a track is read', () => {
  assert.equal(trackOf('> Track: skill'), 'skill');
  assert.equal(trackOf('| Track | endurance |'), 'endurance');
  assert.equal(trackOf('**Track:** Hybrid'), 'hybrid');
});

test('an unknown track is not silently treated as the default', () => {
  assert.equal(trackOf('> Track: powerlifting'), null);
});

// --- what the checker holds a block to -------------------------------------

const block = ({ track = 'skill', archetype = 'skill', axes = {} } = {}) => `
# Block 1 — Test

> Track: ${track} · Archetype: ${archetype}

## Weekly volume budget
| Pattern | Hard sets/week |
|---|---|
| Vertical pull | 9 |
${Object.entries(axes)
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join('\n')}
`;

test('a skill block with no skill volume is rejected', () => {
  const findings = checkTrack(block({ track: 'skill', axes: { 'Skill TUT (s/week)': 0 } }));
  assert.ok(
    findings.some((f) => f.level === 'error' && /skill/i.test(f.message)),
    'a skill track whose skill axis is empty is a strength block wearing a label'
  );
});

test('a skill block that trains the skill passes', () => {
  const findings = checkTrack(block({ track: 'skill', axes: { 'Skill TUT (s/week)': 420 } }));
  assert.deepEqual(findings.filter((f) => f.level === 'error'), []);
});

test('an archetype the track does not permit is an error', () => {
  const findings = checkTrack(block({ track: 'skill', archetype: 'hypertrophy', axes: { 'Skill TUT (s/week)': 420 } }));
  assert.ok(
    findings.some((f) => /hypertrophy/.test(f.message) && /skill/.test(f.message)),
    'the track decides which archetypes are in play'
  );
});

test('an unknown track named in a block is an error, not a shrug', () => {
  const findings = checkTrack(block({ track: 'crossfit' }));
  assert.ok(findings.some((f) => f.level === 'error' && /crossfit/.test(f.message)));
});

test('a block that declares no track is held to the default, not exempted', () => {
  const findings = checkTrack('# Block 1\n\n> Archetype: foundation\n');
  assert.ok(
    !findings.some((f) => /unknown track/i.test(f.message)),
    'saying nothing means the strength track, which foundation belongs to'
  );
});

test('an endurance block with no conditioning volume is rejected', () => {
  const findings = checkTrack(block({ track: 'endurance', archetype: 'foundation' }));
  assert.ok(
    findings.some((f) => f.level === 'error' && /conditioning/i.test(f.message)),
    'a block on the endurance track that does not condition is that track in name only'
  );
});

test('an endurance block that conditions passes', () => {
  const findings = checkTrack(
    block({ track: 'endurance', archetype: 'foundation', axes: { 'Conditioning (min/week)': 90 } })
  );
  assert.deepEqual(findings.filter((f) => f.level === 'error'), []);
});
