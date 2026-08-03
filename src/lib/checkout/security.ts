import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const ORDER_LOOKUP_COOKIE = "pi-order-lookup";

export class InvalidRequestError extends Error {}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (!origin || origin !== requestOrigin) {
    throw new InvalidRequestError("허용되지 않은 요청입니다.");
  }
}

export async function readJsonBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (!contentType.includes("application/json") || contentLength > 64_000) {
    throw new InvalidRequestError("요청 형식이 올바르지 않습니다.");
  }

  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 64_000) {
      throw new InvalidRequestError("요청 본문이 너무 큽니다.");
    }
    return JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof InvalidRequestError) throw error;
    throw new InvalidRequestError("요청 본문을 읽을 수 없습니다.");
  }
}

export function createOrderLookupToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashOrderLookupToken(token) };
}

export function hashOrderLookupToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function parseOrderLookupCookie(value: string | undefined) {
  if (!value) return null;
  const separatorIndex = value.indexOf(".");
  if (separatorIndex < 1) return null;

  const orderId = value.slice(0, separatorIndex);
  const token = value.slice(separatorIndex + 1);
  if (!orderId || !token) return null;

  return { orderId, tokenHash: hashOrderLookupToken(token) };
}
