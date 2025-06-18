import {
    NucTokenEnvelope,
    NucTokenBuilder,
    NilAuthPrivateKey,
    NilauthClient,
    BlindModule,
    Did,
    Command,
  } from '@nillion/nuc';
  
  import {
    DelegationTokenRequest,
    DelegationTokenResponse,
    DelegationServerConfig,
    DefaultDelegationTokenServerConfig,
    NilAuthInstance,
    RequestType,
  } from './types';
  import { isExpired, hexToBytes } from './utils';
  
  export class DelegationTokenServer {
    private config: DelegationServerConfig;
    private privateKey: NilAuthPrivateKey;
    private nilAuthInstance: string;
    private _rootTokenEnvelope: NucTokenEnvelope | null = null;
  
    constructor(
      privateKey: string,
      config: DelegationServerConfig = DefaultDelegationTokenServerConfig,
      nilAuthInstance: string = NilAuthInstance.SANDBOX
    ) {
      this.config = config;
      this.privateKey = new NilAuthPrivateKey(hexToBytes(privateKey));
      this.nilAuthInstance = nilAuthInstance;
    }
  
    /**
     * Get the root token envelope. If the root token is expired, it will be refreshed.
     * The root token is used to create delegation tokens.
     */
    private async getRootToken(): Promise<NucTokenEnvelope> {
      if (!this._rootTokenEnvelope || isExpired(this._rootTokenEnvelope)) {
        const nilAuthClient = new NilauthClient(this.nilAuthInstance);
        const rootTokenResponse = await nilAuthClient.requestToken(
          this.privateKey,
          { blindModule: BlindModule.NILAI }
        );
        this._rootTokenEnvelope = NucTokenEnvelope.parse(rootTokenResponse);
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
      configOverride?: DelegationServerConfig
    ): Promise<DelegationTokenResponse> {
      const config = configOverride || this.config;
      const rootToken = await this.getRootToken();
  
      const publicKeyBytes = hexToBytes(delegationTokenRequest.public_key);
      
      // Calculate expiration time
      const expirationTime = new Date();
      expirationTime.setSeconds(
        expirationTime.getSeconds() + (config.expiration_time || 60)
      );
  
      const delegatedToken = NucTokenBuilder
        .extending(rootToken)
        .expiresAt(expirationTime)
        .audience(new Did(publicKeyBytes))
        .command(new Command(['nil', 'ai', 'generate']))
        .meta({ usage_limit: config.token_max_uses || 1 })
        .build(this.privateKey);
  
      return {
        type: RequestType.DELEGATION_TOKEN_RESPONSE,
        delegation_token: delegatedToken,
      };
    }
  }