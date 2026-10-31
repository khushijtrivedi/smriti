import type { RefObject } from 'react';
import * as THREE from 'three';
import { loopX } from './layout';
import { materials } from './shared';

// Hook head: side profile with the throat cut in underneath, extruded
const headShape = new THREE.Shape();
headShape.moveTo(1.6, 0.1);
headShape.lineTo(2.05, 0.1);
headShape.quadraticCurveTo(2.26, 0.1, 2.26, -0.02);
headShape.quadraticCurveTo(2.24, -0.13, 2.08, -0.13);
headShape.lineTo(1.9, -0.13); // barb tip
headShape.lineTo(2.03, -0.02); // up into the throat
headShape.lineTo(1.84, -0.02); // throat runs back
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

interface Props {
  hookRef: RefObject<THREE.Group | null>;
  ringRefs: RefObject<(THREE.Mesh | null)[]>;
  ringCount: number;
  ringKey: string; // changes when loops come off, so they don't glide back
}

export default function Hook({ hookRef, ringRefs, ringCount, ringKey }: Props) {
  return (
    <group ref={hookRef}>
      <mesh rotation-z={Math.PI / 2} position-x={0.45} material={materials.metal}>
        <cylinderGeometry args={[0.1, 0.1, 2.5, 20]} />
      </mesh>
      <mesh geometry={headGeo} material={materials.metal} />
      <mesh rotation-z={Math.PI / 2} position-x={-1.7} material={materials.handle}>
        <cylinderGeometry args={[0.18, 0.18, 1.8, 20]} />
      </mesh>

      {/* Loops on the hook */}
      {Array.from({ length: ringCount }, (_, i) => (
        <mesh
          key={`${ringKey}-${i}`}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          position-x={loopX(i)}
          rotation-y={Math.PI / 2}
          material={materials.yarn}
        >
          <torusGeometry args={[0.2, 0.06, 10, 24]} />
        </mesh>
      ))}
    </group>
  );
}