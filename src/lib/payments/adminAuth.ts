/**
 * 관리자 API 인증
 *
 * 이전 구현: `NEXT_PUBLIC_ADMIN_SECRET`을 Bearer 토큰과 단순 비교했음.
 * `NEXT_PUBLIC_` 접두어가 붙은 환경 변수는 Next.js가 클라이언트 빌드에
 * 그대로 인라인하므로, 누구나 브라우저 devtools/소스에서 이 "시크릿" 값을
 * 읽어 동일한 헤더로 직접 API를 호출할 수 있었음 — 실질적으로 인증이
 * 전혀 동작하지 않는 상태였음.
 *
 * 변경 후: 클라이언트는 로그인한 Supabase 세션의 access token을
 * `Authorization: Bearer <access_token>`으로 전달하고, 서버는
 * service role 키로 해당 토큰의 사용자를 조회한 뒤
 * profiles.role === 'admin' 인지 확인한다.
 *
 * CRON_SECRET(서버 전용 env, NEXT_PUBLIC_ 아님)은 Vercel Cron 등
 * 브라우저가 아닌 호출을 위해 그대로 유지한다.
 */
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return false;

  // 서버 전용 시크릿 (cron job 등 비-브라우저 호출)
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) return true;

  // Supabase 사용자 세션 검증
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) return false;

  // profiles.role === 'admin' 확인
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  return profile?.role === "admin";
}
