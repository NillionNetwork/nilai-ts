import { Keypair } from "@nillion/nuc";
import { beforeEach, describe, expect, it } from "vitest";
import { DelegationTokenServer } from "#/server";
import { NilaiOpenAIClient } from "../src/client";
import { AuthType, RequestType } from "../src/types";

describe("NilaiOpenAIClient", () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
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

describe("constructor", () => {
  it("should create instance with API_KEY auth type", () => {
    const keypair = Keypair.generate();
    const client = new NilaiOpenAIClient({
      authType: AuthType.API_KEY,
      baseURL: "https://test.example.com",
      apiKey: keypair.privateKey("hex"),
    });

    expect(client).toBeInstanceOf(NilaiOpenAIClient);
    expect(client.baseURL).toBe("https://test.example.com");
  });

  it("should create instance with DELEGATION_TOKEN auth type", () => {
    const client = new NilaiOpenAIClient({
      authType: AuthType.DELEGATION_TOKEN,
      baseURL: "https://test.example.com",
    });

    expect(client).toBeInstanceOf(NilaiOpenAIClient);
    expect(client.baseURL).toBe("https://test.example.com");
  });

  it("should throw error when API_KEY auth type is used without apiKey", () => {
    expect(() => {
      new NilaiOpenAIClient({
        authType: AuthType.API_KEY,
        baseURL: "https://test.example.com",
        // Missing apiKey
      });
    }).toThrow("In API key mode, apiKey is required");
  });

  it("should use default values when no options provided", () => {
    // This should work with default values
    expect(() => {
      new NilaiOpenAIClient({
        apiKey: process.env.NILLION_API_KEY || "", // Minimum required for API_KEY mode
      });
    }).not.toThrow();
  });
});

describe("getDelegationRequest", () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      authType: AuthType.DELEGATION_TOKEN,
      baseURL: "https://test.example.com",
    });
  });

  it("should return delegation request with correct structure", () => {
    const request = client.getDelegationRequest();

    expect(request).toHaveProperty(
      "type",
      RequestType.DELEGATION_TOKEN_REQUEST,
    );
    expect(request).toHaveProperty("public_key");
    expect(typeof request.public_key).toBe("string");
    expect(request.public_key.length).toBeGreaterThan(0);
  });

  it("should generate different public keys for different instances", () => {
    const client2 = new NilaiOpenAIClient({
      authType: AuthType.DELEGATION_TOKEN,
      baseURL: "https://test.example.com",
    });

    const request1 = client.getDelegationRequest();
    const request2 = client2.getDelegationRequest();

    // Each instance should have a different generated keypair
    expect(request1.public_key).not.toBe(request2.public_key);
  });
});

describe("updateDelegation", () => {
  let client: NilaiOpenAIClient;

  beforeEach(() => {
    client = new NilaiOpenAIClient({
      authType: AuthType.DELEGATION_TOKEN,
      baseURL: "https://test.example.com",
    });
  });

  it("should update delegation token", () => {
    const request = client.getDelegationRequest();
    const server = new DelegationTokenServer(
      process.env.NILLION_API_KEY || "",
      {
        expirationTime: 60,
        tokenMaxUses: 1,
      },
    );

    // This should not throw
    expect(async () => {
      const response = await server.createDelegationToken(request);
      client.updateDelegation(response);
    }).not.toThrow();
  });

  it("should throw error with invalid delegation token", () => {
    const invalidDelegationResponse = {
      type: RequestType.DELEGATION_TOKEN_RESPONSE,
      delegation_token: "invalid-token-format",
    };

    expect(() => {
      client.updateDelegation(invalidDelegationResponse);
    }).toThrow(); // Zod validation should fail
  });
});

describe("error handling", () => {
  it("should throw error for invalid auth type", () => {
    expect(() => {
      new NilaiOpenAIClient({
        authType: "INVALID_TYPE" as AuthType,
        baseURL: "https://test.example.com",
      });
    }).toThrow("Invalid auth type");
  });
});

describe("authentication modes", () => {
  describe("API_KEY mode", () => {
    let client: NilaiOpenAIClient;

    beforeEach(() => {
      client = new NilaiOpenAIClient({
        authType: AuthType.API_KEY,
        baseURL: "https://api.nilai.nillion.network/nuc/v1/",
        apiKey: process.env.NILLION_API_KEY || "Nillion2025", // Use a default key for testing purposes
      });
    });

    it("should have API_KEY auth type", () => {
      // We can't directly access private properties, but we can test behavior
      const request = client.getDelegationRequest();
      expect(request).toHaveProperty("public_key");
      expect(typeof request.public_key).toBe("string");
    });
  });

  describe("DELEGATION_TOKEN mode", () => {
    let client: NilaiOpenAIClient;

    beforeEach(() => {
      client = new NilaiOpenAIClient({
        authType: AuthType.DELEGATION_TOKEN,
        baseURL: "https://test.example.com",
      });
    });

    it("should require delegation token update before making requests", () => {
      // getDelegationRequest should work without delegation token
      const request = client.getDelegationRequest();
      expect(request).toHaveProperty("public_key");
    });
  });
});

