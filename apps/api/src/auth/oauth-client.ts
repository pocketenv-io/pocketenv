import {
  type AuthorizeOptions,
  NodeOAuthClient,
  type NodeOAuthClientOptions,
  type OAuthAuthorizationRequestParameters,
} from "@atproto/oauth-client-node";
import { FALLBACK_ALG, negotiateClientAuthMethod } from "./oauth-client-auth";

export class CustomOAuthClient extends NodeOAuthClient {
  constructor(options: NodeOAuthClientOptions) {
    super(options);
  }

  override async authorize(
    input: string,
    { signal, ...options }: AuthorizeOptions = {},
  ): Promise<URL> {
    const redirectUri =
      options?.redirect_uri ?? this.clientMetadata.redirect_uris[0];
    if (!this.clientMetadata.redirect_uris.includes(redirectUri)) {
      // The server will enforce this, but let's catch it early
      throw new TypeError("Invalid redirect_uri");
    }

    const { identityInfo, metadata } = await this.oauthResolver.resolve(input, {
      signal,
    });

    const pkce = await this.runtime.generatePKCE();
    const dpopKey = await this.runtime.generateKey(
      metadata.dpop_signing_alg_values_supported || [FALLBACK_ALG],
    );

    const authMethod = negotiateClientAuthMethod(
      metadata,
      this.clientMetadata,
      this.keyset,
    );
    const state = await this.runtime.generateNonce();

    await this.stateStore.set(state, {
      iss: metadata.issuer,
      authMethod,
      dpopKey,
      verifier: pkce.verifier,
      appState: options?.state,
    });

    const parameters: OAuthAuthorizationRequestParameters = {
      ...options,

      client_id: this.clientMetadata.client_id,
      redirect_uri: redirectUri,
      code_challenge: pkce.challenge,
      code_challenge_method: pkce.method,
      state,
      login_hint: identityInfo && !options.prompt ? input : undefined,
      response_mode: this.responseMode,
      response_type: "code" as const,
      scope: options?.scope ?? this.clientMetadata.scope,
    };

    const authorizationUrl = new URL(metadata.authorization_endpoint);

    // Since the user will be redirected to the authorization_endpoint url using
    // a browser, we need to make sure that the url is valid.
    if (
      authorizationUrl.protocol !== "https:" &&
      authorizationUrl.protocol !== "http:"
    ) {
      throw new TypeError(
        `Invalid authorization endpoint protocol: ${authorizationUrl.protocol}`,
      );
    }

    if (metadata.pushed_authorization_request_endpoint) {
      const server = await this.serverFactory.fromMetadata(
        metadata,
        authMethod,
        dpopKey,
      );
      const parResponse = await server.request(
        "pushed_authorization_request",
        parameters,
      );

      authorizationUrl.searchParams.set(
        "client_id",
        this.clientMetadata.client_id,
      );
      authorizationUrl.searchParams.set("request_uri", parResponse.request_uri);
      return authorizationUrl;
    } else if (metadata.require_pushed_authorization_requests) {
      throw new Error(
        "Server requires pushed authorization requests (PAR) but no PAR endpoint is available",
      );
    } else {
      for (const [key, value] of Object.entries(parameters)) {
        if (value) authorizationUrl.searchParams.set(key, String(value));
      }

      // Length of the URL that will be sent to the server
      const urlLength =
        authorizationUrl.pathname.length + authorizationUrl.search.length;
      if (urlLength < 2048) {
        return authorizationUrl;
      } else if (!metadata.pushed_authorization_request_endpoint) {
        throw new Error("Login URL too long");
      }
    }

    throw new Error(
      "Server does not support pushed authorization requests (PAR)",
    );
  }
}
