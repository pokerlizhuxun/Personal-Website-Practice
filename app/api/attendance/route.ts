import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ATTENDANCE_ADMIN_COOKIE,
  isAttendanceAdminCookieValid,
  isAttendanceAdminEnabled,
  readAttendanceData,
  writeAttendanceData,
} from "@/lib/attendance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const canEdit = isAttendanceAdminCookieValid(cookieStore.get(ATTENDANCE_ADMIN_COOKIE)?.value);
  const data = await readAttendanceData();

  return NextResponse.json({
    data,
    canEdit,
    authEnabled: isAttendanceAdminEnabled(),
  });
}

export async function PUT(request: Request) {
  const cookieStore = await cookies();
  const canEdit = isAttendanceAdminCookieValid(cookieStore.get(ATTENDANCE_ADMIN_COOKIE)?.value);

  if (!canEdit) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  try {
    const data = await writeAttendanceData(payload);
    return NextResponse.json({ data, canEdit: true, authEnabled: true });
  } catch {
    return NextResponse.json(
      {
        message:
          "Unable to save attendance data. Configure KV_REST_API_URL and KV_REST_API_TOKEN on Vercel for persistent writes.",
      },
      { status: 500 },
    );
  }
}
