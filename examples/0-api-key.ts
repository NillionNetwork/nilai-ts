import "dotenv/config";
import { NilaiOpenAIClient } from "@nillion/nilai-ts";

// To obtain an API key, navigate to https://developer.nillion.com/
// and create a public DID / private API key.

// The NilaiOpenAIClient class automatically handles the NUC token creation and management.

const API_KEY = process.env.NILLION_API_KEY;

async function main() {
  // Initialize the client in API key mode
  const client = new NilaiOpenAIClient({
    baseURL: "https://api.nilai.nillion.network/nuc/v1/",
    apiKey: API_KEY,
  });

  // Make a request to the Nilai API
  const response = await client.chat.completions.create({
    model: "google/gemma-4-26B-A4B-it",
    messages: [
      { role: "user", content: "Hello! Can you help me with something?" },
    ],
  });

  console.log(`Response: ${response.choices[0].message.content}`);
}

// Run the example
main().catch(console.error);
