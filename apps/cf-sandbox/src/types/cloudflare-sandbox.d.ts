import { getSandbox } from "@cloudflare/sandbox";

declare module "@cloudflare/sandbox" {
  interface Sandbox<Env> {
    terminal(
      request: Request,
      options?: {
        cols?: number;
        rows?: number;
      },
    ): Promise<Response>;

    getSession(sessionId: string): Promise<Sandbox<Env>>;
  }

  getSandbox: typeof getSandbox;
}
