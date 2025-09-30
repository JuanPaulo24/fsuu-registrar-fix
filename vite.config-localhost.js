import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        https: false,
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        cors: {
            origin: true,
            credentials: true
        },
        hmr: {
            host: "192.168.1.12",
            port: 5173
        }
    },
    plugins: [
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
});
