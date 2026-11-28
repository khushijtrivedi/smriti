import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { parse, checkPattern, type Part } from '@smriti/parser';
import { placeStitches } from '../model/shape';
import PatternModel from '../model/PatternModel';

// A small ball: grows, stays straight, then closes up
export const SAMPLE = `R1: 6 sc in magic ring (6)
R2: inc in each st (12)
R3: [sc, inc] x6 (18)
R4: [2 sc, inc] x6 (24)
R5: 24 sc (24)
R6: 24 sc (24)
R7: [2 sc, dec] x6 (18)
R8: [sc, dec] x6 (12)
R9: dec x6 (6)`;

export default function HeroModel() {
  const model = useMemo(() => {
    const part: Part = parse(SAMPLE)[0];
    const checks = checkPattern(part.rounds);
    return { rounds: part.rounds.length, ...placeStitches(part.rounds, checks) };
  }, []);

  // Build the ball one round at a time, hold it, then start again
  const [sel, setSel] = useState(0);
  useEffect(() => {
    const done = sel >= model.rounds;
    const id = setTimeout(() => setSel(done ? 0 : sel + 1), done ? 2500 : 600);
    return () => clearTimeout(id);
  }, [sel, model.rounds]);

  const dist = Math.max(10.5, model.height * 2.4);

  return (
    <Canvas camera={{ position: [0, 3.2, dist], fov: 30 }}>
      <hemisphereLight args={['#fffaf5', '#b8a59a', 0.9]} />
      <directionalLight position={[-4, 6, 5]} intensity={1.1} />
      <directionalLight position={[5, 1, -3]} intensity={0.3} />
      <PatternModel stitches={model.stitches} height={model.height} sel={sel} step={Infinity} />
      <ContactShadows position-y={-model.height / 2 - 0.02} opacity={0.35} blur={2.5} scale={Math.max(6, model.height * 1.5)} />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
}