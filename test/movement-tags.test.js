import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TAGS, parseForbids, tagsFor } from '../src/movement-tags.js';

test('tagsFor reads the forbidden quality out of the exercise name', () => {
  assert.ok(tagsFor({ name: 'Barbell Overhead Press' }).has('overhead-press'));
  assert.ok(tagsFor({ name: 'Handstand Push-up (wall)' }).has('overhead-load'));
  assert.ok(tagsFor({ name: 'Behind-the-neck Pull-down' }).has('behind-neck'));
  assert.ok(tagsFor({ name: 'Ring Dip' }).has('dip'));
  assert.ok(tagsFor({ name: 'Box Jump' }).has('impact'));
});

test('tagsFor reads straight-arm off the pattern, not just the name', () => {
  const tags = tagsFor({ name: 'Ice-cream Maker', pattern: 'vertical pull — straight-arm' });
  assert.ok(tags.has('straight-arm'), 'the pattern column carries the tendon-clock quality');
});

test('tagsFor accepts an explicit declaration from the card', () => {
  const tags = tagsFor({ name: 'Coach Rossi Special', explicit: ['overhead-press'] });
  assert.ok(tags.has('overhead-press'), 'a card can tag a movement the lexicon does not know');
});

test('tagsFor does not tag a movement that merely mentions the region', () => {
  assert.ok(!tagsFor({ name: 'Shoulder External Rotation, band' }).has('overhead-press'));
  assert.ok(!tagsFor({ name: 'Incline Dumbbell Press' }).has('overhead-press'));
});

test('parseForbids reads the controlled vocabulary and reports what it cannot', () => {
  const good = parseForbids('Forbids: overhead-press, dip');
  assert.deepEqual(good.tags, ['overhead-press', 'dip']);
  assert.deepEqual(good.unknown, []);

  const bad = parseForbids('Forbids: overhead-press, no-bad-vibes');
  assert.deepEqual(bad.tags, ['overhead-press']);
  assert.deepEqual(bad.unknown, ['no-bad-vibes'], 'an invented tag is reported, not silently dropped');
});

test('parseForbids finds nothing when the field is absent', () => {
  assert.equal(parseForbids('Instead: landmine press.').tags.length, 0);
});

test('every tag in the vocabulary is kebab-case and unique', () => {
  assert.ok(TAGS.length > 0);
  assert.equal(new Set(TAGS).size, TAGS.length, 'no duplicate tags');
  for (const t of TAGS) assert.match(t, /^[a-z][a-z0-9-]*$/, `${t} is not kebab-case`);
});

test('the reference doc lists exactly the tags the checker enforces', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const doc = fs.readFileSync(
    path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '..',
      'skills',
      'movement-screening',
      'references',
      'movement-tags.md'
    ),
    'utf8'
  );
  const documented = [...doc.matchAll(/^\| `([a-z0-9-]+)` \|/gm)].map((m) => m[1]);
  assert.deepEqual(
    documented.sort(),
    [...TAGS].sort(),
    'a tag the coach cannot read about is a tag the coach will not use'
  );
});
