import axios from "axios";
import { API_URL } from "../consts";

export const client = axios.create({
  baseURL: API_URL,
});
