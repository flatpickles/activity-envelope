import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [glsl()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                app: './demo/index.html',
            },
        },
    },
    server: {
        open: '/demo/index.html',
    },
});
