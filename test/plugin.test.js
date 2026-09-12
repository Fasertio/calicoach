import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { pluginManifest, marketplaceManifest, readPackageJson } from '../src/paths.js';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('the plugin manifest is valid and complete', () => {
  const plugin = read(pluginManifest);

  assert.equal(plugin.name, 'calicoach', 'the command namespace /calicoach:* derives from this');
  assert.ok(plugin.description?.length > 20);
  assert.ok(plugin.author?.name);
  assert.equal(plugin.license, 'GPL-3.0-or-later');
  assert.ok(Array.isArray(plugin.keywords) && plugin.keywords.length > 0);
});

test('the plugin version matches the package version', () => {
  assert.equal(read(pluginManifest).version, readPackageJson().version);
});

test('the marketplace offers calicoach from the repository root', () => {
  const market = read(marketplaceManifest);

  assert.ok(market.name);
  assert.ok(market.owner?.name);
  assert.equal(market.plugins.length, 1);
  assert.equal(market.plugins[0].name, 'calicoach');
  assert.equal(market.plugins[0].source, './');
});
