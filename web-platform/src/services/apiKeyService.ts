let apiKey = "";
export function setApiKey(value: string) { apiKey = value.trim(); }
export function hasApiKey() { return Boolean(apiKey); }
export function apiKeyHeaders(): Record<string, string> {
  return apiKey ? { "X-OpenAI-Key": apiKey } : {};
}
