import { describe, it, expect } from 'vitest';
import { parse } from './crochet.js';
import { checkPattern } from './count';
import type { Part } from './type';

const BALL = `R1: 6 sc in magic ring (6)
R2: inc in each st (12)
R3: [sc, inc] x6 (18)
R4: [2 sc, inc] x6 (24)
R5: sc in each st (24)`;

const FLOWER = `Center:
R1: 6 sc in magic ring (6)
R2: inc in each st (12)

Petal (make 5):
R1: 6 sc in magic ring (6)
R2: [sc, inc] x3 (9)`;

describe('crochet parser', () => {
  it('counts stitches per round', () => {
    const [part]: Part[] = parse(BALL);
    expect(checkPattern(part!.rounds).map((r) => r.actual)).toEqual([6, 12, 18, 24, 24]);
  });

  it('flags a wrong count', () => {
    const [part]: Part[] = parse('R1: 6 sc in mr (6)\nR2: [sc, inc] x6 (17)');
    expect(checkPattern(part!.rounds)[1]?.ok).toBe(false);
  });

  it('reads parts with headings and "make N"', () => {
    const parts: Part[] = parse(FLOWER);
    expect(parts.map((p) => [p.name, p.make, p.rounds.length])).toEqual([
      ['Center', 1, 2],
      ['Petal', 5, 2],
    ]);
  });
});