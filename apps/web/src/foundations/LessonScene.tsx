import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { LessonStep } from './type';

const metal = new THREE.MeshStandardMaterial({ color: '#9aa0a8', metalness: 0.5, roughness: 0.35 });
const handleMat = new THREE.MeshStandardMaterial({ color: '#a9b8a0', roughness: 0.6 });
const focusMat = new THREE.MeshBasicMaterial({ color: '#c2410c', transparent: true, opacity: 0.15, depthWrite: false });

const target = new THREE.Vector3();
const hookMatrix = new THREE.Matrix4();
const hookRot = new THREE.Quaternion();
const hookPos = new THREE.Vector3();
const ONE = new THREE.Vector3(1, 1, 1);
const X_AXIS = new THREE.Vector3(1, 0, 0);

// Hook head: side profile with the throat cut in underneath, extruded
const headShape = new THREE.Shape();
headShape.moveTo(1.6, 0.1);
headShape.lineTo(2.05, 0.1);
headShape.quadraticCurveTo(2.26, 0.1, 2.26, -0.02);
headShape.quadraticCurveTo(2.24, -0.13, 2.08, -0.13);
headShape.lineTo(1.9, -0.13); // barb tip, pointing back
headShape.lineTo(2.03, -0.02); // up into the throat
headShape.lineTo(1.84, -0.02); // throat runs back
headShape.lineTo(1.76, -0.1); // down to the shaft
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

export default function LessonScene({ step }: { step: LessonStep }) {
  const hookRef = useRef<THREE.Group>(null);
  const yarnRef = useRef<THREE.Mesh>(null);
  const yarnMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d6a1a5', roughness: 0.9 }), []);
  const pose = useRef({
    x: step.hook.x,
    y: step.hook.y,
    roll: step.hook.roll,
    yarn: step.yarn.map(() => new THREE.Vector3()),
    first: true,
  });

  // Tail hanging below the finished chains
  const tail = useMemo(() => {
    if (!step.chains.count) return null;
    const x = step.chains.x;
    const y0 = -0.62 - (step.chains.count - 1) * 0.34 - 0.2;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, y0, 0.03),
      new THREE.Vector3(x + 0.02, y0 - 0.5, 0.08),
      new THREE.Vector3(x, y0 - 1, 0.1),
    ]);
    return new THREE.TubeGeometry(curve, 30, 0.06, 10, false);
  }, [step.chains.count, step.chains.x]);

  const arrow = useMemo(() => {
    if (!step.arrow) return null;
    const from = new THREE.Vector3(...step.arrow.from);
    const dir = new THREE.Vector3(...step.arrow.to).sub(from);
    return new THREE.ArrowHelper(dir.clone().normalize(), from, dir.length(), 0xc2410c, 0.18, 0.12);
  }, [step.arrow]);

  useFrame((_, dt) => {
    const p = pose.current;
    const slow = p.first ? 1 : 1 - Math.exp(-dt * 4); // the hook moves
    const fast = p.first ? 1 : 1 - Math.exp(-dt * 14); // the yarn follows

    p.x += (step.hook.x - p.x) * slow;
    p.y += (step.hook.y - p.y) * slow;
    p.roll += (step.hook.roll - p.roll) * slow;
    hookPos.set(p.x, p.y, 0);
    hookRot.setFromAxisAngle(X_AXIS, p.roll);
    hookMatrix.compose(hookPos, hookRot, ONE);
    if (hookRef.current) {
      hookRef.current.position.copy(hookPos);
      hookRef.current.quaternion.copy(hookRot);
    }

    p.yarn.forEach((v, i) => {
      const pt = step.yarn[i];
      if (!pt) return;
      target.set(...pt.p);
      if (pt.on === 'hook') target.applyMatrix4(hookMatrix);
      v.lerp(target, fast);
    });

    if (yarnRef.current) {
      yarnRef.current.geometry.dispose();
      yarnRef.current.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.yarn), 120, 0.06, 10, false);
    }
    p.first = false;
  });

  return (
    <group>
      {/* Hook: shaft, head with throat, handle */}
      <group ref={hookRef}>
        <mesh rotation-z={Math.PI / 2} position-x={0.45} material={metal}>
          <cylinderGeometry args={[0.1, 0.1, 2.5, 20]} />
        </mesh>
        <mesh geometry={headGeo} material={metal} />
        <mesh rotation-z={Math.PI / 2} position-x={-1.7} material={handleMat}>
          <cylinderGeometry args={[0.18, 0.18, 1.8, 20]} />
        </mesh>
      </group>

      {/* Where the yarn goes over your finger */}
      <Text position={[3.05, 1.3, -0.7]} fontSize={0.16} color="#78716c" anchorX="center">
        over your finger
      </Text>

      {/* Working yarn */}
      <mesh ref={yarnRef} material={yarnMat} />

      {/* Finished chains + tail */}
      {Array.from({ length: step.chains.count }, (_, i) => (
        <mesh
          key={i}
          position={[step.chains.x, -0.62 - i * 0.34, 0.03]}
          rotation-y={i % 2 ? Math.PI / 2 : 0}
          scale-y={1.4}
          material={yarnMat}
        >
          <torusGeometry args={[0.16, 0.06, 10, 24]} />
        </mesh>
      ))}
      {tail && <mesh geometry={tail} material={yarnMat} />}

      {/* Where to look, and which way the hook moves */}
      {step.focus && (
        <mesh position={step.focus} material={focusMat}>
          <sphereGeometry args={[0.22, 20, 14]} />
        </mesh>
      )}
      {arrow && <primitive object={arrow} />}
    </group>
  );
}