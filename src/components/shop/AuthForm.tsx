"use client";

import { useState } from "react";
import Link from "next/link";
import { PreparationNotice } from "./PreparationNotice";

type AuthMode = "login" | "signup";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [showNotice, setShowNotice] = useState(false);
  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-md">
      <div className="mb-10 text-center">
        <span className="font-sans text-xs tracking-[0.2em] text-primary/55">
          {isLogin ? "MEMBER LOGIN" : "JOIN PI COFFEE"}
        </span>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-primary sm:text-5xl">
          {isLogin ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-foreground/60">
          {isLogin
            ? "회원 서비스는 현재 준비 중입니다."
            : "회원가입 기능은 현재 준비 중입니다."}
        </p>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          setShowNotice(true);
        }}
      >
        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          이메일
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="example@email.com"
            className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground/70">
          비밀번호
          <input
            type="password"
            name="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            minLength={8}
            required
            placeholder="8자 이상 입력해 주세요"
            className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
          />
        </label>

        {!isLogin && (
          <>
            <label className="flex flex-col gap-2 text-sm text-foreground/70">
              비밀번호 확인
              <input
                type="password"
                name="password-confirm"
                autoComplete="new-password"
                minLength={8}
                required
                placeholder="비밀번호를 한 번 더 입력해 주세요"
                className="h-12 rounded-sm border border-border bg-background px-4 text-base text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary"
              />
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-foreground/65">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 accent-primary"
              />
              이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </>
        )}

        <button
          type="submit"
          className="mt-2 h-12 rounded-full bg-primary px-6 text-sm tracking-wide text-background transition-colors hover:bg-primary/90"
        >
          {isLogin ? "로그인" : "가입하기"}
        </button>

        {showNotice && (
          <PreparationNotice>
            아직 실제 회원 정보는 전송되거나 저장되지 않습니다. 회원 서비스가
            준비되면 이용하실 수 있습니다.
          </PreparationNotice>
        )}
      </form>

      <div className="mt-8 border-t border-border pt-6 text-center text-sm text-foreground/60">
        {isLogin ? "아직 회원이 아니신가요?" : "이미 회원이신가요?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </div>
    </div>
  );
}
