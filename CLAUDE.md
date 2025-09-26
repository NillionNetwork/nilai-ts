# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Nilai TypeScript SDK** - a TypeScript SDK for accessing AI models through Nillion's decentralized infrastructure. It provides delegation token management and OpenAI-compatible client functionality with secure authentication mechanisms.

## Core Architecture

### Main Components

- **NilaiOpenAIClient** (`src/client.ts`): OpenAI-compatible client that supports both API key and delegation token authentication
- **DelegationTokenServer** (`src/server.ts`): Server-side component for creating delegation tokens with configurable expiration and usage limits
- **Types & Schemas** (`src/types.ts`): Zod-based type definitions and validation schemas
- **Utils** (`src/utils.ts`): Utility functions for token validation and cryptographic operations
- **Polyfills** (`src/polyfills.ts`): Browser/Node.js compatibility polyfills

### Authentication Flow

The SDK supports two authentication modes:
1. **API Key Mode**: Direct authentication using private key
2. **Delegation Token Mode**: Secure distributed access where server credentials are separated from client usage

Token hierarchy: Root Tokens (long-lived, server auth) → Delegation Tokens (short-lived, limited-use client operations)

## Development Commands

### Package Management
Uses **pnpm** (version 10.12.1) for dependency management.

```bash
pnpm install                    # Install dependencies
```

### Build & Development
```bash
pnpm build                      # Build the project with tsup
pnpm dev                        # Build in watch mode
```

### Testing
```bash
pnpm test                       # Run tests once
pnpm test:watch                 # Run tests in watch mode
pnpm test:coverage              # Run tests with coverage report
pnpm test:coverage:watch        # Run tests with coverage in watch mode
```

### Code Quality
Uses **Biome** for linting and formatting:

```bash
pnpm fmt                        # Format code
pnpm lint                       # Lint code
pnpm lint:fix                   # Lint and auto-fix issues
pnpm ci                         # Run all checks (equivalent to biome check)
```

### Examples
```bash
pnpm example:api-key            # Run API key example
pnpm example:delegation-token   # Run delegation token example
```

## Key Configuration Files

- **tsup.config.ts**: Build configuration (ESM output, dual entry points: index.ts + polyfills.ts)
- **vitest.config.ts**: Test configuration with 80% coverage thresholds
- **biome.json**: Strict linting rules with import cycle detection
- **tsconfig.json**: TypeScript configuration

## External Dependencies

Key dependencies:
- `@nillion/nuc`: Core Nillion Network utilities for token management
- `@nillion/secretvaults`: Secret management
- `openai`: OpenAI client (extended by this SDK)
- `zod`: Schema validation
- `@noble/curves`: Cryptographic operations

## Project Structure

```
src/
├── client.ts           # NilaiOpenAIClient class
├── server.ts           # DelegationTokenServer class
├── types.ts            # Type definitions and Zod schemas
├── utils.ts            # Utility functions
├── polyfills.ts        # Browser/Node compatibility
├── index.ts            # Main exports
└── internal/
    └── debug_client.ts # Debug utilities

examples/               # Usage examples
tests/                  # Test files
```

## Testing Strategy

- Uses **Vitest** as the test runner
- Test files can be in `src/**/*.{test,spec}.{js,ts}` or `tests/**/*.{test,spec}.{js,ts}`
- Environment variables loaded from `.env.test`
- Coverage thresholds set to 80% for all metrics
- Debug mode enabled with `DEBUG=@nillion*`

## Build Output

- Format: ESM only
- Outputs: `dist/index.js`, `dist/polyfills.js` with corresponding `.d.ts` files
- Source maps and minification enabled
- Package exports configured for both main module and polyfills