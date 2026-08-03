import "server-only";

import type { ShippingRules } from "@/lib/checkout/catalog";

type PaymentMode = "test" | "live";

export type CheckoutConfig = {
  enabled: boolean;
  allowGuestCheckout: boolean;
  allowDeliveryMemo: boolean;
  shippingRules: ShippingRules;
  tossClientKey: string;
  tossSecretKey: string;
  paymentMode: PaymentMode;
};

function parseBoolean(name: string, defaultValue?: boolean) {
  const value = process.env[name];
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be set to true or false.`);
}

function parseNonNegativeInteger(name: string, defaultValue?: number) {
  const value = process.env[name];
  if (value === undefined && defaultValue !== undefined) return defaultValue;
  const parsed = Number(value);

  if (!value || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }

  return parsed;
}

function parseFreeShippingThreshold() {
  const value = process.env.FREE_SHIPPING_THRESHOLD_KRW;
  if (value === undefined) return 50000;
  if (value === "NONE") return null;
  return parseNonNegativeInteger("FREE_SHIPPING_THRESHOLD_KRW");
}

function getPaymentMode(clientKey: string, secretKey: string): PaymentMode {
  const clientMatch = clientKey.match(/^(test|live)_gck_/);
  const secretMatch = secretKey.match(/^(test|live)_gsk_/);

  if (!clientMatch || !secretMatch) {
    throw new Error("Toss Payments widget keys are invalid.");
  }

  const clientMode = clientMatch[1] as PaymentMode;
  const secretMode = secretMatch[1] as PaymentMode;

  if (clientMode !== secretMode) {
    throw new Error("Toss Payments client and secret keys must use one mode.");
  }

  if (clientMode === "live" && process.env.ALLOW_LIVE_PAYMENTS !== "true") {
    throw new Error("Live payments require explicit final approval.");
  }

  return clientMode;
}

export function getCheckoutConfig(): CheckoutConfig {
  const tossClientKey = process.env.TOSS_CLIENT_KEY;
  const tossSecretKey = process.env.TOSS_SECRET_KEY;

  if (!tossClientKey || !tossSecretKey) {
    throw new Error("Toss Payments environment variables are missing.");
  }

  return {
    enabled: parseBoolean("CHECKOUT_ENABLED"),
    allowGuestCheckout: parseBoolean("ALLOW_GUEST_CHECKOUT", false),
    allowDeliveryMemo: parseBoolean("ALLOW_DELIVERY_MEMO", true),
    shippingRules: {
      shippingFee: parseNonNegativeInteger("SHIPPING_FEE_KRW", 3000),
      freeShippingThreshold: parseFreeShippingThreshold(),
    },
    tossClientKey,
    tossSecretKey,
    paymentMode: getPaymentMode(tossClientKey, tossSecretKey),
  };
}

export function getCheckoutReadiness() {
  try {
    const config = getCheckoutConfig();
    const hasSupabaseAdmin = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    return {
      ready: config.enabled && hasSupabaseAdmin,
      config,
    };
  } catch {
    return { ready: false, config: null };
  }
}

export function getPaymentBackendConfig() {
  const tossSecretKey = process.env.TOSS_SECRET_KEY;
  const secretMatch = tossSecretKey?.match(/^(test|live)_gsk_/);

  if (!tossSecretKey || !secretMatch) {
    throw new Error("Toss Payments secret key is missing.");
  }

  const paymentMode = secretMatch[1] as PaymentMode;
  if (paymentMode === "live" && process.env.ALLOW_LIVE_PAYMENTS !== "true") {
    throw new Error("Live payments require explicit final approval.");
  }

  return { tossSecretKey, paymentMode };
}
