import { useMemo } from 'react';
import * as THREE from 'three';
import { LAYOUT } from './layout';
import { materials, tube } from './shared';

const LINK_GAP = 0.34;

export default function Chains({ count }: { count: number }) {
  // Tail hanging below the last chain
  const tail = useMemo(() => {
    if (!count) return null;
    const y0 = -0.22 - (count - 1) * LINK_GAP - 0.22;
    return tube([new THREE.Vector3(0, y0, 0), new THREE.Vector3(0.02, y0 - 0.5, 0.05), new THREE.Vector3(0, y0 - 1, 0.07)]);
  }, [count]);

  return (
    <group position={LAYOUT.chainTop}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[0, -0.22 - i * LINK_GAP, 0]}
          rotation-y={i % 2 ? Math.PI / 2 : 0}
          scale-y={1.4}
          material={materials.yarn}
        >
          <torusGeometry args={[0.16, 0.06, 10, 24]} />
        </mesh>
      ))}
      {tail && <mesh geometry={tail} material={materials.yarn} />}
    </group>
  );
}