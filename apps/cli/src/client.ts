import axios from "axios";
import { env } from "./lib/env";

export const client = axios.create({
  baseURL: env.POCKETENV_API_URL,
});
