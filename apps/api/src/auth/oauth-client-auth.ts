import type {
  ClientMetadata,
  Keyset,
  OAuthAuthorizationServerMetadata,
} from "@atproto/oauth-client-node";

import type { ClientAuthMethod } from "@atproto/oauth-client/dist/oauth-client-auth";

export const FALLBACK_ALG = "ES256";

function supportedMethods(serverMetadata: OAuthAuthorizationServerMetadata) {
  return serverMetadata["token_endpoint_auth_methods_supported"];
}

function supportedAlgs(serverMetadata: OAuthAuthorizationServerMetadata) {
  return (
    serverMetadata["token_endpoint_auth_signing_alg_values_supported"] ?? [
      // @NOTE If not specified, assume that the server supports the ES256
      // algorithm, as prescribed by the spec:
      //
      // > Clients and Authorization Servers currently must support the ES256
      // > cryptographic system [for client authentication].
      //
      // https://atproto.com/specs/oauth#confidential-client-authentication
      FALLBACK_ALG,
    ]
  );
}

export function negotiateClientAuthMethod(
  serverMetadata: OAuthAuthorizationServerMetadata,
  clientMetadata: ClientMetadata,
  keyset?: Keyset,
): ClientAuthMethod {
  const method = clientMetadata.token_endpoint_auth_method;

  // @NOTE ATproto spec requires that AS support both "none" and
  // "private_key_jwt", and that clients use one of the other. The following
  // check ensures that the AS is indeed compliant with this client's
  // configuration.
  const methods = supportedMethods(serverMetadata);
  if (!methods.includes(method)) {
    throw new Error(
      `The server does not support "${method}" authentication. Supported methods are: ${methods.join(
        ", ",
      )}.`,
    );
  }

  if (method === "private_key_jwt") {
    // Invalid client configuration. This should not happen as
    // "validateClientMetadata" already check this.
    if (!keyset) throw new Error("A keyset is required for private_key_jwt");

    const alg = supportedAlgs(serverMetadata);

    // @NOTE we can't use `keyset.findPrivateKey` here because we can't enforce
    // that the returned key contains a "kid". The following implementation is
    // more robust against keysets containing keys without a "kid" property.
    for (const key of keyset.list({ alg, usage: "sign" })) {
      // Return the first key from the key set that matches the server's
      // supported algorithms.
      if (key.kid) return { method: "private_key_jwt", kid: key.kid };
    }

    throw new Error(
      alg.includes(FALLBACK_ALG)
        ? `Client authentication method "${method}" requires at least one "${FALLBACK_ALG}" signing key with a "kid" property`
        : // AS is not compliant with the ATproto OAuth spec.
          `Authorization server requires "${method}" authentication method, but does not support "${FALLBACK_ALG}" algorithm.`,
    );
  }

  if (method === "none") {
    return { method: "none" };
  }

  throw new Error(
    `The ATProto OAuth spec requires that client use either "none" or "private_key_jwt" authentication method.` +
      (method === "client_secret_basic"
        ? ' You might want to explicitly set "token_endpoint_auth_method" to one of those values in the client metadata document.'
        : ` You set "${method}" which is not allowed.`),
  );
}
