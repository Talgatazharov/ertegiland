export async function browserAI(action: string, payload: unknown, signal: AbortSignal): Promise<Response> {
  return fetch("/api/ai/" + action, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal});
}
