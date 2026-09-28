import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // En développement, les appels à /api sont relayés vers le serveur Express :
      // le navigateur reste sur la même origine (pas de CORS), comme derrière
      // le reverse proxy de production.
      proxy: {
        '/api': env.API_PROXY_TARGET || 'http://localhost:3000',
      },
    },
  };
});
