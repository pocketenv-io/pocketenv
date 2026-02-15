import type { Context } from "context";
import type { Db } from "./db";

declare global {
  namespace Express {
    interface Request {
      ctx: Context;
    }
  }
}
