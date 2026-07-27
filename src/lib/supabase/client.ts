import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저(Client Component)에서 사용하는 Supabase 클라이언트.
 * 호출할 때마다 새 인스턴스를 만들어 반환한다.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
