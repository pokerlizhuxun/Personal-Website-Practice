import { NextResponse } from "next/server";
import {
  ATTENDANCE_ADMIN_COOKIE,
  getAttendanceAdminTokenFromEnv,
  isAttendanceAdminEnabled,
  verifyAttendancePassword,
} from "@/lib/attendance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginPayload = {
  password?: string;
};

export async function POST(request: Request) {
  if (!isAttendanceAdminEnabled()) {
    return NextResponse.json(
      { message: "Admin password is not configured on the server." },
      { status: 400 },
    );
  }

  let payload: LoginPayload | null = null;

  try {
    payload = (await request.json()) as LoginPayload;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload?.password || !verifyAttendancePassword(payload.password)) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const token = getAttendanceAdminTokenFromEnv();

  if (!token) {
    return NextResponse.json({ message: "Auth token unavailable" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ATTENDANCE_ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });

  return response;
}
