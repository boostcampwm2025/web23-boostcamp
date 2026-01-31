export function isApiMockEnabled(): boolean {
  return process.env.API_MOCK === "true";
}

export function isDevAuthEnabled(): boolean {
  return process.env.DEV_AUTH === "true";
}
