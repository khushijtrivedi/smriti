import type { Item, Round, RoundCheck, StitchName } from './type';

const MADE: Record<StitchName, number> = { sc: 1, hdc: 1, dc: 1, inc: 2, dec: 1, ch: 0, slst: 0 };

function countItems(items: Item[], prev: number): number {
  return items.reduce((sum, item) => {
    if (item.kind === 'repeat') return sum + countItems(item.items, prev) * item.times;
    const times = item.place === 'each' ? prev : item.count;
    return sum + MADE[item.stitch] * times;
  }, 0);
}

export function checkPattern(rounds: Round[]): RoundCheck[] {
  let prev = 0;
  return rounds.map((r) => {
    const actual = countItems(r.items, prev);
    prev = actual;
    return { number: r.number, line: r.line, actual, expected: r.count, ok: r.count === null || r.count === actual };
  });
}