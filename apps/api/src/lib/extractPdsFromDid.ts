export default async function extractPdsFromDid(
  did: string,
): Promise<string | null> {
  let didDocUrl: string;

  if (did.startsWith("did:plc:")) {
    didDocUrl = `https://plc.directory/${did}`;
  } else if (did.startsWith("did:web:")) {
    const domain = did.substring("did:web:".length);
    didDocUrl = `https://${domain}/.well-known/did.json`;
  } else {
    throw new Error("Unsupported DID method");
  }

  const response = await fetch(didDocUrl);
  if (!response.ok) throw new Error("Failed to fetch DID doc");

  const doc = (await response.json()) as {
    service?: Array<{
      type: string;
      id: string;
      serviceEndpoint: string;
    }>;
  };

  // Find the atproto PDS service
  const pdsService = doc.service?.find(
    (s: any) =>
      s.type === "AtprotoPersonalDataServer" && s.id.endsWith("#atproto_pds"),
  );

  return pdsService?.serviceEndpoint ?? null;
}
