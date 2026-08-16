import "server-only";

import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type SocialProvider = "kakao" | "naver";

type SocialProfile = {
  email: string;
  name: string;
  nickname: string;
  phone: string;
  birth: string;
};

const EMPTY_PROFILE: SocialProfile = {
  email: "",
  name: "",
  nickname: "",
  phone: "",
  birth: "",
};

function cleanText(value: unknown, maxLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeEmail(value: unknown) {
  const email = cleanText(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function normalizeKoreanPhone(value: unknown) {
  let digits = cleanText(value, 30).replace(/\D/g, "");

  if (digits.startsWith("82")) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.startsWith("10") && digits.length === 10) {
    digits = `0${digits}`;
  }

  if (!/^010\d{8}$/.test(digits)) return "";
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function normalizeBirth(value: unknown) {
  const raw = cleanText(value, 20);
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 8) return "";

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  const birth = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  if (
    year < 1900 ||
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day ||
    birth.getTime() >
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  ) {
    return "";
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function joinBirth(year: unknown, birthday: unknown) {
  const yearDigits = cleanText(year, 4).replace(/\D/g, "");
  const birthdayDigits = cleanText(birthday, 10).replace(/\D/g, "");
  return normalizeBirth(`${yearDigits}${birthdayDigits}`);
}

function mergeProfiles(...profiles: Partial<SocialProfile>[]) {
  return profiles.reduce<SocialProfile>(
    (merged, profile) => ({
      email: merged.email || profile.email || "",
      name: merged.name || profile.name || "",
      nickname: merged.nickname || profile.nickname || "",
      phone: merged.phone || profile.phone || "",
      birth: merged.birth || profile.birth || "",
    }),
    { ...EMPTY_PROFILE },
  );
}

function profileFromUserMetadata(user: User): SocialProfile {
  const metadata = user.user_metadata ?? {};
  return {
    email: normalizeEmail(
      user.email ?? metadata.email ?? metadata.contact_email,
    ),
    name: cleanText(metadata.name ?? metadata.full_name, 30),
    nickname: cleanText(
      metadata.nickname ?? metadata.user_name ?? metadata.preferred_username,
      20,
    ),
    phone: normalizeKoreanPhone(
      metadata.phone ?? metadata.phone_number ?? metadata.mobile,
    ),
    birth:
      normalizeBirth(metadata.birth ?? metadata.birthdate) ||
      joinBirth(metadata.birthyear, metadata.birthday),
  };
}

async function fetchNaverProfile(providerToken: string) {
  const response = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${providerToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return EMPTY_PROFILE;
  const body = (await response.json()) as {
    resultcode?: string;
    response?: Record<string, unknown>;
  };
  const profile = body.response ?? {};

  return {
    email: normalizeEmail(profile.email),
    name: cleanText(profile.name, 30),
    nickname: cleanText(profile.nickname, 20),
    phone: normalizeKoreanPhone(profile.mobile),
    birth: joinBirth(profile.birthyear, profile.birthday),
  } satisfies SocialProfile;
}

async function fetchKakaoProfile(providerToken: string) {
  const response = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${providerToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return EMPTY_PROFILE;
  const body = (await response.json()) as {
    kakao_account?: {
      email?: unknown;
      name?: unknown;
      phone_number?: unknown;
      birthyear?: unknown;
      birthday?: unknown;
      profile?: { nickname?: unknown };
    };
    properties?: { nickname?: unknown };
  };
  const account = body.kakao_account ?? {};

  return {
    email: normalizeEmail(account.email),
    name: cleanText(account.name, 30),
    nickname: cleanText(
      account.profile?.nickname ?? body.properties?.nickname,
      20,
    ),
    phone: normalizeKoreanPhone(account.phone_number),
    birth: joinBirth(account.birthyear, account.birthday),
  } satisfies SocialProfile;
}

export function getSocialProvider(user: User): SocialProvider | null {
  if (user.identities?.some((identity) => identity.provider === "kakao")) {
    return "kakao";
  }
  if (
    user.identities?.some((identity) => identity.provider === "custom:naver")
  ) {
    return "naver";
  }
  return null;
}

export async function syncSocialProfile({
  user,
  providerToken,
}: {
  user: User;
  providerToken?: string | null;
}) {
  const provider = getSocialProvider(user);
  if (!provider) return { provider: null, needsOnboarding: false } as const;

  let providerProfile = EMPTY_PROFILE;
  if (providerToken) {
    try {
      providerProfile =
        provider === "naver"
          ? await fetchNaverProfile(providerToken)
          : await fetchKakaoProfile(providerToken);
    } catch {
      // 제공사 프로필 조회가 실패해도 로그인 자체는 계속 진행한다.
    }
  }

  const socialProfile = mergeProfiles(
    providerProfile,
    profileFromUserMetadata(user),
  );
  const admin = getSupabaseAdminClient();
  const { data: currentProfile } = await admin
    .from("profiles")
    .select("name, nickname, phone, birth")
    .eq("id", user.id)
    .maybeSingle();

  const profileUpdates: Record<string, string> = {};
  if (!currentProfile?.name && socialProfile.name) {
    profileUpdates.name = socialProfile.name;
  }
  if (!currentProfile?.nickname && socialProfile.nickname) {
    profileUpdates.nickname = socialProfile.nickname;
  }
  if (!currentProfile?.phone && socialProfile.phone) {
    profileUpdates.phone = socialProfile.phone;
  }
  if (!currentProfile?.birth && socialProfile.birth) {
    profileUpdates.birth = socialProfile.birth;
  }

  if (Object.keys(profileUpdates).length > 0) {
    await admin.from("profiles").update(profileUpdates).eq("id", user.id);
  }

  const currentAppMetadata = user.app_metadata ?? {};
  const appMetadata = {
    ...currentAppMetadata,
    social_provider: provider,
    social_profile_synced_at: new Date().toISOString(),
    ...(socialProfile.email
      ? { social_email: socialProfile.email }
      : {}),
  };

  await admin.auth.admin.updateUserById(user.id, { app_metadata: appMetadata });

  return {
    provider,
    needsOnboarding: currentAppMetadata.social_onboarding_completed !== true,
  } as const;
}
