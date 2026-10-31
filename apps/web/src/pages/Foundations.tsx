import { Link } from 'react-router';
import { lessons } from '../foundations/lessons';

export default function Foundations() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-medium">Foundations</h1>
      <ul className="mt-6 flex flex-col">
        {lessons.map((l) => (
          <li key={l.slug} className="border-b border-stone-200 dark:border-stone-800">
            <Link to={`/foundations/${l.slug}`} className="flex flex-col gap-1 py-4">
              <span className="text-lg">
                {l.name} <span className="text-stone-500 dark:text-stone-400">({l.abbr})</span>
              </span>
              <span className="text-sm text-stone-500 dark:text-stone-400">{l.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}