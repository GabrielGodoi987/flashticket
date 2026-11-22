#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const path = require('node:path');

const MIGRATIONS_DIR = path.join('src', 'domain', 'migrations', 'v1');
const DATA_SOURCE = path.join('src', 'database', 'data-source.ts');
const CLI = path.join(
  'node_modules',
  'typeorm',
  'cli-ts-node-commonjs.js',
);

const [command, name] = process.argv.slice(2);

if (command !== 'generate' && command !== 'create') {
  console.error('Uso: npm run migration:<generate|create> NomeDaMigration');
  process.exit(1);
}

if (!name) {
  console.error(`Informe o nome: npm run migration:${command} NomeDaMigration`);
  process.exit(1);
}

const target = path.join(MIGRATIONS_DIR, name);
const args =
  command === 'generate'
    ? ['migration:generate', '-d', DATA_SOURCE, target]
    : ['migration:create', target];

const result = spawnSync(process.execPath, [CLI, ...args], {
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
