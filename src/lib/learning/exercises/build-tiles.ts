/** Resolve built sentence from bank indexes (supports duplicate tile labels). */
export function resolveBuiltTiles(
  bank: readonly string[],
  bankIndexes: readonly number[],
): string[] {
  return bankIndexes.map((index) => bank[index] ?? "");
}

export function isBankTileUsed(
  bankIndexes: readonly number[],
  bankIndex: number,
): boolean {
  return bankIndexes.includes(bankIndex);
}

/** Check when the built length matches the expected answer (distractors stay unused). */
export function canCheckBuild(builtLength: number, answerLength: number): boolean {
  return answerLength > 0 && builtLength === answerLength;
}

export function gradeBuild(built: readonly string[], answer: readonly string[]): boolean {
  return (
    built.length === answer.length && answer.every((tile, index) => tile === built[index])
  );
}
