import { LAYOUT } from './layout';
import { materials } from './shared';

export default function Row({ built }: { built: number }) {
  const { stitch, stitchRot, linkGap } = LAYOUT;

  return (
    <group>
      {/* The row */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[i * 0.32, stitch.y - 0.05, 0]} rotation-x={i % 2 ? Math.PI / 2 : 0} scale-x={1.35} material={materials.row}>
          <torusGeometry args={[0.16, 0.06, 10, 24]} />
        </mesh>
      ))}

      {/* The stitch to work into */}
      <mesh position={stitch} quaternion={stitchRot} material={materials.row}>
        <torusGeometry args={[0.2, 0.06, 10, 24]} />
      </mesh>

      {/* The new stitch, built up link by link */}
      {Array.from({ length: built }, (_, i) => (
        <mesh
          key={i}
          position={[stitch.x, stitch.y + 0.3 + i * linkGap, 0]}
          rotation-y={i % 2 ? Math.PI / 2 : 0}
          scale-y={1.3}
          material={materials.yarn}
        >
          <torusGeometry args={[0.12, 0.055, 10, 24]} />
        </mesh>
      ))}
    </group>
  );
}