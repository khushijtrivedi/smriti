import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { auth } from './auth.js';

const app = new Hono().basePath('/api');

app.get('/health', (c) => c.json({ ok: true }));
app.on(['GET', 'POST'], '/auth/*', (c) => auth.handler(c.req.raw));

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(`Smriti API on http://localhost:${info.port}/api`);
});