import type { Matrix4 } from 'three';

export interface PlacedStitch {
  round: number;
  instr: number;
  matrix: Matrix4;
}