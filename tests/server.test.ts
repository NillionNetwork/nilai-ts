import { beforeEach, describe, it } from "vitest";
import { DelegationTokenServer } from "#/server";
import { NilaiOpenAIClient } from "../src/client";
import { AuthType } from "../src/types";

describe("DelegationTokenServer", () => {
  let client: NilaiOpenAIClient;
  let server: DelegationTokenServer;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      //  baseURL: "http://localhost:8088/v1/",
      baseURL: "https://api.nilai.nillion.network/nuc/v1/",
      authType: AuthType.DELEGATION_TOKEN,
    });

    server = new DelegationTokenServer(process.env.NILLION_API_KEY || "", {
      expirationTime: 60,
      tokenMaxUses: 1,
    });
  });

  describe("e2e test", () => {
    it("should allow to use delegation token", async () => {
      try {
        const request = client.getDelegationRequest();
        const response = await server.createDelegationToken(request);
        console.log(response);
        client.updateDelegation(response);

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
