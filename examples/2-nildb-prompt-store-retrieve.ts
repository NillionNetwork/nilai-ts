import "dotenv/config";
import {
  AuthType,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  DelegationTokenServer,
  NilAuthInstance,
  NilaiOpenAIClient,
} from "@nillion/nilai-ts";
import { Did as DidClass } from "@nillion/nuc";

// To obtain an API key, navigate to https://nilpay.vercel.app/
// and create a new subscription.
// The API key will be displayed in the subscription details.

const API_KEY = process.env.NILLION_API_KEY;

async function store_to_nildb(prompt: string): Promise<[string, string]> {
  // Initialize the client in API key mode
  // For sandbox, use the following:
  const client = new NilaiOpenAIClient({
    baseURL: "https://nilai-f910.nillion.network/nuc/v1/",
    apiKey: API_KEY,
    nilauthInstance: NilAuthInstance.PRODUCTION,
  });

  const createdIds: string[] = await client.createPrompt(prompt);
  console.log(`Created IDS on nilDB: ${createdIds}`);
  const keypair = client.getKeypair();
  if (!keypair) {
    throw new Error("Keypair not available");
  }
  const ownerDid = new DidClass(keypair.publicKey()).toString();
  return [createdIds[0], ownerDid];
}

async function main() {
  if (!API_KEY) {
    throw new Error("NILLION_API_KEY environment variable is required");
  }
  // First, we store the prompt in nilDB
  const [doc_id, owner_did] = await store_to_nildb(
    "You are a very clever model that answers with cheese answers and always starting with the word cheese",
  );
  // >>> Server initializes a delegation token server
  // The server is responsible for creating delegation tokens
  // and managing their expiration and usage.
  const server = new DelegationTokenServer(API_KEY, {
    nilauthInstance: NilAuthInstance.PRODUCTION,
    expirationTime: 60 * 60, // 3600 seconds = 1 hour validity of delegation tokens
    tokenMaxUses: 10, // 10 uses of a delegation token
    prompt_document: {
      owner_did: owner_did, // Replace with your DID
      doc_id: doc_id, // Replace with your document ID
    },
  });

  // >>> Client initializes a client
  // The client is responsible for making requests to the Nilai API.
  // We do not provide an API key but we set the auth type to DELEGATION_TOKEN
  const client = new NilaiOpenAIClient({
    baseURL: "https://nilai-f910.nillion.network/nuc/v1/",
    authType: AuthType.DELEGATION_TOKEN,
    // For production instances, use the following:
    nilauthInstance: NilAuthInstance.PRODUCTION,
  });
  console.log("Requesting delegation token from NilAI Server");

  // >>> Client produces a delegation request
  const delegationRequest: DelegationTokenRequest =
    client.getDelegationRequest();
  console.log(
    "Client DID for delegation:",
    `did:nil:${delegationRequest.public_key}`,
  );

  console.log(`Delegation Request: ${JSON.stringify(delegationRequest)}`);

  // <<< Server creates a delegation token
  const delegationToken: DelegationTokenResponse =
    await server.createDelegationToken(delegationRequest);

  console.log(`Delegation Token: ${JSON.stringify(delegationToken)}`);

  // >>> Client sets internally the delegation token
  client.updateDelegation(delegationToken);

  console.log("Making a chat completion request to NilAI Server");
  // >>> Client uses the delegation token to make a request
  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "user", content: "Hello! Can you help me with something?" },
    ],
  });

  console.log(`Response: ${response.choices[0].message.content}`);
}

// Run the example
main().catch(console.error);
