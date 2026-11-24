import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { expandItems, type Round, type RoundCheck } from '@smriti/parser';
import { placeStitches } from '../model/shape';
   import PatternModel from '../model/PatternModel';

const NAMES: Record<string, string> = {
  sc: 'single crochet',
  hdc: 'half double crochet',
  dc: 'double crochet',
  inc: 'increase',
  dec: 'decrease',
  ch: 'chain',
  slst: 'slip stitch',
};

interface Props {
  rounds: Round[];
  checks: RoundCheck[];
  lines: string[];
}

export default function PatternViewer({ rounds, checks, lines }: Props) {
  const model = useMemo(
    () => ({
      instructions: rounds.map((r, i) => expandItems(r.items, checks[i - 1]?.actual ?? 0)),
      ...placeStitches(rounds, checks),
    }),
    [rounds, checks],
  );

  const dist = Math.max(10.5, model.height * 2.4);
  // Start by showing the whole piece; clamp in case the pattern gets shorter while editing
  const last = rounds.length - 1;
  const [selRaw, setSel] = useState(last);
  const [stepRaw, setStep] = useState(Infinity);
  const [playing, setPlaying] = useState(false);
  const sel = Math.min(selRaw, last);
  const current = model.instructions[sel] ?? [];
  const step = Math.min(stepRaw, current.length - 1);

  // Play the selected round stitch by stitch
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      const next = step + 1;
      setStep(next);
      if (next >= current.length - 1) setPlaying(false);
    }, 400);
    return () => clearTimeout(id);
  }, [playing, step, current.length]);

  function selectRound(i: number) {
    setPlaying(false);
    setSel(i);
    setStep(Infinity);
  }

  function togglePlay() {
    if (playing) return setPlaying(false);
    setStep(0);
    setPlaying(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square w-full overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
       <Canvas camera={{ position: [0, 3.2, dist], fov: 30 }}>
          <hemisphereLight args={['#fffaf5', '#b8a59a', 0.9]} />
          <directionalLight position={[-4, 6, 5]} intensity={1.1} />
          <directionalLight position={[5, 1, -3]} intensity={0.3} />
             <PatternModel stitches={model.stitches} height={model.height} sel={sel} step={step} />
         <ContactShadows position-y={-model.height / 2 - 0.02} opacity={0.35} blur={2.5} scale={Math.max(6, model.height * 1.5)} />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={Math.max(16, dist * 1.5)} autoRotate={!playing} autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <p className="text-center text-sm italic text-stone-500 dark:text-stone-400">
        R{rounds[sel]?.number} · stitch {step + 1} of {current.length} · {NAMES[current[step] ?? ''] ?? ''}
      </p>

      <ul className="flex flex-col">
        {rounds.map((r, i) => {
          const check = checks[i];
          const wrong = check && !check.ok;
          const text = (lines[i] ?? '').replace(/^(round|rnd|r)\s*\d+\s*:\s*/i, '');
          return (
            <li
              key={i}
              onClick={() => selectRound(i)}
              className={`flex cursor-pointer flex-col gap-2 rounded-lg px-4 py-3 ${
                i === sel ? 'bg-stone-200 dark:bg-stone-800' : 'border-b border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-10 text-stone-500 dark:text-stone-400">R{r.number}</span>
                <span className="flex-1 font-mono text-sm">{text}</span>
                {wrong && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    counts {check.actual}, says {check.expected}
                  </span>
                )}
                {i === sel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    aria-label={playing ? 'Pause' : 'Play this round'}
                    className="grid h-8 w-8 place-items-center rounded-full bg-stone-800 text-xs text-stone-50 dark:bg-stone-100 dark:text-stone-900"
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaying(false);
                        setStep(j);
                      }}
                      className={`h-2.5 w-2.5 rounded-full border border-rose-300 ${
                        j === step ? 'border-rose-700 bg-rose-700' : j < step ? 'bg-rose-300' : ''
                      }`}
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}