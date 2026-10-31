import { Matrix4, Vector3 } from 'three';
import { expandItems, type Round, type RoundCheck } from '@smriti/parser';
import type { PlacedStitch } from './type';
const W = 0.32; // stitch width
const H = 0.38; // stitch height

export function placeStitches(rounds: Round[], checks: RoundCheck[]) {
  // Ring radius from stitch count; height step is what's left of one stitch height
  const prof = [{ r: 0, y: 0 }];
  checks.forEach((c) => {
    const prev = prof[prof.length - 1]!;
    const r = (c.actual * W) / (2 * Math.PI);
    const dr = r - prev.r;
    prof.push({ r, y: prev.y + Math.sqrt(Math.max(H * H - dr * dr, 0.12 * H * H)) });
  });

  const stitches: PlacedStitch[] = [];
  rounds.forEach((round, i) => {
    const a = prof[i]!;
    const b = prof[i + 1]!;
    const rm = (a.r + b.r) / 2;
    const ym = (a.y + b.y) / 2;
    const len = Math.hypot(b.r - a.r, b.y - a.y);
    const ur = (b.r - a.r) / len;
    const uy = (b.y - a.y) / len;

    // One loop per instruction, two for an increase
    const loops = expandItems(round.items, checks[i - 1]?.actual ?? 0).flatMap((st, j) =>
      st === 'inc' ? [j, j] : [j],
    );
    const n = loops.length;
    const sx = Math.max((2 * Math.PI * rm) / n, 0.12) * 1.02;

    loops.forEach((instr, k) => {
      const phi = (2 * Math.PI * (k + 0.5 * (i % 2))) / n;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      const t = new Vector3(s, 0, -c); // along the round
      const u = new Vector3(ur * c, uy, ur * s); // up the fabric
      const out = new Vector3().crossVectors(t, u).normalize();
      const matrix = new Matrix4()
        .makeBasis(t.multiplyScalar(sx), u.multiplyScalar(len * 1.08), out.multiplyScalar(W))
        .setPosition(rm * c, ym, rm * s);
      stitches.push({ round: i, instr, matrix });
    });
  });

  return { stitches, height: prof[prof.length - 1]!.y };
}