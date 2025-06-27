import "dotenv/config";
import {
  NilaiOpenAIClient,
  DelegationTokenServer,
  AuthType,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  NilAuthInstance,
} from "@nillion/nilai-ts";

// To obtain an API key, navigate to https://nilpay.vercel.app/
// and create a new subscription.
// The API key will be displayed in the subscription details.

const API_KEY = process.env.NILLION_API_KEY;

async function main() {
  if (!API_KEY) {
    throw new Error("NILLION_API_KEY environment variable is required");
  }

  // >>> Server initializes a delegation token server
  // The server is responsible for creating delegation tokens
  // and managing their expiration and usage.
  const server = new DelegationTokenServer(
    API_KEY,
    {
      nilauthInstance: NilAuthInstance.SANDBOX,
      expirationTime: 10, // 10 seconds validity of delegation tokens
      tokenMaxUses: 1,    // 1 use of a delegation token
    },
    // For production instances, use the following:
    // NilAuthInstance.PRODUCTION,
  );

  // >>> Client initializes a client
  // The client is responsible for making requests to the Nilai API.
  // We do not provide an API key but we set the auth type to DELEGATION_TOKEN
  const client = new NilaiOpenAIClient({
    baseURL: "https://nilai-a779.nillion.network/nuc/v1/",
    authType: AuthType.DELEGATION_TOKEN,
    // For production instances, use the following:
    // nilauthInstance: NilAuthInstance.PRODUCTION,
  });

  // >>> Client produces a delegation request
  const delegationRequest: DelegationTokenRequest = client.getDelegationRequest();

  // <<< Server creates a delegation token
  const delegationToken: DelegationTokenResponse = await server.createDelegationToken(
    delegationRequest
  );

  // >>> Client sets internally the delegation token
  client.updateDelegation(delegationToken);

  // >>> Client uses the delegation token to make a request
  const response = await client.chat.completions.create({
    model: "meta-llama/Llama-3.2-3B-Instruct",
    messages: [
      { role: "user", content: "Hello! Can you help me with something?" }
    ],
  });

  console.log(`Response: ${response.choices[0].message.content}`);
}

// Run the example
main().catch(console.error);
