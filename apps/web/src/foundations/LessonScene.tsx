import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Arrow, HookPose, Lesson, LessonStep } from './type';

const metal = new THREE.MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.5, roughness: 0.35 });
const handleMat = new THREE.MeshStandardMaterial({ color: '#a9b8a0', roughness: 0.6 });
const yarnMat = new THREE.MeshStandardMaterial({ color: '#d6a1a5', roughness: 0.9 });
const rowMat = new THREE.MeshStandardMaterial({ color: '#c8a9ab', roughness: 0.9 });
const focusMat = new THREE.MeshBasicMaterial({ color: '#c2410c', transparent: true, opacity: 0.15, depthWrite: false });

// Hook head: side profile with the throat cut in underneath, extruded
const headShape = new THREE.Shape();
headShape.moveTo(1.6, 0.1);
headShape.lineTo(2.05, 0.1);
headShape.quadraticCurveTo(2.26, 0.1, 2.26, -0.02);
headShape.quadraticCurveTo(2.24, -0.13, 2.08, -0.13);
headShape.lineTo(1.9, -0.13);
headShape.lineTo(2.03, -0.02);
headShape.lineTo(1.84, -0.02);
headShape.lineTo(1.76, -0.1);
headShape.lineTo(1.6, -0.1);
headShape.closePath();
const headGeo = new THREE.ExtrudeGeometry(headShape, {
  depth: 0.14,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.02,
  bevelSegments: 3,
  curveSegments: 16,
});
headGeo.translate(0, 0, -0.07);

// Layout
const X = new THREE.Vector3(1, 0, 0);
const Z = new THREE.Vector3(0, 0, 1);
const ONE = new THREE.Vector3(1, 1, 1);
const BALL = new THREE.Vector3(3.9, -2.4, -2.8);
const FINGER = new THREE.Vector3(3.0, 1.06, -0.7);
const TARGET = new THREE.Vector3(2.0, -1.0, 0);
const ROW_END = new THREE.Vector3(1.6, -0.95, 0);
const PITCH_IN = -0.75;
const loopX = (i: number) => 1.3 - i * 0.17;
// Where the old loop sits when it comes off the tip: chains form here and stay put
const CHAIN_TOP = new THREE.Vector3(-0.4 + 1.78, -0.2, 0.03);

const IN_ROT = new THREE.Quaternion().setFromAxisAngle(Z, PITCH_IN);
const TARGET_ROT = new THREE.Quaternion().setFromUnitVectors(Z, new THREE.Vector3(Math.cos(PITCH_IN), Math.sin(PITCH_IN), 0));
const CATCH = new THREE.Quaternion().setFromAxisAngle(X, -0.6);
const IN_POS = TARGET.clone().sub(new THREE.Vector3(2, 0, 0).applyQuaternion(IN_ROT));
const IN_DIR = new THREE.Vector3(1, 0, 0).applyQuaternion(IN_ROT);
const pose = (x: number, y: number, rot = new THREE.Quaternion()) => ({ pos: new THREE.Vector3(x, y, 0), rot });

// Shared poses for working into a stitch
const IN_POSES = {
  inserted: { pos: IN_POS, rot: IN_ROT },
  insertedCaught: { pos: IN_POS, rot: IN_ROT.clone().multiply(CATCH) },
  pullingOut: { pos: IN_POS.clone().addScaledVector(IN_DIR, -0.35), rot: IN_ROT },
};

// Chain: unchanged
const CHAIN_POSES: Record<HookPose, { pos: THREE.Vector3; rot: THREE.Quaternion }> = {
  rest: pose(0, 0),
  yo: pose(0.3, 0.1),
  caught: pose(0.3, 0.1, CATCH),
  pulled: pose(-0.4, 0),
  off: pose(-0.9, 0),
  ...IN_POSES,
};

// Row stitches: the hook works right above the stitch, so loops come off where the stitch forms
const ROW_POSES: Record<HookPose, { pos: THREE.Vector3; rot: THREE.Quaternion }> = {
  rest: pose(0.2, 0),
  yo: pose(0.45, 0.1),
  caught: pose(0.45, 0.1, CATCH),
  pulled: pose(0.22, 0),
  off: pose(-0.28, 0),
  ...IN_POSES,
};

