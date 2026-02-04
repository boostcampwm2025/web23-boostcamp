export function isDevAuthEnabled(): boolean {
  return process.env.DEV_AUTH === "true";
}
