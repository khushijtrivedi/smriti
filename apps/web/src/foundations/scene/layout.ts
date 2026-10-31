import * as THREE from 'three';
import type { Arrow, HookPose } from '../type';

const v = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);
const X = v(1, 0, 0);
const Z = v(0, 0, 1);
export const ONE = v(1, 1, 1);

// How steeply the hook goes into a stitch
const PITCH_IN = -0.75;
const IN_ROT = new THREE.Quaternion().setFromAxisAngle(Z, PITCH_IN);
const IN_DIR = v(1, 0, 0).applyQuaternion(IN_ROT);

// Every fixed position in the scene
export const LAYOUT = {
    ball: v(3.9, -2.4, -2.8), // yarn ball, behind and below
    finger: v(3.0, 1.06, -0.7), // where the yarn goes over your finger
    fingerLabel: v(3.05, 1.3, -0.7),
    stitch: v(2.0, -1.45), // the stitch to work into
    stitchRot: new THREE.Quaternion().setFromUnitVectors(Z, v(Math.cos(PITCH_IN), Math.sin(PITCH_IN))),
    rowEnd: v(1.6, -1.4),  // last stitch of the row
    chainTop: v(1.38, -0.2, 0.03), // where the old loop comes off the tip and becomes a chain
    throat: v(1.95, 0), // on the hook
    linkGap: 0.24,
};

// Top of a stitch that's `built` links tall
export const columnTop = (built: number) =>
    v(LAYOUT.stitch.x, LAYOUT.stitch.y + 0.3 + (built - 1) * LAYOUT.linkGap + 0.16);

// Loops on the hook (positions along the hook)
export const loopX = (i: number) => 1.3 - i * 0.17;
export const ringX = (i: number, sliding: number) => (i < sliding ? 1.78 - i * 0.13 : loopX(i));

// Working yarn points that ride on the hook
export function yarnOnHook(wrap: boolean, fx: number): THREE.Vector3[] {
    return wrap
        ? [v(1.95, 0.14, -0.08), v(1.95, -0.02, 0.13), v(fx + 0.15, -0.2, 0.08), v(fx, -0.2)]
        : [v(2.3, 0.4, -0.5), v(fx + 0.1, 0, -0.2), v(fx, -0.2, -0.02), v(fx, -0.2)];
}

// Hook poses
type Pose = { pos: THREE.Vector3; rot: THREE.Quaternion };
const at = (x: number, y: number, rot = new THREE.Quaternion()): Pose => ({ pos: v(x, y), rot });
const CATCH = new THREE.Quaternion().setFromAxisAngle(X, -0.6);
const IN_POS = LAYOUT.stitch.clone().sub(v(2, 0).applyQuaternion(IN_ROT));

const workingInto = {
    inserted: { pos: IN_POS, rot: IN_ROT },
    insertedCaught: { pos: IN_POS, rot: IN_ROT.clone().multiply(CATCH) },
    pullingOut: { pos: IN_POS.clone().addScaledVector(IN_DIR, -0.35), rot: IN_ROT },
};

export const POSES: Record<'chain' | 'row', Record<HookPose, Pose>> = {
    chain: { rest: at(0, 0), yo: at(0.3, 0.1), caught: at(0.3, 0.1, CATCH), pulled: at(-0.4, 0), off: at(-0.9, 0), ...workingInto },
    // Row stitches: the hook works right above the stitch, so loops come off where the stitch forms
    row: { rest: at(0.2, 0), yo: at(0.45, 0.1), caught: at(0.45, 0.1, CATCH), pulled: at(0.22, 0), off: at(-0.28, 0), ...workingInto },
};

// Arrows showing which way the hook moves
export const ARROWS: Record<Arrow, [THREE.Vector3, THREE.Vector3]> = {
    forward: [v(1.9, -0.4, 0.35), v(2.4, -0.25, 0.35)],
    back: [v(2.3, -0.5, 0.35), v(1.6, -0.5, 0.35)],
    down: [v(2.35, -0.6, 0.3), v(2.2, -1.15, 0.3)],
    out: [v(2.25, -1.35, 0.3), v(1.9, -1.0, 0.3)],
};
// Magic ring: faces you, tilted a little toward the hook
export const RING = {
    rot: new THREE.Quaternion().setFromUnitVectors(Z, v(Math.cos(PITCH_IN), Math.sin(PITCH_IN)).multiplyScalar(0.6).add(Z).normalize()),
    open: 0.5, // radius before closing
    closed: 0.14, // radius after pulling the tail
};

// A point on the ring's edge
export const ringPoint = (angle: number, radius: number) =>
    v(Math.cos(angle) * radius, Math.sin(angle) * radius).applyQuaternion(RING.rot).add(LAYOUT.stitch);

// Where the n-th stitch sits around the ring (6 per round, starting at the top)
export const stitchAngle = (i: number) => Math.PI / 2 + (i * Math.PI) / 3;