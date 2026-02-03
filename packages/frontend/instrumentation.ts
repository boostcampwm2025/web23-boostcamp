/**
 * Next.js Instrumentation Hook
 * 서버 시작 시 MSW(Mock Service Worker)를 초기화합니다.
 * NEXT_PUBLIC_API_MOCK=true 환경변수가 설정되어 있을 때만 동작합니다.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PUBLIC_API_MOCK === "true") {
      const { server } = await import("./mocks/server");
      server.listen({ onUnhandledRequest: "bypass" });
    }
  }
}
