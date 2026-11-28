import { Link } from 'react-router';
import HeroModel, { SAMPLE } from '../components/HeroModel';
import { lessons } from '../foundations/lessons';

const STEPS = [
  { n: '1', title: 'Paste your pattern', text: 'Copy it from a blog, a PDF or your notes, or upload a .txt file.' },
  { n: '2', title: 'See it in 3D', text: 'Smriti builds every stitch, so you can turn the piece around and see its shape.' },
  { n: '3', title: 'Build it round by round', text: 'Step through each round, or play it stitch by stitch while you crochet along.' },
];

const FEATURES = [
  {
    title: 'Catches counting mistakes',
    text: 'Every round is checked against the count the pattern promises. If round 5 makes 28 stitches instead of 30, you see it before your hook does.',
  },
  {
    title: 'Patterns with parts',
    text: 'Write a heading like "Petal (make 5):" above each part, and a flower comes together from its centre, petals and leaves.',
  },
  {
    title: 'Flat pieces and amigurumi',
    text: 'Works in the round from a magic ring, or flat around a starting chain, with real stitch heights for sc, hdc and dc.',
  },
  {
    title: `Learn the basics first`,
    text: `${lessons.length} animated lessons, from the chain to the treble crochet, show the hook and yarn move by move.`,
  },
];

const primary =
  'rounded-full bg-stone-800 px-6 py-3 text-stone-50 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300';
const secondary =
  'rounded-full border border-stone-300 px-6 py-3 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800';

export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-24 pb-16">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-rose-700 dark:text-rose-300">Crochet, in 3D</p>
          <h1 className="mt-4 text-4xl font-medium leading-tight sm:text-5xl">See your pattern before you crochet it.</h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600 dark:text-stone-300">
            Paste a written crochet pattern and Smriti builds it in 3D, round by round. It checks every stitch count, so you
            find mistakes before you have to unravel anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/upload" className={primary}>
              Try it with your pattern
            </Link>
            <Link to="/foundations" className={secondary}>
              Learn the stitches
            </Link>
          </div>
        </div>

        <div className="aspect-square w-full overflow-hidden rounded-3xl border border-stone-200 bg-white/50 dark:border-stone-800 dark:bg-stone-900/50">
          <HeroModel />
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-medium">How it works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-stone-200 p-6 dark:border-stone-800">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-medium">{s.title}</h3>
              <p className="mt-2 text-stone-500 dark:text-stone-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The pattern it needs */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-medium">Written the way patterns already are</h2>
          <p className="mt-4 text-stone-600 dark:text-stone-300">
            No new notation to learn. Rounds, stitch names, repeats in brackets and the count at the end, just like the
            pattern in your notebook. This is the ball turning at the top of the page:
          </p>
          <Link to="/upload" className="mt-6 inline-block underline underline-offset-4">
            Paste your own
          </Link>
        </div>
        <pre className="overflow-x-auto rounded-2xl border border-stone-200 bg-white p-6 font-mono text-sm leading-7 dark:border-stone-800 dark:bg-stone-900">
          {SAMPLE}
        </pre>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-medium">What it does</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 p-6 dark:border-stone-800">
              <h3 className="text-lg font-medium">{f.title}</h3>
              <p className="mt-2 text-stone-500 dark:text-stone-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="rounded-3xl bg-stone-800 px-8 py-14 text-center text-stone-50 dark:bg-stone-100 dark:text-stone-900">
        <h2 className="text-3xl font-medium">Have a pattern open in another tab?</h2>
        <p className="mx-auto mt-3 max-w-lg text-stone-300 dark:text-stone-600">Paste it in and see what you are about to make.</p>
        <Link
          to="/upload"
          className="mt-8 inline-block rounded-full bg-stone-50 px-6 py-3 text-stone-900 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-50 dark:hover:bg-stone-700"
        >
          Open the pattern viewer
        </Link>
      </section>
    </div>
  );
}