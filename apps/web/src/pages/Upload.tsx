import { useEffect, useMemo, useState } from 'react';
import { parse, checkPattern, type Part } from '@smriti/parser';
import PatternViewer from '../components/PatternViewer';
import AssembledView from '../components/AssembledView';

const DRAFT_KEY = 'smriti-draft';
const PLACEHOLDER = `R1: 6 sc in magic ring (6)
R2: inc in each st (12)
R3: [sc, inc] x6 (18)`;

function readDraft(): string {
  try {
    return localStorage.getItem(DRAFT_KEY) ?? '';
  } catch {
    return '';
  }
}

// The parser's errors carry the line they happened on
function errorLine(e: unknown): number | null {
  if (typeof e !== 'object' || e === null || !('location' in e)) return null;
  const { location } = e as { location?: { start?: { line?: number } } };
  return location?.start?.line ?? null;
}

const partLabel = (p: Part) => `${p.name ?? 'Pattern'}${p.make > 1 ? ` ×${p.make}` : ''}`;

export default function Upload() {
  const [text, setText] = useState(readDraft);
  const [view, setView] = useState<number | 'assembled' | null>(null);

  // Keep the draft in this browser so a refresh doesn't lose it
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, text);
    } catch {
      // storage blocked, the draft just won't persist
    }
  }, [text]);

  const result = useMemo(() => {
    if (!text.trim()) return null;
    try {
      const parts: Part[] = parse(text);
      return { parts: parts.map((p) => ({ ...p, checks: checkPattern(p.rounds) })), error: null };
    } catch (e) {
      const line = errorLine(e);
      const message = e instanceof Error ? e.message : 'This pattern could not be read.';
      return { parts: [], error: line ? `Line ${line}: ${message}` : message };
    }
  }, [text]);

  const parts = result?.parts ?? [];
  const textLines = text.split('\n');
  const mistakes = parts.flatMap((p) => p.checks.filter((c) => !c.ok).map((c) => ({ part: p, check: c })));
  const ready = result && !result.error && parts.length > 0;

  // Default view: assembled when there are several parts, otherwise the only part
  const active = view === 'assembled' && parts.length > 1 ? 'assembled' : typeof view === 'number' && view < parts.length ? view : parts.length > 1 ? 'assembled' : 0;
  const part = typeof active === 'number' ? parts[active] : undefined;

  async function handleFile(file: File) {
    setText(await file.text());
  }

  const tab = (selected: boolean) =>
    `rounded-full px-4 py-1.5 text-sm ${selected ? 'bg-stone-800 text-stone-50 dark:bg-stone-100 dark:text-stone-900' : 'border border-stone-300 dark:border-stone-700'}`;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="min-w-0">
        <h1 className="text-2xl font-medium">Upload your pattern</h1>
        <p className="mt-2 text-stone-500 dark:text-stone-400">
          Paste a crochet pattern worked in the round, or upload a .txt file. It stays in your browser.
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          For a pattern with parts, put a heading above each one, like <span className="font-mono">Petal (make 5):</span>
        </p>

        <textarea
          id="pattern-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className="mt-4 h-72 w-full rounded-xl border border-stone-300 bg-white p-3 font-mono text-sm dark:border-stone-700 dark:bg-stone-900"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800">
            Upload .txt
            <input
              id="pattern-file"
              type="file"
              accept=".txt,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>
          {text && (
            <button onClick={() => setText('')} className="text-sm text-stone-500 underline underline-offset-4 dark:text-stone-400">
              Clear
            </button>
          )}
        </div>

        {result?.error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{result.error}</p>}

        {ready &&
          (mistakes.length ? (
            <ul className="mt-4 flex flex-col gap-1 text-sm text-red-600 dark:text-red-400">
              {mistakes.map(({ part: p, check }) => (
                <li key={`${p.name}-${check.number}`}>
                  {p.name ? `${p.name}, round` : 'Round'} {check.number} makes {check.actual} stitches, but the pattern says {check.expected}.
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">All stitch counts match.</p>
          ))}
      </div>

      <div className="min-w-0">
        {ready ? (
          <div className="flex flex-col gap-4">
            {parts.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setView('assembled')} className={tab(active === 'assembled')}>
                  Assembled
                </button>
                {parts.map((p, i) => (
                  <button key={i} onClick={() => setView(i)} className={tab(active === i)}>
                    {partLabel(p)}
                  </button>
                ))}
              </div>
            )}

            {active === 'assembled' ? (
              <AssembledView parts={parts} />
            ) : (
              part && (
                <PatternViewer
                  key={active}
                  rounds={part.rounds}
                  checks={part.checks}
                  lines={part.rounds.map((r) => textLines[r.line - 1]?.trim() ?? '')}
                />
              )
            )}
          </div>
        ) : (
          <div className="grid aspect-square w-full place-items-center rounded-2xl border border-dashed border-stone-300 text-stone-500 dark:border-stone-700 dark:text-stone-400">
            Your 3D preview shows up here.
          </div>
        )}
      </div>
    </div>
  );
}