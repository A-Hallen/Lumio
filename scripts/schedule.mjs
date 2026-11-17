#!/usr/bin/env node
// Herramienta para mantener los horarios de Lumio.
//
//   node scripts/schedule.mjs from-table 2026-12 tabla.txt   # una fila por dia, 8 circuitos separados por espacios
//   node scripts/schedule.mjs from-circuits 2026-12 tabla.txt [--merge]   # la tabla oficial copiada tal cual ("CTO 1", filas de dias y horas)
//   node scripts/schedule.mjs rotate 2026-12                 # genera el mes continuando la rotacion 19,21,1,20,2
//   node scripts/schedule.mjs build [--version 0.2.0 --apk URL --notes "texto" --min 0.2.0|none]
//
// `build` valida todos los meses, escribe schedule/index.json y regenera src/data/bundled.ts.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchedule } from '../src/core/validate.ts';
import { parseCircuitTable, slotsToRanges } from '../src/core/ranges.ts';

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

function saveMonth(month, circuits, days, source, version) {
  const doc = {
    version,
    month,
    timezone: 'America/Havana',
    meaning: 'light',
    updatedAt: new Date().toISOString(),
    source,
    slots: SLOTS,
    circuits,
    days,
  };
  try {
    validateSchedule(doc);
  } catch (e) {
    die(e.message);
  }
  writeFileSync(resolve(dir, `${month}.json`), JSON.stringify(doc, null, 1) + '\n');
  console.log(`escrito schedule/${month}.json (${Object.keys(days).length} dias)`);
}

// Formato por tramo (el de las apps 0.1.x): una fila por dia con el circuito de cada tramo.
function writeMonth(month, rows, source) {
  const days = Object.fromEntries(rows.map((r, i) => [String(i + 1), r]));
  saveMonth(month, [...new Set(rows.flat(2))].sort((a, b) => a - b), days, source, 1);
}

if (cmd === 'from-table') {
  const [month, file] = args;
  if (!/^\d{4}-\d{2}$/.test(month ?? '') || !file) die('uso: from-table AAAA-MM archivo.txt');
  const rows = readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.replace(/Cto/gi, '').trim())
    .filter(Boolean)
    // "20+21" = dos circuitos con luz en el mismo tramo
    .map((l) => l.split(/[\s,;]+/).map((t) => (t.includes('+') ? t.split('+').map(Number) : Number(t))));
  if (rows.length !== daysIn(month)) die(`${month} tiene ${daysIn(month)} dias y el archivo trae ${rows.length} filas`);
  writeMonth(month, rows, 'tabla pegada a mano');
} else if (cmd === 'from-circuits') {
  // La tabla oficial copiada tal cual (ver parseCircuitTable). Con --merge conserva los dias que la tabla no trae.
  const [month, file] = args;
  if (!/^\d{4}-\d{2}$/.test(month ?? '') || !file) die('uso: from-circuits AAAA-MM archivo.txt [--merge]');
  let table;
  try {
    table = parseCircuitTable(readFileSync(file, 'utf8'));
  } catch (e) {
    die(e.message);
  }
  let { circuits, days } = table;
  if (args.includes('--merge')) {
    const path = resolve(dir, `${month}.json`);
    if (!existsSync(path)) die(`--merge necesita schedule/${month}.json`);
    const prev = validateSchedule(JSON.parse(readFileSync(path, 'utf8')));
    if (prev.meaning !== 'light') die('--merge solo funciona con horarios de tipo "light"');
    circuits = [...new Set([...prev.circuits, ...circuits])].sort((a, b) => a - b);
    for (let d = 1; d <= daysIn(month); d++) {
      if (days[String(d)]) continue;
      const row = prev.days[String(d)];
      days[String(d)] = Object.fromEntries(
        circuits.map((c) => [String(c), slotsToRanges(row.map((cell) => (Array.isArray(cell) ? cell.includes(c) : cell === c)))]),
      );
    }
  }
  saveMonth(month, circuits, days, `tabla de circuitos de la empresa (${args.includes('--merge') ? 'combinada con el horario anterior' : 'completa'})`, 2);
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
  // La version minima obligatoria sobrevive a los lanzamientos: solo cambia con --min X (o --min none para quitarla).
  const previous = existsSync(resolve(dir, 'index.json')) ? JSON.parse(readFileSync(resolve(dir, 'index.json'), 'utf8')) : {};
  const minVersion = flag('min') === 'none' ? undefined : (flag('min') ?? previous.app?.minVersion);
  if (minVersion !== undefined && !/^\d+\.\d+\.\d+$/.test(minVersion)) die(`--min debe ser una version como 0.2.0, no "${minVersion}"`);
  const app = {
    latest: version,
    apk: flag('apk') ?? '',
    ...(minVersion ? { minVersion } : {}),
    ...(flag('notes') ? { notes: flag('notes') } : {}),
  };
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
