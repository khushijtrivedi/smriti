import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { PlacedStitch } from './type';
import '@react-three/fiber';
const BASE = new THREE.Color('#d6a1a5');
const MARK = new THREE.Color('#ad7680');
const NOW = new THREE.Color('#874f59');
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

function leg(side: 1 | -1) {
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const curve = new THREE.CatmullRomCurve3([v(-0.02 * side, -0.5, 0.04), v(0.2 * side, 0, 0.24), v(0.44 * side, 0.48, 0.06)]);
  return new THREE.TubeGeometry(curve, 14, 0.17, 8, false);
}

// Twisted-ply texture so the legs read as yarn
function yarnBump() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 128, 64);
  for (let x = -64; x < 192; x += 10) {
    g.strokeStyle = '#d8d8d8';
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 40, 64); g.stroke();
    g.strokeStyle = '#3a3a3a';
    g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x + 5, 0); g.lineTo(x + 45, 64); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  return tex;
}

interface Props {
  stitches: PlacedStitch[];
  height: number;
  sel: number;
  step: number;
}

export default function YarnBall({ stitches, height, sel, step }: Props) {
  const left = useRef<THREE.InstancedMesh>(null);
  const right = useRef<THREE.InstancedMesh>(null);
  const legL = useMemo(() => leg(-1), []);
  const legR = useMemo(() => leg(1), []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.95, bumpMap: yarnBump(), bumpScale: 0.6 }),
    [],
  );

  useLayoutEffect(() => {
    for (const mesh of [left.current, right.current]) {
      if (!mesh) continue;
      stitches.forEach((s, i) => {
        const shown = s.round < sel || (s.round === sel && s.instr <= step);
        mesh.setMatrixAt(i, shown ? s.matrix : HIDDEN);
        mesh.setColorAt(i, s.round === sel ? (s.instr === step ? NOW : MARK) : BASE);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [stitches, sel, step]);

  return (
    <group position-y={-height / 2}>
      <instancedMesh ref={left} args={[legL, material, stitches.length]} />
      <instancedMesh ref={right} args={[legR, material, stitches.length]} />
    </group>
  );
}