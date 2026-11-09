/** Circuito guardado -> numero valido, o null si no hay ninguno elegido o ya no existe en los horarios. */
export function parseCircuit(raw: string | null, valid: number[]): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isInteger(n) && valid.includes(n) ? n : null;
}
