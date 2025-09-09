import { describe, it, beforeEach } from "vitest";
import { NilaiOpenAIClient } from "../src/client";

describe("NilaiOpenAIClient", () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      //baseURL: "http://localhost:8088/v1/",
      baseURL: "https://nilai-a779.nillion.network/v1/",
      apiKey: process.env.NILLION_API_KEY || "",
    });
  });

  describe("e2e test", () => {
    it("should add authorization header via prepareRequest", async () => {
      try {
        const _completion = await client.chat.completions.create({
          model: "google/gemma-3-27b-it",
          messages: [
            { role: "system", content: "Talk like a pirate." },
            { role: "user", content: "Are semicolons optional in JavaScript?" },
          ],
        });

        //console.log(completion);
      } catch (error: any) {
        console.error("Full error:", error);
        if (error.response) {
          console.error("Error response body:", await error.response.text());
        }
        throw error;
      }
    });
  });
});
