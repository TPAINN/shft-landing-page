import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const staticPages = new Set(['support', 'privacy', 'health-data', 'terms', 'cookies']);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-static-policy-pages',
      configureServer(server) {
        server.middlewares.use((request, _response, next) => {
          const page = request.url?.split(/[/?#]/).filter(Boolean)[0];
          if (page && staticPages.has(page) && !request.url.includes('.')) {
            request.url = `/${page}/index.html`;
          }
          next();
        });
      },
    },
  ],
});
