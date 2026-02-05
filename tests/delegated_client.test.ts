import { beforeEach, describe, it } from "vitest";
import { NilaiOpenAIClient } from "../src/client";

describe("NilaiOpenAIClient", () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      //baseURL: "http://localhost:8088/v1/",
      baseURL: "https://api.nilai.nillion.network/nuc/v1/",
      apiKey: process.env.NILLION_API_KEY || "",
    });
  });

  describe("e2e test", () => {
    it("should add authorization header via prepareRequest", async () => {
      try {
        const _completion = await client.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: "Talk like a pirate." },
            { role: "user", content: "Are semicolons optional in JavaScript?" },
          ],
        });

        //console.log(completion);
      } catch (error: unknown) {
        console.error("Full error:", error);
        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const errorWithResponse = error as { response: Response };
          console.error(
            "Error response body:",
            await errorWithResponse.response.text(),
          );
        }
        throw error;
      }
    });
  });
});
