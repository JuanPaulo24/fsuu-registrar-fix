# Production-Like Development Environment

This setup allows you to test production-like behavior during development with console removal, code minification, and security features.

## Available Scripts

### 1. Regular Development (Default)
```bash
npm run dev
```
- Normal development with hot reload
- All console.log statements preserved
- Comments preserved
- Code readable
- Runs on: https://fsuu_registrar.test:5173/

### 2. Production-Like Development
```bash
npm run dev:production
```
- Development with production-like features enabled
- ✅ Removes all console.log, console.warn, console.error, etc.
- ✅ Code minification and compression
- ✅ Variable name mangling
- ✅ Dead code elimination
- Still has hot reload for development
- Runs on: https://fsuu_registrar.test:5174/

### 3. Secure Development
```bash
npm run dev:secure
```
- Most secure development mode
- All production features + additional security
- Code heavily obfuscated and minified
- Runs on: https://fsuu_registrar.test:5175/

## Features Enabled in Production-Like Mode

### 🧹 **Console Cleanup**
- Removes: `console.log`, `console.warn`, `console.error`, `console.debug`, `console.info`, `console.trace`
- Keeps: `console.assert` (for critical errors)

### 🔒 **Code Minification & Obfuscation**
- Variable name mangling (renames variables to shorter names)
- Dead code elimination
- Unused code removal
- Properties starting with `_` are mangled
- All comments stripped

### 📁 **File Name Obfuscation**
- Build output uses hash-based file names
- Entry files: `[hash].js`
- Chunk files: `[hash].js`
- Asset files: `[hash][extname]`

### 🔧 **Security Features**
- Debugger statements removed
- Dead code paths eliminated
- Compressed and optimized output

## Environment Variable

The production-like behavior is controlled by:
```bash
VITE_PRODUCTION_LIKE=true
```

## Security Benefits

1. **Anti-Debugging**: Makes it hard to reverse engineer
2. **Code Protection**: Obfuscated variable and function names
3. **No Leaks**: All console.log statements removed
4. **Clean Code**: No comments or debug information
5. **Performance**: Minified and optimized code

## Example Before/After

### Before (Development):
```javascript
// User authentication function
function authenticateUser(username, password) {
    console.log('Authenticating user:', username);
    // TODO: Add password validation
    const apiKey = 'sk-1234567890';
    const _secretKey = 'internal-secret';
    return validateCredentials(username, password, apiKey);
}
```

### After (Production-Like):
```javascript
function a(n,r){const e="sk-1234567890",o="internal-secret";return t(n,r,e)}
```

## Testing Your Setup

1. Run `npm run dev:production`
2. Open browser developer tools
3. Check if console.log statements are gone
4. Verify code is obfuscated in Sources tab
5. Confirm no comments are visible

## Notes

- Hot reload still works in production-like mode
- Build time may be slower due to obfuscation
- Use regular `npm run dev` for normal development
- Use `npm run dev:production` when testing security/production readiness