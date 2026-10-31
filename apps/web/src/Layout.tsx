import { useState } from 'react';
import { Link, Outlet } from 'react-router';

export default function Layout() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  function toggleTheme() {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // storage blocked, theme just won't persist
    }
    setDark(next);
  }

  return (
    <div className="min-h-screen bg-stone-50 font-serif text-stone-800 dark:bg-stone-950 dark:text-stone-100">
      <header className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-stone-800">
        <Link to="/" className="text-xl font-medium">
          Smriti
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="rounded-full bg-stone-800 px-4 py-1.5 text-sm text-stone-50 hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Upload your pattern
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            {dark ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>

          <button
            aria-label="Account"
            className="grid h-9 w-9 place-items-center rounded-full bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
        </div>
      </header>

      <main className="px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}