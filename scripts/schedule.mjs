#!/usr/bin/env node
// Herramienta para mantener los horarios de Lumio.
//
//   node scripts/schedule.mjs from-table 2026-12 tabla.txt   # una fila por dia, 8 circuitos separados por espacios
//   node scripts/schedule.mjs rotate 2026-12                 # genera el mes continuando la rotacion 19,21,1,20,2
//   node scripts/schedule.mjs build [--version 0.2.0 --apk URL --notes "texto"]
//
// `build` valida todos los meses, escribe schedule/index.json y regenera src/data/bundled.ts.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedule } from '../src/core/validate.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'schedule');
const SLOTS = ['00:01-03:00', '03:00-06:00', '06:00-09:00', '09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-23:59'];
const CYCLE = [19, 21, 1, 20, 2];
const [cmd, ...args] = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const daysIn = (month) => new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
const die = (msg) => {
  console.error(`error: ${msg}`);
  process.exit(1);
};

function writeMonth(month, rows, source) {
  const days = Object.fromEntries(rows.map((r, i) => [String(i + 1), r]));
  const doc = {
    version: 1,
    month,
    timezone: 'America/Havana',
    meaning: 'light',
    updatedAt: new Date().toISOString(),
    source,
    slots: SLOTS,
    circuits: [...new Set(rows.flat())].sort((a, b) => a - b),
    days,
  };
  validateSchedule(doc);
  writeFileSync(resolve(dir, `${month}.json`), JSON.stringify(doc, null, 1) + '\n');
  console.log(`escrito schedule/${month}.json (${rows.length} dias)`);
}

if (cmd === 'from-table') {
  const [month, file] = args;
  if (!/^\d{4}-\d{2}$/.test(month ?? '') || !file) die('uso: from-table AAAA-MM archivo.txt');
  const rows = readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.replace(/Cto/gi, '').trim())
    .filter(Boolean)
    .map((l) => l.split(/[\s,;]+/).map(Number));
  if (rows.length !== daysIn(month)) die(`${month} tiene ${daysIn(month)} dias y el archivo trae ${rows.length} filas`);
  writeMonth(month, rows, 'tabla pegada a mano');
} else if (cmd === 'rotate') {
  const [month] = args;
  if (!/^\d{4}-\d{2}$/.test(month ?? '')) die('uso: rotate AAAA-MM');
  const rows = Array.from({ length: daysIn(month) }, (_, d) => SLOTS.map((_, s) => CYCLE[(d * 8 + s) % 5]));
  writeMonth(month, rows, 'rotacion 19,21,1,20,2 (a confirmar con la tabla oficial)');
} else if (cmd === 'build') {
  const files = readdirSync(dir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f)).sort();
  const months = files.map((f) => {
    const s = validateSchedule(JSON.parse(readFileSync(resolve(dir, f), 'utf8')));
    return { month: s.month, file: f, updatedAt: s.updatedAt ?? '' };
  });
  const version = flag('version') ?? JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
  const app = { latest: version, apk: flag('apk') ?? '', ...(flag('notes') ? { notes: flag('notes') } : {}) };
  writeFileSync(resolve(dir, 'index.json'), JSON.stringify({ generatedAt: new Date().toISOString(), months, app }, null, 1) + '\n');
  const imports = months.map((m, i) => `import m${i} from '../../schedule/${m.file}';`).join('\n');
  writeFileSync(
    resolve(root, 'src/data/bundled.ts'),
    `// Generado por scripts/schedule.mjs build. No editar a mano.\nimport type { MonthSchedule } from '../core/schedule';\n${imports}\n\nexport const bundled = [${months.map((_, i) => `m${i}`).join(', ')}] as unknown as MonthSchedule[];\n`,
  );
  console.log(`index.json y bundled.ts listos: ${months.map((m) => m.month).join(', ')}`);
} else {
  die('comandos: from-table | rotate | build');
}
