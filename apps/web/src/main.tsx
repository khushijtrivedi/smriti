import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './Layout';
import Home from './pages/Home';
import Foundations from './pages/Foundations';
import Patterns from './pages/Patterns';
import Upload from './pages/Upload';
import Lesson from './pages/Lesson';
import './index.css';

// Apply the saved theme (or the system one) before the first paint
let saved: string | null = null;
try {
  saved = localStorage.getItem('theme');
} catch {
  // storage blocked, fall back to system
}
const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', dark);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'foundations', element: <Foundations /> },
      { path: 'foundations/:slug', element: <Lesson /> },
      { path: 'patterns', element: <Patterns /> },
      { path: 'upload', element: <Upload /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);