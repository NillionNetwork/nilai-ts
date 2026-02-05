# nilAI TypeScript SDK

A TypeScript SDK for the Nilai platform that provides delegation token management and OpenAI-compatible client functionality for accessing AI models through secure, decentralized infrastructure.

## 🚀 Quick Start

### Installation

This project uses [pnpm](https://pnpm.io/) for dependency management.

```bash
# Install dependencies
pnpm install
```

### Basic Usage

```typescript
import { NilaiOpenAIClient } from "@nillion/nilai-ts";
import "dotenv/config";

// Initialize client with API key from environment variables
const client = new NilaiOpenAIClient({
  baseURL: "https://api.nilai.nillion.network/nuc/v1/",
  apiKey: process.env.NILLION_API_KEY,
});

// Make a chat completion request
const response = await client.chat.completions.create({
  model: "meta-llama/Llama-3.1-8B-Instruct",
  messages: [{ role: "user", content: "Hello! Can you help me with something?" }],
});

console.log(`Response: ${response.choices[0].message.content}`);
```

## 📖 Usage Examples

### 1. API Key Mode (Simple)

The easiest way to get started. Your API key is your private key.

```typescript
import { NilaiOpenAIClient } from "@nillion/nilai-ts";
import "dotenv/config";

// Set up your API key in a .env file or environment variable
const client = new NilaiOpenAIClient({
  baseURL: "https://api.nilai.nillion.network/nuc/v1/",  
  apiKey: process.env.NILLION_API_KEY, // Your private key
});

// Make requests just like with OpenAI
const response = await client.chat.completions.create({
  model: "meta-llama/Llama-3.1-8B-Instruct",
  messages: [
    { role: "user", content: "Explain quantum computing in simple terms" },
  ],
});

console.log(response.choices[0].message.content);
```


To execute it:
```
pnpm i
pnpm exec tsx examples/0-api-key.ts
```

### 2. Delegation Token Mode (Advanced)

For more secure, distributed access where you want to separate server credentials from client usage.

```typescript
import {
  NilaiOpenAIClient,
  DelegationTokenServer,
  AuthType,
} from "@nillion/nilai-ts";
import "dotenv/config";

// Server-side: Create a delegation token server
const server = new DelegationTokenServer(process.env.NILLION_API_KEY, {
  expirationTime: 3600, // 1 hour validity
  tokenMaxUses: 10, // Allow 10 uses
});

// Client-side: Initialize client for delegation token mode
const client = new NilaiOpenAIClient({
  baseURL: "https://api.nilai.nillion.network/nuc/v1/",
  authType: AuthType.DELEGATION_TOKEN,
});

// Step 1: Client requests delegation
const delegationRequest = client.getDelegationRequest();

// Step 2: Server creates delegation token
const delegationToken = await server.createDelegationToken(delegationRequest);

// Step 3: Client uses the delegation token
client.updateDelegation(delegationToken);

// Step 4: Make authenticated requests
const response = await client.chat.completions.create({
  model: "meta-llama/Llama-3.1-8B-Instruct",
  messages: [
    { role: "user", content: "What are the benefits of decentralized AI?" },
  ],
});

console.log(response.choices[0].message.content);
```


To execute it:
```
pnpm i
pnpm exec tsx examples/1-delegation-token.ts
```

### 3. Environment Configuration

Create a `.env` file for your credentials:

```bash
# .env file
NILLION_API_KEY=your-private-key-for-nilai
```

Then in your code:

```typescript
import "dotenv/config";
import { NilaiOpenAIClient } from "@nillion/nilai-ts";

const client = new NilaiOpenAIClient({
  baseURL: "https://api.nilai.nillion.network/nuc/v1/",
  apiKey: process.env.NILLION_API_KEY,
});
```

## ✨ Features

- **🔐 Multiple Authentication Methods**: Support for API keys and delegation tokens.
- **🤖 OpenAI Compatibility**: Drop-in replacement for the OpenAI client.
- **⚡ Automatic Token Management**: Handles root token caching and expiration automatically.
- **🛡️ Secure Delegation**: Server-side token management with configurable expiration and usage limits.
- **🌐 Self-Signed NUCs**: Uses self-signed NUC tokens without requiring a remote nilauth service.
- **🔒 Type Safety**: Strongly typed with Zod schema validation for robust development.
- **🔧 Universal Compatibility**: Built-in polyfills for Node.js environments ensure seamless operation across different platforms without manual configuration.

## 🏗️ Architecture

### DelegationTokenServer

A server-side component responsible for:

-   Creating delegation tokens with configurable expiration and usage limits.
-   Managing the root token lifecycle and caching.
-   Handling cryptographic operations securely.

### NilaiOpenAIClient

An OpenAI-compatible client that:

-   Supports both API key and delegation token authentication.
-   Automatically handles NUC token creation and management.
-   Provides a familiar chat completion interface.

### Token Management

-   **Root Tokens**: Long-lived tokens for server authentication, managed by `DelegationTokenServer` or `NilaiOpenAIClient` in API Key mode.
-   **Delegation Tokens**: Short-lived, limited-use tokens for client operations.
-   **Automatic Refresh**: Expired root tokens are automatically refreshed when needed.

## ✅ Testing

### Running Tests

To run all tests:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

### Test Coverage

To run tests with coverage reporting:

```bash
pnpm test:coverage
```

## 📦 Development

### Code Quality

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

Run formatting:

```bash
pnpm fmt
```

Run linting:

```bash
pnpm lint
```

Run all checks:

```bash
pnpm ci
```

## 📂 Project Structure

```
src/
├── client.ts           # NilaiOpenAIClient class
├── server.ts           # DelegationTokenServer class
├── types.ts            # Type definitions and Zod schemas
├── utils.ts            # Utility functions
└── internal/
    └── debug_client.ts # Debug client
```
