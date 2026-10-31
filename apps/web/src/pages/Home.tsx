import { Link } from 'react-router';

const MODULES = [
  { to: '/foundations', title: 'Foundations', text: 'Learn each stitch, step by step.' },
  { to: '/patterns', title: 'Patterns', text: 'See a pattern built round by round.' },
];

export default function Home() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
      {MODULES.map((m) => (
        <Link
          key={m.to}
          to={m.to}
          className="rounded-2xl border border-stone-200 p-8 hover:border-stone-400 dark:border-stone-800 dark:hover:border-stone-600"
        >
          <h2 className="text-2xl font-medium">{m.title}</h2>
          <p className="mt-2 text-stone-500 dark:text-stone-400">{m.text}</p>
        </Link>
      ))}
    </div>
  );
}