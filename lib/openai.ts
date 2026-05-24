import OpenAI from "openai";

export const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
export const DEFAULT_MODEL = "deepseek-chat";

export function createClient(userKey?: string | null, baseUrl?: string | null) {
  const key = userKey || process.env.DEEPSEEK_API_KEY;
  return new OpenAI({
    apiKey: key,
    baseURL: baseUrl || DEFAULT_BASE_URL,
  });
}
