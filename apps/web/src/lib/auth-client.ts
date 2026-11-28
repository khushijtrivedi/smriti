import { createAuthClient } from 'better-auth/react';

// No baseURL needed: the web app and /api are on the same address thanks to the Vite proxy
export const authClient = createAuthClient();