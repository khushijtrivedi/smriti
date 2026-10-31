import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Lesson, LessonStep } from './type';
import { ARROWS, LAYOUT, ONE, POSES, RING, columnTop, loopX, ringPoint, ringX, stitchAngle, yarnOnHook } from './scene/layout';
import { materials, tube } from './scene/shared';
import Hook from './scene/Hook';
import Row from './scene/Row';
import Chains from './scene/Chains';
import Ring from './scene/Ring';

export default function LessonScene({ lesson, step }: { lesson: Lesson; step: LessonStep }) {
  const poses = lesson.row || lesson.ring ? POSES.row : POSES.chain;
  const ringR = step.closed ? RING.closed : RING.open;
  const bare = step.loops === 0 && !step.wrap; // magic ring, before the first loop

  const hookRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const yarnRef = useRef<THREE.Mesh>(null);
  const linkRef = useRef<THREE.Mesh>(null);
  const focusRef = useRef<THREE.Mesh>(null);

  // Current (animated) hook pose and yarn points
  const cur = useRef({
    pos: poses[step.pose].pos.clone(),
    rot: poses[step.pose].rot.clone(),
    yarn: [LAYOUT.ball, LAYOUT.finger, ...yarnOnHook(step.wrap, loopX(0))].map((p) => p.clone()),
  });

  const arrow = useMemo(() => {
    if (!step.arrow) return null;
    const [from, to] = ARROWS[step.arrow];
    const dir = to.clone().sub(from);
    return new THREE.ArrowHelper(dir.clone().normalize(), from, dir.length(), 0xc2410c, 0.18, 0.12);
  }, [step.arrow]);

  useFrame((_, dt) => {
    const c = cur.current;
    const slow = 1 - Math.exp(-dt * 4); // the hook moves
    const fast = 1 - Math.exp(-dt * 14); // the yarn follows

    // 1. Hook glides to this step's pose
    const target = poses[step.pose];
    c.pos.lerp(target.pos, slow);
    c.rot.slerp(target.rot, slow);
    const hookM = new THREE.Matrix4().compose(c.pos, c.rot, ONE);
    hookRef.current?.position.copy(c.pos);
    hookRef.current?.quaternion.copy(c.rot);

    // 2. Loops glide along the hook
    ringRefs.current.forEach((ring, i) => {
      if (ring) ring.position.x += (ringX(i, step.sliding) - ring.position.x) * slow;
    });
    const fx = ringRefs.current[0]?.position.x ?? loopX(0);

    // 3. Working yarn: ball and finger stay put, the rest follows the hook
    const yarnTargets = bare
      ? [LAYOUT.ball, LAYOUT.finger, new THREE.Vector3(2.9, 0.2, -0.5), ringPoint(0.3, ringR).add(new THREE.Vector3(0.3, 0.2, 0)), ringPoint(0.2, ringR), ringPoint(0.1, ringR)]
      : [LAYOUT.ball, LAYOUT.finger, ...yarnOnHook(step.wrap, fx).map((p) => p.applyMatrix4(hookM))];
    c.yarn.forEach((p, i) => {
      const t = yarnTargets[i];
      if (t) p.lerp(t, fast);
    });
    if (yarnRef.current) {
      yarnRef.current.geometry.dispose();
      yarnRef.current.geometry = tube(c.yarn);
    }

    // 4. Strand from the front loop down to the work (or the slip knot tail)
    const front = new THREE.Vector3(fx, -0.2, 0).applyMatrix4(hookM);
    let end: THREE.Vector3;
    if (lesson.ring) {
      end = step.leg || !step.ringSts ? ringPoint(Math.PI / 2, ringR) : ringPoint(stitchAngle(step.ringSts - 1), ringR);
    } else if (lesson.row) {
      end = step.built ? columnTop(step.built) : step.leg ? LAYOUT.stitch.clone().add(new THREE.Vector3(0, 0.15, 0)) : LAYOUT.rowEnd;
    } else {
      end = step.chains ? LAYOUT.chainTop.clone().add(new THREE.Vector3(0, -0.05, 0)) : new THREE.Vector3(front.x, -1.5, 0.03);
    }
    const mid = front.clone().lerp(end, 0.5).add(new THREE.Vector3(0.05, -0.12, 0.03));
    if (linkRef.current) {
      linkRef.current.geometry.dispose();
      linkRef.current.geometry = tube([front, mid, end]);
      linkRef.current.visible = !bare;
    }

    // 5. Focus circle follows what it marks
    if (focusRef.current) {
      const f =
        step.focus === 'finger' ? LAYOUT.finger
        : step.focus === 'target' ? LAYOUT.stitch
        : step.focus === 'throat' ? LAYOUT.throat.clone().applyMatrix4(hookM)
        : front;
      focusRef.current.position.copy(f);
      focusRef.current.visible = !!step.focus;
    }
  });

  return (
    <group>
      <Hook
        hookRef={hookRef}
        ringRefs={ringRefs}
        ringCount={step.loops - (step.wrap ? 1 : 0)}
        ringKey={`${step.loops}-${step.chains}`}
      />

      <Text position={LAYOUT.fingerLabel} fontSize={0.16} color="#78716c" anchorX="center">
        over your finger
      </Text>

      <mesh ref={yarnRef} material={materials.yarn} />
      <mesh ref={linkRef} material={materials.yarn} />

      {lesson.ring ? (
        <Ring closed={step.closed} stitches={step.ringSts} />
      ) : lesson.row ? (
        <Row built={step.built} />
      ) : (
        <Chains count={step.chains} />
      )}

      <mesh ref={focusRef} material={materials.focus}>
        <sphereGeometry args={[0.22, 20, 14]} />
      </mesh>
      {arrow && <primitive object={arrow} />}
    </group>
  );
}