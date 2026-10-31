import { describe, it, expect } from 'vitest';
import { parse } from './crochet.js';
import { checkPattern } from './count';
import type { Round } from './type.js';

const BALL = `R1: 6 sc in magic ring (6)
R2: inc in each st (12)
R3: [sc, inc] x6 (18)
R4: [2 sc, inc] x6 (24)
R5: sc in each st (24)`;

describe('crochet parser', () => {
  it('counts stitches per round', () => {
    const rounds: Round[] = parse(BALL);
    expect(checkPattern(rounds).map((r) => r.actual)).toEqual([6, 12, 18, 24, 24]);
  });

  it('flags a wrong count', () => {
    const rounds: Round[] = parse('R1: 6 sc in mr (6)\nR2: [sc, inc] x6 (17)');
    expect(checkPattern(rounds)[1]?.ok).toBe(false);
  });
});