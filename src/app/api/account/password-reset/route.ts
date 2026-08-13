import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get("pi_password_recovery")?.value !== "verified") {
    return NextResponse.json(
      { message: "재설정 링크가 만료되었습니다. 메일을 다시 받아 주세요." },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    password?: string;
    passwordConfirm?: string;
  } | null;

  if (!body?.password || body.password.length < 8) {
    return NextResponse.json(
      { message: "새 비밀번호는 8자 이상 입력해 주세요." },
      { status: 400 },
    );
  }
  if (body.password !== body.passwordConfirm) {
    return NextResponse.json(
      { message: "새 비밀번호가 서로 일치하지 않습니다." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { message: "재설정 링크가 만료되었습니다. 메일을 다시 받아 주세요." },
      { status: 401 },
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: body.password,
  });
  if (error) {
    return NextResponse.json(
      { message: "비밀번호를 변경하지 못했습니다. 새 비밀번호를 확인해 주세요." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("pi_password_recovery");
  return response;
}
