/**
 * Polyfills for Node.js environment compatibility
 * This module ensures that browser APIs like atob, btoa, Buffer, and crypto
 * are available in Node.js environments where they might be missing.
 */

function ensureGlobals() {
  // Ensure globalThis is available (for older Node.js versions)
  if (typeof globalThis === 'undefined') {
    // @ts-ignore
    global.globalThis = global;
  }

  // Node.js environment polyfills
  if (typeof globalThis !== 'undefined') {
    // atob polyfill for Node.js (base64 decode)
    if (typeof globalThis.atob === 'undefined') {
      globalThis.atob = function(str: string): string {
        try {
          // Use Node.js Buffer if available
          if (typeof Buffer !== 'undefined') {
            return Buffer.from(str, 'base64').toString('binary');
          }
          // Fallback for environments without Buffer
          throw new Error('atob not supported in this environment');
        } catch (error) {
          throw new Error(`Invalid base64 string: ${error}`);
        }
      };
    }

    // btoa polyfill for Node.js (base64 encode)
    if (typeof globalThis.btoa === 'undefined') {
      globalThis.btoa = function(str: string): string {
        try {
          // Use Node.js Buffer if available
          if (typeof Buffer !== 'undefined') {
            return Buffer.from(str, 'binary').toString('base64');
          }
          // Fallback for environments without Buffer
          throw new Error('btoa not supported in this environment');
        } catch (error) {
          throw new Error(`Invalid string for base64 encoding: ${error}`);
        }
      };
    }

    // Buffer polyfill for environments that don't have it globally
    if (typeof globalThis.Buffer === 'undefined') {
      try {
        // Try to import Buffer from Node.js
        if (typeof require !== 'undefined') {
          const { Buffer: NodeBuffer } = require('buffer');
          globalThis.Buffer = NodeBuffer;
        } else {
          // Try to use a buffer polyfill if available via dynamic import
          // Note: This is a best-effort approach for ESM environments
          import('buffer').then(({ Buffer: PolyfillBuffer }) => {
            globalThis.Buffer = PolyfillBuffer;
          }).catch(() => {
            // Buffer not available, some functionality may be limited
            console.warn('@nillion/nilai-ts: Buffer not available, some functionality may be limited');
          });
        }
      } catch {
        // Buffer not available
      }
    }

    // Crypto polyfill for Node.js
    if (typeof globalThis.crypto === 'undefined') {
      try {
        if (typeof require !== 'undefined') {
          const crypto = require('crypto');
          // Use webcrypto if available (Node.js 16+), otherwise use crypto
          globalThis.crypto = crypto.webcrypto || crypto;
        }
      } catch {
        // crypto not available
        console.warn('@nillion/nilai-ts: crypto not available, some functionality may be limited');
      }
    }

    // TextEncoder/TextDecoder polyfills for older Node.js versions
    if (typeof globalThis.TextEncoder === 'undefined') {
      try {
        if (typeof require !== 'undefined') {
          const util = require('util');
          globalThis.TextEncoder = util.TextEncoder;
          globalThis.TextDecoder = util.TextDecoder;
        }
      } catch {
        // TextEncoder/TextDecoder not available
      }
    }
  }
}

// Auto-initialize when module is imported
ensureGlobals();

export { ensureGlobals }; 