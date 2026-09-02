import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import './index.css';
import { AuthProvider } from '@/entities/user';

import App from './app/App.tsx';
import { QueryProvider } from './app/QueryProvider';

// MSW mock 백엔드 — VITE_USE_MOCK=true일 때만 활성화
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // Supabase 외 요청은 그대로 통과
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </StrictMode>,
  );
});
