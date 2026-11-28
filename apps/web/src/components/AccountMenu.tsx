import { useState } from 'react';
import { authClient } from '../lib/auth-client';

export default function AccountMenu() {
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!session) {
    return (
      <button
        onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.href })}
        disabled={isPending}
        className="rounded-full border border-stone-300 px-4 py-1.5 text-sm hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Account"
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800"
      >
        {session.user.image ? (
          <img src={session.user.image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          <span className="text-sm">{session.user.name.charAt(0)}</span>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-stone-200 bg-stone-50 p-2 shadow-lg dark:border-stone-800 dark:bg-stone-900">
          <div className="px-3 py-2">
            <p className="text-sm">{session.user.name}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">{session.user.email}</p>
          </div>
          <button
            onClick={async () => {
              await authClient.signOut();
              setMenuOpen(false);
            }}
            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}