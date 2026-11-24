import type { Item, Round, RoundCheck, StitchName } from './type';

// stitches each instruction leaves on top of the round
const MADE: Record<StitchName, number> = { sc: 1, hdc: 1, dc: 1, inc: 2, dec: 1, ch: 0, slst: 0 };

export function countItems(items: Item[], prev: number): number {
  return items.reduce((sum, it) => {
    if (it.kind === 'repeat') return sum + countItems(it.items, prev) * it.times;
    return sum + MADE[it.stitch] * (it.place === 'each' ? prev : it.count);
  }, 0);
}

// "R0: 25 ch" — a starting chain that the next rounds are worked around
export function isFoundation(round: Round): boolean {
  return round.number === 0 && round.items.every((it) => it.kind === 'stitch' && it.stitch === 'ch');
}

// "3 ch, ..." at the start of a round stands in for the first stitch (2 ch = hdc, 3 ch = dc)
export function turningChain(round: Round): number {
  const first = round.items[0];
  return first?.kind === 'stitch' && first.stitch === 'ch' && first.count >= 2 ? first.count : 0;
}

function chains(items: Item[]): number {
  return items.reduce((sum, it) => sum + (it.kind === 'repeat' ? chains(it.items) * it.times : it.count), 0);
}

export function checkPattern(rounds: Round[]): RoundCheck[] {
  let prev = 0;
  return rounds.map((round) => {
    const actual = isFoundation(round) ? chains(round.items) : countItems(round.items, prev) + (turningChain(round) ? 1 : 0);
    prev = actual;
    const expected = round.count;
    return { number: round.number, line: round.line, actual, expected, ok: expected === null || expected === actual };
  });
}