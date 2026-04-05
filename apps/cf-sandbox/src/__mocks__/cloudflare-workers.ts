export const env = {
  PUBLIC_KEY: "mock-public-key",
  PRIVATE_KEY: "mock-private-key",
  POCKETENV_COPY: {
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
};
