import "dotenv/config";
import { NilaiOpenAIClient, NilAuthInstance } from "@nillion/nilai-ts";

// To obtain an API key, navigate to https://nilpay.vercel.app/
// and create a new subscription.
// The API key will be displayed in the subscription details.
// The NilaiOpenAIClient class automatically handles the NUC token creation and management.

const API_KEY = process.env.NILLION_API_KEY;

async function main() {
  // Initialize the client in API key mode
  // For sandbox, use the following:
  const client = new NilaiOpenAIClient({
    baseURL: "https://nilai-a779.nillion.network/v1/",
    apiKey: API_KEY,
    nilauthInstance: NilAuthInstance.SANDBOX,
    // For production, use the following:
    // nilauthInstance: NilAuthInstance.PRODUCTION,
  });

  // Make a request to the Nilai API
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
