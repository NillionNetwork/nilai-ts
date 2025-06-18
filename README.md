# Nilai OpenAI Client

A TypeScript OpenAI client wrapper that supports NilAuth delegation token authentication.

## Installation

```bash
npm install @your-org/nilai-openai-client
# or
pnpm add @your-org/nilai-openai-client
# or
yarn add @your-org/nilai-openai-client
```

## Usage

### API Key Authentication

```typescript
import { NilaiOpenAIClient, AuthType, NilAuthInstance } from '@your-org/nilai-openai-client';

const client = new NilaiOpenAIClient({
  auth_type: AuthType.API_KEY,
  api_key: 'your-hex-api-key',
  nilauth_instance: NilAuthInstance.SANDBOX,
  baseURL: 'https://api.nilai.com/v1',
});

// Use like a regular OpenAI client
const completion = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Delegation Token Authentication

#### Client Side

```typescript
import { NilaiOpenAIClient, AuthType } from '@your-org/nilai-openai-client';

const client = new NilaiOpenAIClient({
  auth_type: AuthType.DELEGATION_TOKEN,
  baseURL: 'https://api.nilai.com/v1',
});

// Get delegation request
const delegationRequest = await client.getDelegationRequest();
console.log('Public key for delegation:', delegationRequest.public_key);
console.log('Request type:', delegationRequest.type);

// Send this request to your backend server...

// After receiving delegation token from your backend
client.updateDelegation({
  type: RequestType.DELEGATION_TOKEN_RESPONSE,
  delegation_token: 'received-delegation-token'
});

// Now you can use the client
const completion = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

#### Server Side (Delegation Token Server)

```typescript
import { 
  DelegationTokenServer, 
  NilAuthInstance,
  RequestType 
} from '@your-org/nilai-openai-client';

// Initialize the delegation server with your private key
const delegationServer = new DelegationTokenServer(
  'your-server-private-key-hex',
  {
    nilauth_url: NilAuthInstance.SANDBOX,
    expiration_time: 300, // 5 minutes
    token_max_uses: 10,
  },
  NilAuthInstance.SANDBOX
);

// Handle delegation requests from clients
app.post('/api/delegate', async (req, res) => {
  const { public_key } = req.body;
  
  const delegationRequest = {
    type: RequestType.DELEGATION_TOKEN_REQUEST,
    public_key: public_key
  };

  try {
    const delegationResponse = await delegationServer.createDelegationToken(
      delegationRequest
    );
    res.json(delegationResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## API Reference

### NilaiOpenAIClient

Extends the OpenAI client with NilAuth authentication support.

#### Constructor Options

- `auth_type`: `AuthType.API_KEY` or `AuthType.DELEGATION_TOKEN`
- `api_key`: Required for API key authentication (hex string)
- `nilauth_instance`: NilAuth instance URL
- `baseURL`: API base URL
- All other OpenAI client options are supported

#### Methods

- `getDelegationRequest()`: Returns delegation request with public key and type
- `updateDelegation(response)`: Updates the client with delegation token

### DelegationTokenServer

Server-side class for creating delegation tokens.

#### Constructor

```typescript
new DelegationTokenServer(
  privateKey: string,
  config?: DelegationServerConfig,
  nilAuthInstance?: NilAuthInstance
)
```

#### Methods

- `createDelegationToken(request, configOverride?)`: Creates a delegation token

### Types

- `AuthType`: Authentication type enum
- `RequestType`: Request/response type enum
- `NilAuthInstance`: Predefined NilAuth instance URLs
- `DelegationTokenRequest`: Structure for delegation requests
- `DelegationTokenResponse`: Structure for delegation responses
- `DelegationServerConfig`: Configuration for delegation server

### Default Configuration

```typescript
import { DefaultDelegationTokenServerConfig } from '@your-org/nilai-openai-client';

// Default values:
// {
//   nilauth_url: NilAuthInstance.SANDBOX,
//   expiration_time: 60,
//   token_max_uses: 1,
// }
```

## Complete Example

### Backend (Express.js)

```typescript
import express from 'express';
import { DelegationTokenServer, NilAuthInstance } from '@your-org/nilai-openai-client';

const app = express();
app.use(express.json());

const delegationServer = new DelegationTokenServer(
  process.env.SERVER_PRIVATE_KEY!,
  {
    expiration_time: 300,
    token_max_uses: 10,
  }
);

app.post('/api/delegate', async (req, res) => {
  try {
    const delegationResponse = await delegationServer.createDelegationToken(req.body);
    res.json(delegationResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Frontend

```typescript
import { NilaiOpenAIClient, AuthType } from '@your-org/nilai-openai-client';

const client = new NilaiOpenAIClient({
  auth_type: AuthType.DELEGATION_TOKEN,
  baseURL: 'https://api.nilai.com/v1',
});

// Get delegation from your backend
const delegationRequest = await client.getDelegationRequest();
const response = await fetch('/api/delegate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(delegationRequest),
});

const delegationResponse = await response.json();
client.updateDelegation(delegationResponse);

// Use the client
const completion = await client.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Lint
pnpm run lint
```

## License

MIT for delegation requests
- `DelegationTokenResponse`: Structure for delegation responses

## Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Run tests
pnpm test

# Lint
pnpm run lint
```

## License

MIT