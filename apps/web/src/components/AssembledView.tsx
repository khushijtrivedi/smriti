import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { Part, RoundCheck } from '@smriti/parser';
import { placeStitches } from '../model/shape';
import PatternModel from '../model/PatternModel';

type PartView = Part & { checks: RoundCheck[] };

const isLeaf = (p: Part) => /leaf/i.test(p.name ?? '');

export default function AssembledView({ parts }: { parts: PartView[] }) {
  const pieces = useMemo(() => parts.map((p) => ({ part: p, model: placeStitches(p.rounds, p.checks) })), [parts]);

  // the middle: a single piece worked in the round, ideally called center / bud
  const round = pieces.filter(({ part, model }) => part.make === 1 && !model.flat && !isLeaf(part));
  const center = round.find(({ part }) => /center|centre|bud/i.test(part.name ?? '')) ?? round[0] ?? pieces[0];
  const rest = pieces.filter((p) => p !== center);
  const R = center.model.flat ? 0 : center.model.radius;

  const petalCount = rest.filter(({ part }) => !isLeaf(part)).reduce((n, { part }) => n + part.make, 0) || 6;
  const gap = Math.PI / petalCount; // leaves sit in the gaps between petals
  const extent = R * 0.8 + Math.max(1, ...rest.map(({ model }) => model.height));

  return (
    <Canvas camera={{ position: [0, 0, extent * 4], fov: 30 }}>
      <hemisphereLight args={['#fffaf5', '#b8a59a', 0.9]} />
      <directionalLight position={[-4, 6, 8]} intensity={1.1} />

      <group rotation-x={Math.PI / 2} position-z={0.2}>
        <group position-y={center.model.flat ? -center.model.height / 2 : 0}>
          <PatternModel stitches={center.model.stitches} height={0} sel={center.part.rounds.length} step={Infinity} color="#e8c27a" />
        </group>
      </group>

      {rest.flatMap(({ part, model }) =>
        Array.from({ length: part.make }, (_, i) => {
          const leaf = isLeaf(part);
          const angle = leaf ? -Math.PI / 2 + (i % 2 ? -1 : 1) * gap * (1 + 2 * Math.floor(i / 2)) : Math.PI / 2 + (i * 2 * Math.PI) / part.make;
          const d = R * 0.8;
          return (
            <group key={`${part.name}-${i}`} position={[Math.cos(angle) * d, Math.sin(angle) * d, leaf ? -0.3 : -0.15 - i * 0.01]} rotation-z={angle - Math.PI / 2}>
              {/* flat pieces already lie flat; round ones get pressed */}
              <group scale={[1, 1, model.flat ? 1 : 0.35]} position-y={model.flat ? 0 : model.height / 2}>
                <PatternModel stitches={model.stitches} height={model.flat ? 0 : model.height} sel={part.rounds.length} step={Infinity} color={leaf ? '#9cb48a' : '#d6a1a5'} />
              </group>
            </group>
          );
        }),
      )}

      <OrbitControls makeDefault />
    </Canvas>
  );
}