import {
  type NucTokenEnvelope,
  NucTokenBuilder,
  NilauthClient,
  Keypair,
  Did,
  Command,
  PayerBuilder,
  DelegationBody,
} from "@nillion/nuc";

import {
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  type DelegationServerConfig,
  DefaultDelegationTokenServerConfig,
  RequestType,
} from "./types";

import { hexToBytes, isExpired } from "./utils";

export class DelegationTokenServer {
  private config: DelegationServerConfig;
  private nilAuthPrivateKey: Keypair;
  private _rootTokenEnvelope: NucTokenEnvelope | null = null;

  constructor(
    privateKey: string,
    config: DelegationServerConfig = DefaultDelegationTokenServerConfig,
  ) {
    this.config = config;
    this.nilAuthPrivateKey = Keypair.from(privateKey);
  }

  /**
   * Get the root token envelope. If the root token is expired, it will be refreshed.
   * The root token is used to create delegation tokens.
   */
  private async _getRootToken(): Promise<NucTokenEnvelope> {
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }

    if (!this._rootTokenEnvelope || isExpired(this._rootTokenEnvelope)) {
      const nilauthClient = await NilauthClient.from(
        this.config.nilauthInstance,
        await new PayerBuilder()
          .chainUrl("https://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz")
          .keypair(this.nilAuthPrivateKey)
          .build(),
      );
      const rootTokenResponse = await nilauthClient.requestToken(
        this.nilAuthPrivateKey,
        "nilai",
      );
      this._rootTokenEnvelope = rootTokenResponse.token;
    }

    return this._rootTokenEnvelope;
  }

  /**
   * Create a delegation token.
   *
   * @param delegationTokenRequest - The delegation token request
   * @param configOverride - Optional configuration override
   * @returns The delegation token response
   */
  async createDelegationToken(
    delegationTokenRequest: DelegationTokenRequest,
    configOverride?: DelegationServerConfig,
  ): Promise<DelegationTokenResponse> {
    const config = configOverride || this.config;
    const rootToken = await this._getRootToken();

    // Calculate expiration time
    const expirationTime = Math.floor(
      new Date(Date.now() + 10 * 1000).getTime() / 1000,
    );

    const publicKeyBytes = hexToBytes(delegationTokenRequest.public_key);

    const delegatedToken = NucTokenBuilder.extending(rootToken)
      .body(new DelegationBody([]))
      .expiresAt(expirationTime)
      .audience(new Did(publicKeyBytes))
      .command(new Command(["nil", "ai", "generate"]))
      .meta({ usage_limit: config.tokenMaxUses })
      .build(this.nilAuthPrivateKey.privateKey());

    return {
      type: RequestType.DELEGATION_TOKEN_RESPONSE,
      delegation_token: delegatedToken,
    };
  }
}
