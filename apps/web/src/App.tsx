import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { parse, checkPattern, expandItems, type Round } from '@smriti/parser';
import { placeStitches } from './model/shape';
import YarnBall from './model/YarnBall';

const PATTERN = `R1: 6 sc in magic ring (6)
R2: inc in each st (12)
R3: [sc, inc] x6 (18)
R4: [2 sc, inc] x6 (24)
R5: [3 sc, inc] x6 (30)
R6: [4 sc, inc] x6 (36)
R7: sc in each st (36)
R8: sc in each st (36)
R9: sc in each st (36)
R10: sc in each st (36)
R11: sc in each st (36)
R12: sc in each st (36)
R13: [4 sc, dec] x6 (30)
R14: [3 sc, dec] x6 (24)
R15: [2 sc, dec] x6 (18)
R16: [sc, dec] x6 (12)
R17: dec x6 (6)`;

const NAMES: Record<string, string> = { sc: 'single crochet', inc: 'increase', dec: 'decrease' };

const rounds: Round[] = parse(PATTERN);
const checks = checkPattern(rounds);
const instructions = rounds.map((r, i) => expandItems(r.items, checks[i - 1]?.actual ?? 0));
const lines = PATTERN.split('\n').map((l) => l.replace(/^R\d+:\s*/, ''));
const { stitches, height } = placeStitches(rounds, checks);

export default function App() {
  const [sel, setSel] = useState(8);
  const [step, setStep] = useState(17);
  const [playing, setPlaying] = useState(false);
  const current = instructions[sel] ?? [];

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= current.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 420);
    return () => clearInterval(id);
  }, [playing, current.length]);

  function selectRound(i: number) {
    if (i === sel) return;
    setPlaying(false);
    setSel(i);
    setStep((instructions[i]?.length ?? 1) - 1);
  }

  function togglePlay() {
    if (playing) return setPlaying(false);
    setStep(0);
    setPlaying(true);
  }

  return (
    <div className="grid min-h-screen gap-8 bg-[#f3efeb] p-6 font-serif text-[#2e2a28] md:grid-cols-[1.4fr_1fr]">
      <div className="flex min-h-[420px] flex-col">
        <h1 className="text-xl font-medium">Smriti</h1>
        <p className="text-sm text-[#857c76]">Amigurumi ball · drag to turn</p>
        <div className="relative min-h-[360px] flex-1">
          <Canvas camera={{ position: [0, 3.2, 10.5], fov: 30 }}>
            <hemisphereLight args={['#fffaf5', '#b8a59a', 0.9]} />
            <directionalLight position={[-4, 6, 5]} intensity={1.1} />
            <directionalLight position={[5, 1, -3]} intensity={0.3} />
            <YarnBall stitches={stitches} height={height} sel={sel} step={step} />
            <ContactShadows position-y={-height / 2 - 0.02} opacity={0.35} blur={2.5} scale={6} />
            <OrbitControls enablePan={false} minDistance={6} maxDistance={16} autoRotate={!playing} autoRotateSpeed={0.5} />
          </Canvas>
        </div>
        <p className="text-center italic text-[#857c76]">
          R{sel + 1} · stitch {step + 1} of {current.length} · {NAMES[current[step] ?? 'sc']}
        </p>
      </div>

      <aside className="flex flex-col overflow-y-auto md:pt-10">
        {lines.map((text, i) => (
          <div
            key={i}
            onClick={() => selectRound(i)}
            className={`flex cursor-pointer flex-col gap-2 rounded-lg px-4 py-3 ${
              i === sel ? 'bg-[#e7e2dd]' : 'border-b border-[#e2dcd6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-10">R{i + 1}:</span>
              <span className="flex-1">{text}</span>
              {i === sel && (
                <button
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#2e2a28] text-xs text-[#f3efeb]"
                >
                  {playing ? '❚❚' : '▶'}
                </button>
              )}
            </div>
            {i === sel && (
              <div className="flex flex-wrap gap-1.5 pl-[52px]">
                {current.map((st, j) => (
                  <button
                    key={j}
                    title={NAMES[st]}
                    onClick={(e) => { e.stopPropagation(); setPlaying(false); setStep(j); }}
                    className={`h-2.5 w-2.5 rounded-full border border-[#c9939a] ${
                      j === step ? 'border-[#874f59] bg-[#874f59]' : j < step ? 'bg-[#c9939a]' : ''
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>
    </div>
  );
}