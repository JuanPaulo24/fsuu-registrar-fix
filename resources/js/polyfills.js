// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Additional polyfills if needed
if (typeof global === 'undefined') {
    window.global = window;
}