const ARROWS: Record<Arrow, [THREE.Vector3, THREE.Vector3]> = {
  forward: [new THREE.Vector3(1.9, -0.4, 0.35), new THREE.Vector3(2.4, -0.25, 0.35)],
  back: [new THREE.Vector3(2.3, -0.5, 0.35), new THREE.Vector3(1.6, -0.5, 0.35)],
  down: [new THREE.Vector3(2.35, -0.15, 0.3), new THREE.Vector3(2.2, -0.7, 0.3)],
  out: [new THREE.Vector3(2.25, -0.9, 0.3), new THREE.Vector3(1.9, -0.55, 0.3)],
};

function yarnOnHook(wrap: boolean, fx: number): THREE.Vector3[] {
  return wrap
    ? [new THREE.Vector3(1.95, 0.14, -0.08), new THREE.Vector3(1.95, -0.02, 0.13), new THREE.Vector3(fx + 0.15, -0.2, 0.08), new THREE.Vector3(fx, -0.2, 0)]
    : [new THREE.Vector3(2.3, 0.4, -0.5), new THREE.Vector3(fx + 0.1, 0, -0.2), new THREE.Vector3(fx, -0.2, -0.02), new THREE.Vector3(fx, -0.2, 0)];
}

// Where each loop sits on the hook: sliding loops move up to the tip
const ringX = (i: number, sliding: number) => (i < sliding ? 1.78 - i * 0.13 : loopX(i));

const tube = (pts: THREE.Vector3[]) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.06, 10, false);

