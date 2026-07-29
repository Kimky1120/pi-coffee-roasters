import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function getBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) return null;

  return { url, publishableKey };
}

/**
 * 브라우저에서 공유하는 Supabase 클라이언트.
 * 현재 Vercel의 Publishable Key를 우선 사용하고, 기존 ANON_KEY 설정도
 * 호환한다.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const config = getBrowserConfig();
  if (!config) return null;

  if (!browserClient) {
    browserClient = createBrowserClient(config.url, config.publishableKey);
  }

  return browserClient;
}

/** 기존 컴포넌트와의 호환을 위한 필수 설정 버전. */
export function createClient(): SupabaseClient {
  const client = getSupabaseBrowserClient();

  if (!client) {
    throw new Error("Supabase browser environment variables are missing.");
  }

  return client;
}
