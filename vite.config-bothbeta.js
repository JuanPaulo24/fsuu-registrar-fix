import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";
import path from "path";
import removeConsole from "vite-plugin-remove-console";

export default defineConfig(({ command, mode }) => {
    // Check if we want production-like behavior in development
    const isProductionLike = process.env.VITE_PRODUCTION_LIKE === 'true';
    
    return {
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
            
            // Production-like plugins (controlled by environment variable)
            ...(isProductionLike ? [
                // Remove console.log, console.warn, console.error, etc.
                removeConsole({
                    includes: ['log', 'warn', 'error', 'debug', 'info', 'trace'],
                    // Keep console.assert for critical errors
                    excludes: ['assert']
                })
            ] : [])
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
        // Enhanced build options for production-like behavior
        build: {
            ...(isProductionLike && {
                sourcemap: false,
                minify: 'terser',
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        dead_code: true,
                        unused: true,
                    },
                    mangle: {
                        toplevel: true,
                        properties: {
                            regex: /^_/
                        }
                    },
                    format: {
                        comments: false,
                    },
                },
                rollupOptions: {
                    output: {
                        manualChunks: undefined,
                        // Obfuscate file names
                        entryFileNames: '[hash].js',
                        chunkFileNames: '[hash].js',
                        assetFileNames: '[hash][extname]'
                    },
                },
            }),
        },
    };
});
