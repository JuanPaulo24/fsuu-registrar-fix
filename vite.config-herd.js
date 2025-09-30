import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";
import path from "path";

export default defineConfig({
    server: {
        host: "fsuu_registrar.test",
        port: 5173,
        https: true,
        strictPort: true,
        cors: {
            origin: true,
            credentials: true
        },
        hmr: {
            host: "fsuu_registrar.test",
            port: 5173
        },
    },
    plugins: [
        mkcert(),
        laravel({
            input: [
                "resources/css/app.css",
                "resources/sass/app.scss",
                "resources/js/app.jsx",
            ],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    // TinyMCE asset handling and Buffer polyfill
    optimizeDeps: {
        exclude: ['tinymce']
    },
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
