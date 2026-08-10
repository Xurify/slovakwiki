/** Classic Levenshtein over Unicode code points. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const aChars = [...a];
  const bChars = [...b];
  const rows = aChars.length + 1;
  const cols = bChars.length + 1;
  const prev = new Array<number>(cols);
  const curr = new Array<number>(cols);

  for (let j = 0; j < cols; j++) prev[j] = j;

  for (let i = 1; i < rows; i++) {
    curr[0] = i;
    const aChar = aChars[i - 1]!;
    for (let j = 1; j < cols; j++) {
      const cost = aChar === bChars[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (curr[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
    }
    for (let j = 0; j < cols; j++) prev[j] = curr[j] ?? 0;
  }

  return prev[bChars.length] ?? 0;
}
