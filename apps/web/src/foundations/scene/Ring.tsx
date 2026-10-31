import { useMemo } from 'react';
import * as THREE from 'three';
import { LAYOUT, RING, ringPoint, stitchAngle } from './layout';
import { materials, tube } from './shared';

const UP = new THREE.Vector3(0, 1, 0);

export default function Ring({ closed, stitches }: { closed: boolean; stitches: number }) {
  const r = closed ? RING.closed : RING.open;

  // Tail hanging from the bottom of the ring
  const tail = useMemo(() => {
    const start = ringPoint(-Math.PI / 2, r);
    return tube([start, start.clone().add(new THREE.Vector3(-0.1, -0.5, 0.05)), start.clone().add(new THREE.Vector3(-0.15, -1, 0.1))]);
  }, [r]);

  return (
    <group>
      <mesh position={LAYOUT.stitch} quaternion={RING.rot} material={materials.yarn}>
        <torusGeometry args={[r, 0.06, 10, 40]} />
      </mesh>
      <mesh geometry={tail} material={materials.yarn} />

           {/* Stitches worked into the ring, one link each, pointing outward */}
      {Array.from({ length: stitches }, (_, i) => {
        const base = ringPoint(stitchAngle(i), r);
        const out = base.clone().sub(LAYOUT.stitch).normalize();
        return (
          <mesh
            key={i}
            position={base.clone().addScaledVector(out, 0.17)}
            quaternion={new THREE.Quaternion().setFromUnitVectors(UP, out)}
            scale-y={1.3}
            material={materials.yarn}
          >
            <torusGeometry args={[0.1, 0.05, 10, 24]} />
          </mesh>
        );
      })}
    </group>
  );
}