export default function LessonScene({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
      const POSES = lesson.row ? ROW_POSES : CHAIN_POSES;
  const hookRef = useRef<THREE.Group>(null);
  const yarnRef = useRef<THREE.Mesh>(null);
  const linkRef = useRef<THREE.Mesh>(null);
  const focusRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const cur = useRef({
    pos: POSES[step.pose].pos.clone(),
    rot: POSES[step.pose].rot.clone(),
    yarn: [BALL, FINGER, ...yarnOnHook(step.wrap, loopX(0))].map((v) => v.clone()),
  });

  const ringCount = step.loops - (step.wrap ? 1 : 0);
  const postTop = useMemo(() => new THREE.Vector3(TARGET.x, TARGET.y + 0.15 + lesson.postHeight, 0), [lesson.postHeight]);

  const arrow = useMemo(() => {
    if (!step.arrow) return null;
    const [from, to] = ARROWS[step.arrow];
    const dir = to.clone().sub(from);
    return new THREE.ArrowHelper(dir.clone().normalize(), from, dir.length(), 0xc2410c, 0.18, 0.12);
  }, [step.arrow]);

  // Tail hanging below the finished chains
  const chainTail = useMemo(() => {
    if (!step.chains) return null;
    const y0 = -0.22 - (step.chains - 1) * 0.34 - 0.22;
    return tube([new THREE.Vector3(0, y0, 0), new THREE.Vector3(0.02, y0 - 0.5, 0.05), new THREE.Vector3(0, y0 - 1, 0.07)]);
  }, [step.chains]);

  useFrame((_, dt) => {
    const c = cur.current;
    const slow = 1 - Math.exp(-dt * 4);
    const fast = 1 - Math.exp(-dt * 14);

    // Hook glides to this step's pose
    const pose = POSES[step.pose];
    c.pos.lerp(pose.pos, slow);
    c.rot.slerp(pose.rot, slow);
    const hookM = new THREE.Matrix4().compose(c.pos, c.rot, ONE);
    if (hookRef.current) {
      hookRef.current.position.copy(c.pos);
      hookRef.current.quaternion.copy(c.rot);
    }

    // Loops glide along the hook
    ringRefs.current.forEach((ring, i) => {
      if (ring) ring.position.x += (ringX(i, step.sliding) - ring.position.x) * slow;
    });
    const fx = ringRefs.current[0]?.position.x ?? loopX(0);

    // Working yarn: ball and finger stay put, the rest follows the hook
    const targets = [BALL, FINGER, ...yarnOnHook(step.wrap, fx).map((v) => v.applyMatrix4(hookM))];
    c.yarn.forEach((v, i) => {
      const t = targets[i];
      if (t) v.lerp(t, fast);
    });
    if (yarnRef.current) {
      yarnRef.current.geometry.dispose();
      yarnRef.current.geometry = tube(c.yarn);
    }

    // Strand from the front loop down to the work (or the slip knot tail)
    const front = new THREE.Vector3(fx, -0.2, 0).applyMatrix4(hookM);
    let end: THREE.Vector3;
    if (lesson.row) {
      end = step.leg ? TARGET.clone().add(new THREE.Vector3(0, 0.15, 0)) : step.done ? postTop : ROW_END;
    } else {
      end = step.chains ? CHAIN_TOP.clone().add(new THREE.Vector3(0, -0.05, 0)) : new THREE.Vector3(front.x, -1.5, 0.03);
    }
    const mid = front.clone().lerp(end, 0.5).add(new THREE.Vector3(0.05, -0.12, 0.03));
    if (linkRef.current) {
      linkRef.current.geometry.dispose();
      linkRef.current.geometry = tube([front, mid, end]);
    }

    // Focus circle follows what it marks
    if (focusRef.current) {
      const f =
        step.focus === 'finger' ? FINGER
        : step.focus === 'target' ? TARGET
        : step.focus === 'throat' ? new THREE.Vector3(1.95, 0, 0).applyMatrix4(hookM)
        : front;
      focusRef.current.position.copy(f);
      focusRef.current.visible = !!step.focus;
    }
  });

  return (
    <group>
      {/* Hook with the loops on it */}
      <group ref={hookRef}>
        <mesh rotation-z={Math.PI / 2} position-x={0.45} material={metal}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 20]} />
        </mesh>
        <mesh geometry={headGeo} material={metal} />
        <mesh rotation-z={Math.PI / 2} position-x={-1.7} material={handleMat}>
          <cylinderGeometry args={[0.18, 0.18, 1.8, 20]} />
        </mesh>
        {Array.from({ length: ringCount }, (_, i) => (
          <mesh
            key={`${step.loops}-${step.chains}-${i}`}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            position-x={loopX(i)}
            rotation-y={Math.PI / 2}
            material={yarnMat}
          >
            <torusGeometry args={[0.2, 0.06, 10, 24]} />
          </mesh>
        ))}
      </group>

      <Text position={[3.05, 1.3, -0.7]} fontSize={0.16} color="#78716c" anchorX="center">
        over your finger
      </Text>

      <mesh ref={yarnRef} material={yarnMat} />
      <mesh ref={linkRef} material={yarnMat} />

      {/* Row to work into, and the finished stitch */}
      {lesson.row && (
        <group>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[i * 0.32, -1.05, 0]} rotation-x={i % 2 ? Math.PI / 2 : 0} scale-x={1.35} material={rowMat}>
              <torusGeometry args={[0.16, 0.06, 10, 24]} />
            </mesh>
          ))}
          <mesh position={TARGET} quaternion={TARGET_ROT} material={rowMat}>
            <torusGeometry args={[0.2, 0.06, 10, 24]} />
          </mesh>
          {step.done && lesson.postHeight > 0 && (
            <mesh position={[TARGET.x, TARGET.y + 0.15 + lesson.postHeight / 2, 0]} material={yarnMat}>
              <capsuleGeometry args={[0.1, lesson.postHeight, 6, 12]} />
            </mesh>
          )}
        </group>
      )}

      {/* Finished chains + tail: fixed where the old loop came off the tip */}
      <group position={CHAIN_TOP}>
        {Array.from({ length: step.chains }, (_, i) => (
          <mesh key={i} position={[0, -0.22 - i * 0.34, 0]} rotation-y={i % 2 ? Math.PI / 2 : 0} scale-y={1.4} material={yarnMat}>
            <torusGeometry args={[0.16, 0.06, 10, 24]} />
          </mesh>
        ))}
        {chainTail && <mesh geometry={chainTail} material={yarnMat} />}
      </group>

      {/* Where to look, and which way the hook moves */}
      <mesh ref={focusRef} material={focusMat}>
        <sphereGeometry args={[0.22, 20, 14]} />
      </mesh>
      {arrow && <primitive object={arrow} />}
    </group>
  );
}