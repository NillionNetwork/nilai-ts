import { OpenAI, type ClientOptions } from "openai";
import {
  type NucTokenEnvelope,
  NucTokenBuilder,
  NilauthClient,
  PayerBuilder,
  Keypair,
  Did,
  InvocationBody,
  NucTokenEnvelopeSchema,
} from "@nillion/nuc";

import {
  AuthType,
  NilAuthInstance,
  type DelegationTokenRequest,
  type DelegationTokenResponse,
  type NilaiClientOptions,
  type NilAuthPublicKey,
  RequestType,
} from "./types";

import { isExpired } from "./utils";

export interface NilaiOpenAIClientOptions
  extends NilaiClientOptions,
    ClientOptions {
  authType?: AuthType;
  nilauthInstance?: NilAuthInstance;
}
export class NilaiOpenAIClient extends OpenAI {
  private authType: AuthType = AuthType.API_KEY;
  private nilAuthInstance: NilAuthInstance = NilAuthInstance.SANDBOX;
  private nilAuthPrivateKey: Keypair | null = null;
  private _rootTokenEnvelope: NucTokenEnvelope | null = null;
  private delegationToken: NucTokenEnvelope | null = null;
  private nilaiPublicKey: NilAuthPublicKey | null = null;

  constructor(
    options: NilaiOpenAIClientOptions = {
      authType: AuthType.API_KEY,
      nilauthInstance: NilAuthInstance.SANDBOX,
      apiKey: "",
      baseURL: "",
    },
  ) {
    const {
      authType = AuthType.API_KEY,
      nilauthInstance = NilAuthInstance.SANDBOX,
      apiKey,
      ...openAIOptions
    } = options;

    // Set up authentication
    const processedOptions = { apiKey: apiKey, ...openAIOptions };
    switch (authType) {
      case AuthType.API_KEY:
        if (!apiKey) {
          throw new Error("In API key mode, apiKey is required");
        }
        break;
      case AuthType.DELEGATION_TOKEN:
        processedOptions.apiKey = "<placeholder>";
        // Because no real API key is needed, we can allow the browser to use it
        processedOptions.dangerouslyAllowBrowser = true;
        break;
      default:
        throw new Error(`Invalid auth type: ${authType}`);
    }

    // Set up the client
    super(processedOptions);

    this.authType = authType;
    this.nilAuthInstance = nilauthInstance;

    this._initializeAuth(apiKey);
  }

  private _initializeAuth(api_key?: string): void {
    switch (this.authType) {
      case AuthType.API_KEY:
        this._apiKeyInit(api_key!);
        break;
      case AuthType.DELEGATION_TOKEN:
        this._delegationTokenInit();
        break;
    }
  }

  private _apiKeyInit(api_key: string): void {
    try {
      this.nilAuthPrivateKey = Keypair.from(api_key);
    } catch (error) {
      throw new Error(
        `Failed to initialize API key. Format provided is not a valid secp256k1 private key: ${error}`,
      );
    }
  }

  private _delegationTokenInit(): void {
    // Generate a new private key for the client
    this.nilAuthPrivateKey = Keypair.generate();
  }

  private async _getNilaiPublicKey(): Promise<NilAuthPublicKey> {
    if (this.nilaiPublicKey) {
      return this.nilaiPublicKey;
    }

    try {
      const response = await fetch(`${this.baseURL}public_key`);
      const publicKeyData = await response.text();
      this.nilaiPublicKey = Buffer.from(publicKeyData, "base64");
      return this.nilaiPublicKey;
    } catch (error) {
      throw new Error(`Failed to retrieve the nilai public key: ${error}`);
    }
  }

  private async _getRootToken(): Promise<NucTokenEnvelope> {
    if (this.authType !== AuthType.API_KEY) {
      throw new Error("Root token is only available in API key mode");
    }
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }

    if (!this._rootTokenEnvelope || isExpired(this._rootTokenEnvelope)) {
      const nilauthClient = await NilauthClient.from(
        this.nilAuthInstance,
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

  getDelegationRequest(): DelegationTokenRequest {
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }

    return {
      type: RequestType.DELEGATION_TOKEN_REQUEST,
      public_key: this.nilAuthPrivateKey.publicKey("hex"),
    };
  }

  updateDelegation(delegationTokenResponse: DelegationTokenResponse): void {
    try {
      this.delegationToken = NucTokenEnvelopeSchema.parse(
        delegationTokenResponse.delegation_token,
      );
    } catch (error) {
      console.error("Failed to update delegation token:", error);
      throw error;
    }
  }

  private async _getInvocationToken(): Promise<string> {
    switch (this.authType) {
      case AuthType.API_KEY:
        return this._getInvocationTokenWithApiKey();
      case AuthType.DELEGATION_TOKEN:
        return this._getInvocationTokenWithDelegation();
      default:
        throw new Error("Invalid auth type");
    }
  }

  private async _getInvocationTokenWithDelegation(): Promise<string> {
    if (this.authType !== AuthType.DELEGATION_TOKEN) {
      throw new Error(
        "Invocation token is only available through delegation token mode",
      );
    }
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }
    if (!this.delegationToken) {
      throw new Error("Delegation token not set. Call updateDelegation first.");
    }
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }

    if (isExpired(this.delegationToken)) {
      throw new Error(
        "Delegation token is expired. Call updateDelegation first.",
      );
    }
    const nilaiPublicKey = await this._getNilaiPublicKey();

    const invocationToken = NucTokenBuilder.extending(this.delegationToken)
      .body(new InvocationBody({}))
      .audience(new Did(nilaiPublicKey))
      .build(this.nilAuthPrivateKey.privateKey());
    return invocationToken;
  }

  private async _getInvocationTokenWithApiKey(): Promise<string> {
    if (this.authType !== AuthType.API_KEY) {
      throw new Error(
        "Invocation token is only available through API key mode",
      );
    }
    if (!this.nilAuthPrivateKey) {
      throw new Error("NilAuthPrivateKey not set. Call _initializeAuth first.");
    }

    const rootToken = await this._getRootToken();
    const nilaiPublicKey = await this._getNilaiPublicKey();

    const invocationToken = NucTokenBuilder.extending(rootToken)
      .body(new InvocationBody({}))
      .audience(new Did(nilaiPublicKey))
      .build(this.nilAuthPrivateKey.privateKey());

    return invocationToken;
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  protected override async prepareRequest(
    request: any, // any should be RequestInit but it is internal to openai
    { url, options }: { url: string; options: any }, // any should be FinalRequestOptions but it is internal to openai
  ): Promise<void> {
    await super.prepareRequest(request, { url, options });
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  protected override async prepareOptions(options: any): Promise<void> {
    await super.prepareOptions(options);
    const invocationToken = await this._getInvocationToken();
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${invocationToken}`,
    };
  }
}
