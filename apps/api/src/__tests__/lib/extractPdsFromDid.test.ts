import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import extractPdsFromDid from "../../lib/extractPdsFromDid";

const makeFetch = (body: unknown, ok = true) =>
  vi.fn().mockResolvedValue({
    ok,
    json: vi.fn().mockResolvedValue(body),
  });

describe("extractPdsFromDid", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", makeFetch({}));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the plc.directory URL for did:plc DIDs", async () => {
    const fetchMock = makeFetch({ service: [] });
    vi.stubGlobal("fetch", fetchMock);

    await extractPdsFromDid("did:plc:abc123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://plc.directory/did:plc:abc123",
    );
  });

  it("builds the well-known URL for did:web DIDs", async () => {
    const fetchMock = makeFetch({ service: [] });
    vi.stubGlobal("fetch", fetchMock);

    await extractPdsFromDid("did:web:example.com");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/.well-known/did.json",
    );
  });

  it("throws for unsupported DID methods", async () => {
    await expect(extractPdsFromDid("did:key:xyz")).rejects.toThrow(
      "Unsupported DID method",
    );
  });

  it("throws when the DID doc fetch fails", async () => {
    vi.stubGlobal("fetch", makeFetch({}, false));

    await expect(extractPdsFromDid("did:plc:abc123")).rejects.toThrow(
      "Failed to fetch DID doc",
    );
  });

  it("returns the PDS endpoint when the AtprotoPersonalDataServer service is present", async () => {
    const doc = {
      service: [
        {
          id: "did:plc:abc123#atproto_pds",
          type: "AtprotoPersonalDataServer",
          serviceEndpoint: "https://bsky.social",
        },
      ],
    };
    vi.stubGlobal("fetch", makeFetch(doc));

    const result = await extractPdsFromDid("did:plc:abc123");
    expect(result).toBe("https://bsky.social");
  });

  it("returns null when no matching service is present", async () => {
    vi.stubGlobal("fetch", makeFetch({ service: [] }));

    const result = await extractPdsFromDid("did:plc:abc123");
    expect(result).toBeNull();
  });

  it("returns null when service array is absent", async () => {
    vi.stubGlobal("fetch", makeFetch({}));

    const result = await extractPdsFromDid("did:plc:abc123");
    expect(result).toBeNull();
  });

  it("ignores services whose id does not end with #atproto_pds", async () => {
    const doc = {
      service: [
        {
          id: "did:plc:abc123#other",
          type: "AtprotoPersonalDataServer",
          serviceEndpoint: "https://should-not-match.example",
        },
      ],
    };
    vi.stubGlobal("fetch", makeFetch(doc));

    const result = await extractPdsFromDid("did:plc:abc123");
    expect(result).toBeNull();
  });
});
