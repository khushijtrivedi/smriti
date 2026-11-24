import { Matrix4, Vector2, Vector3 } from 'three';
import { expandItems, isFoundation, turningChain } from '@smriti/parser';
import type { Round, RoundCheck, StitchName } from '@smriti/parser';
import type { PlacedStitch } from './type';

const W = 0.32; // stitch width
const H = 0.3; // height of one sc
const HEIGHT: Record<StitchName, number> = { sc: 1, hdc: 1.5, dc: 2, inc: 1, dec: 1, slst: 0.4, ch: 0.5 };
const REAL: StitchName[] = ['sc', 'hdc', 'dc'];

interface Loop { instr: number; kind: StitchName; }

// every stitch that ends up on top of a round: which instruction made it, and how tall it is
function loopsOf(round: Round, prev: number): Loop[] {
  const instr = expandItems(round.items, prev);
  const loops: Loop[] = [];
  let i = 0;
  if (instr[0] === 'ch') {
    const turn = turningChain(round);
    if (turn) loops.push({ instr: 0, kind: turn === 2 ? 'hdc' : 'dc' });
    while (instr[i] === 'ch') i++;
  }
  let last: StitchName | null = null;
  for (; i < instr.length; i++) {
    const st = instr[i];
    if (REAL.includes(st)) {
      last = st;
      loops.push({ instr: i, kind: st });
    } else if (st === 'inc' || st === 'dec') {
      // inc/dec are worked in the stitch around them
      const kind = last ?? instr.slice(i).find((s) => REAL.includes(s)) ?? 'sc';
      loops.push({ instr: i, kind });
      if (st === 'inc') loops.push({ instr: i, kind });
    } else {
      loops.push({ instr: i, kind: st });
    }
  }
  return loops;
}

function stitchMatrix(t: Vector3, u: Vector3, width: number, height: number, pos: Vector3): Matrix4 {
  const out = new Vector3().crossVectors(t, u).normalize().multiplyScalar(W);
  return new Matrix4().makeBasis(t.clone().multiplyScalar(width), u.clone().multiplyScalar(height), out).setPosition(pos);
}

// n evenly spaced points along a closed outline, with the direction of travel
function sample(outline: Vector2[], n: number) {
  const seg = outline.map((p, i) => p.distanceTo(outline[(i + 1) % outline.length]));
  const total = seg.reduce((a, b) => a + b, 0);
  return Array.from({ length: n }, (_, j) => {
    let s = ((j + 0.5) / n) * total;
    let i = 0;
    while (i < seg.length - 1 && s > seg[i]) s -= seg[i++];
    const a = outline[i], b = outline[(i + 1) % outline.length];
    return { p: a.clone().lerp(b, seg[i] ? s / seg[i] : 0), t: b.clone().sub(a).normalize(), w: total / n };
  });
}

// worked around a starting chain: a flat piece (petal, leaf)
function placeFlat(rounds: Round[], checks: RoundCheck[]) {
  const N = checks[0].actual;
  const L = N * W;
  // u runs along the chain, v across it
  const raw: { round: number; instr: number; at: Vector2; t: Vector2; n: Vector2; h: number; w: number }[] = [];
  for (let k = 0; k < N; k++) raw.push({ round: 0, instr: k, at: new Vector2((k + 0.5) * W, 0), t: new Vector2(1, 0), n: new Vector2(0, 1), h: H * HEIGHT.ch, w: W });

  // the chain as a thin loop: up one side, back down the other
  let outline = Array.from({ length: 240 }, (_, i) => {
    const th = Math.PI - (i / 240) * 2 * Math.PI;
    return new Vector2(L / 2 + (L / 2) * Math.cos(th), 0.04 * Math.sin(th));
  });
  rounds.slice(1).forEach((round, ri) => {
    const i = ri + 1;
    const loops = loopsOf(round, checks[i - 1].actual);
    const pts = sample(outline, loops.length);
    outline = loops.map((lp, j) => {
      const { p, t, w } = pts[j];
      const n = new Vector2(-t.y, t.x);
      const h = H * HEIGHT[lp.kind];
      raw.push({ round: i, instr: lp.instr, at: p.clone().addScaledVector(n, h / 2), t, n, h, w });
      return p.clone().addScaledVector(n, h);
    });
  });

  // stand it up: chain along y, starting at 0, centred on x
  const xs = raw.map((s) => s.at.y), ys = raw.map((s) => s.at.x);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const minY = Math.min(...ys);
  const stitches: PlacedStitch[] = raw.map((s) => ({
    round: s.round,
    instr: s.instr,
    matrix: stitchMatrix(new Vector3(s.t.y, s.t.x, 0), new Vector3(s.n.y, s.n.x, 0), Math.max(s.w, 0.1) * 1.02, s.h * 1.08, new Vector3(s.at.y - cx, s.at.x - minY, 0)),
  }));
  return { stitches, height: Math.max(...ys) - minY, radius: (Math.max(...xs) - Math.min(...xs)) / 2, flat: true };
}

// worked in the round from a magic ring: a cup / ball
function placeRound(rounds: Round[], checks: RoundCheck[]) {
  const loopsPer = rounds.map((round, i) => loopsOf(round, checks[i - 1]?.actual ?? 0));
  const prof = [{ r: 0, y: 0 }];
  for (const loops of loopsPer) {
    const p = prof[prof.length - 1];
    const r = (loops.length * W) / (2 * Math.PI);
    const h = H * 1.25 * (loops.reduce((a, l) => a + HEIGHT[l.kind], 0) / Math.max(loops.length, 1));
    const dr = r - p.r;
    prof.push({ r, y: p.y + Math.sqrt(Math.max(h * h - dr * dr, 0.12 * h * h)) });
  }
  const stitches: PlacedStitch[] = [];
  loopsPer.forEach((loops, i) => {
    const a = prof[i], b = prof[i + 1];
    const rm = (a.r + b.r) / 2, ym = (a.y + b.y) / 2;
    const len = Math.hypot(b.r - a.r, b.y - a.y);
    const ur = (b.r - a.r) / len, uy = (b.y - a.y) / len;
    const sx = Math.max((2 * Math.PI * rm) / loops.length, 0.12) * 1.02;
    loops.forEach((lp, k) => {
      const phi = (2 * Math.PI * (k + 0.5 * (i % 2))) / loops.length;
      const c = Math.cos(phi), s = Math.sin(phi);
      stitches.push({
        round: i,
        instr: lp.instr,
        matrix: stitchMatrix(new Vector3(s, 0, -c), new Vector3(ur * c, uy, ur * s), sx, len * 1.08, new Vector3(rm * c, ym, rm * s)),
      });
    });
  });
  const widest = Math.max(0, ...loopsPer.map((l) => l.length));
  return { stitches, height: prof[prof.length - 1].y, radius: (widest * W) / (2 * Math.PI), flat: false };
}

export function placeStitches(rounds: Round[], checks: RoundCheck[]) {
  return rounds[0] && isFoundation(rounds[0]) ? placeFlat(rounds, checks) : placeRound(rounds, checks);
}