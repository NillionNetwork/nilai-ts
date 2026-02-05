import {
  Command,
  DelegationBody,
  Did as DidClass,
  Keypair,
  NucTokenBuilder,
  type NucTokenEnvelope,
  NucTokenEnvelopeSchema,
} from "@nillion/nuc";

import {
  DefaultDelegationTokenServerConfig,
  type DelegationServerConfig,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
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
      const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const selfDid = new DidClass(this.nilAuthPrivateKey.publicKey());
      const rootTokenString = NucTokenBuilder.delegation([])
        .command(new Command(["nil", "ai", "generate"]))
        .audience(selfDid)
        .subject(selfDid)
        .expiresAt(expirationTime)
        .build(this.nilAuthPrivateKey.privateKey());
      this._rootTokenEnvelope =
        NucTokenEnvelopeSchema.parse(rootTokenString);
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
      new Date(Date.now() + config.expirationTime * 1000).getTime() / 1000,
    );

    const publicKeyBytes = hexToBytes(delegationTokenRequest.public_key);

    let meta: Record<string, unknown> = { usage_limit: config.tokenMaxUses };
    if (config.prompt_document) {
      meta = {
        ...meta,
        document_id: config.prompt_document.doc_id,
        document_owner_did: config.prompt_document.owner_did,
      };
    }
    const delegatedToken = NucTokenBuilder.extending(rootToken)
      .body(new DelegationBody([]))
      .expiresAt(expirationTime)
      .audience(new DidClass(publicKeyBytes))
      .command(new Command(["nil", "ai", "generate"]))
      .meta(meta)
      .build(this.nilAuthPrivateKey.privateKey());

    console.log(`Delegated Token Meta: ${JSON.stringify(meta)}`);
    return {
      type: RequestType.DELEGATION_TOKEN_RESPONSE,
      delegation_token: delegatedToken,
    };
  }
}
