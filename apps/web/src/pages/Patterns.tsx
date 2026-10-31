import { Link } from 'react-router';

export default function Patterns() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-medium">Patterns</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400">No patterns yet.</p>
      <Link to="/upload" className="mt-4 inline-block underline underline-offset-4">
        Upload your pattern
      </Link>
    </div>
  );
}