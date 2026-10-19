export const CARDS_BEFORE_RETRY = 3;

export const MAX_RETRIES_PER_SESSION = 4;

export function insertRetryCard<T>(
  queue: readonly T[],
  missedIndex: number,
  retry: T,
): T[] {
  const at = Math.min(missedIndex + 1 + CARDS_BEFORE_RETRY, queue.length);
  return [...queue.slice(0, at), retry, ...queue.slice(at)];
}

export function drawWithNewSentence<T>(
  draw: () => T,
  sentence: (item: T) => string | undefined,
  missed: T,
  attempts = 8,
): T {
  let candidate = draw();
  for (let tries = 1; tries < attempts; tries += 1) {
    if (sentence(candidate) !== sentence(missed)) return candidate;
    candidate = draw();
  }
  return candidate;
}
