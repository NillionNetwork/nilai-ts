import { describe, it, beforeEach } from "vitest";
import { NilaiOpenAIClient } from "../src/client";
import { AuthType, NilAuthInstance } from "../src/types";
import { DelegationTokenServer } from "#/server";

describe("DelegationTokenServer", () => {
  let client: NilaiOpenAIClient;
  let server: DelegationTokenServer;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      //  baseURL: "http://localhost:8088/v1/",
      baseURL: "https://nilai-a779.nillion.network/nuc/v1/",
      authType: AuthType.DELEGATION_TOKEN,
    });

    server = new DelegationTokenServer(process.env.NILLION_API_KEY || "", {
      nilauthInstance: NilAuthInstance.SANDBOX,
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
          model: "meta-llama/Llama-3.1-8B-Instruct",
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
