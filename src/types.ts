import { z } from "zod";
import { secp256k1 } from "@noble/curves/secp256k1";
import { bytesToHex, hexToBytes } from "@noble/curves/utils";

// Zod enum schemas
export const AuthType = {
  API_KEY: "API_KEY" as const,
  DELEGATION_TOKEN: "DELEGATION_TOKEN" as const,
} as const;

export const AuthTypeSchema = z.nativeEnum(AuthType);
export type AuthType = z.infer<typeof AuthTypeSchema>;

export const NilAuthInstance = {
  SANDBOX: "https://nilauth.sandbox.app-cluster.sandbox.nilogy.xyz" as const,
  PRODUCTION: "https://nilauth.nillion.network" as const,
} as const;

export const NilAuthInstanceSchema = z.nativeEnum(NilAuthInstance);
export type NilAuthInstance = z.infer<typeof NilAuthInstanceSchema>;

export const RequestType = {
  DELEGATION_TOKEN_REQUEST: "DELEGATION_TOKEN_REQUEST" as const,
  DELEGATION_TOKEN_RESPONSE: "DELEGATION_TOKEN_RESPONSE" as const,
} as const;

export const RequestTypeSchema = z.nativeEnum(RequestType);
export type RequestType = z.infer<typeof RequestTypeSchema>;

// Zod object schemas
export const DelegationServerConfigSchema = z.object({
  nilauthInstance: NilAuthInstanceSchema.default(NilAuthInstance.SANDBOX),
  expirationTime: z.number().positive().default(60),
  tokenMaxUses: z.number().positive().default(1),
});
export type DelegationServerConfig = z.infer<
  typeof DelegationServerConfigSchema
>;

export const DelegationTokenRequestSchema = z.object({
  type: RequestTypeSchema.default(RequestType.DELEGATION_TOKEN_REQUEST),
  public_key: z.string(),
});
export type DelegationTokenRequest = z.infer<
  typeof DelegationTokenRequestSchema
>;

export const DelegationTokenResponseSchema = z.object({
  type: RequestTypeSchema.default(RequestType.DELEGATION_TOKEN_RESPONSE),
  delegation_token: z.string(),
});
export type DelegationTokenResponse = z.infer<
  typeof DelegationTokenResponseSchema
>;

export const NilaiClientOptionsSchema = z.object({
  authType: AuthTypeSchema.default(AuthType.DELEGATION_TOKEN).optional(),
  nilauthInstance: NilAuthInstanceSchema.default(
    NilAuthInstance.SANDBOX,
  ).optional(),
});
export type NilaiClientOptions = z.infer<typeof NilaiClientOptionsSchema>;

export const InvocationArgsSchema = z.record(z.string(), z.any());
export type InvocationArgs = z.infer<typeof InvocationArgsSchema>;

// Constants with validation
export const DefaultDelegationTokenServerConfig: DelegationServerConfig =
  DelegationServerConfigSchema.parse({
    nilauthInstance: NilAuthInstance.SANDBOX,
    expirationTime: 60,
    tokenMaxUses: 1,
  });

// Noble curves types for cryptographic keys
export type NilAuthPrivateKey = Uint8Array; // Private keys are typically Uint8Array
export type NilAuthPublicKey = Uint8Array; // Public keys are typically Uint8Array

// Helper class for private key operations
export class NilAuthPrivateKeyManager {
  constructor(private key: Uint8Array) {}

  static fromHex(hex: string): NilAuthPrivateKeyManager {
    return new NilAuthPrivateKeyManager(hexToBytes(hex));
  }

  toBytes(): Uint8Array {
    return this.key;
  }

  toHex(): string {
    return bytesToHex(this.key);
  }

  getPublicKey(): Uint8Array {
    return secp256k1.getPublicKey(this.key);
  }
}
