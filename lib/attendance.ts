import { createHash, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { AttendanceData } from "@/types/attendance";

export const ATTENDANCE_ADMIN_COOKIE = "attendance_admin";

const attendanceFilePath = path.join(process.cwd(), "content", "attendance.json");
const attendanceKvKey = process.env.ATTENDANCE_KV_KEY?.trim() || "attendance:data";

const defaultAttendanceData: AttendanceData = {
  internshipName: "Internship Attendance",
  period: "2026-Q2",
  requiredDays: 0,
  presentDays: 0,
  lateDays: 0,
  leaveDays: 0,
  remoteDays: 0,
  notes: "",
  updatedAt: new Date(0).toISOString(),
};

function toSafeString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function toSafeInt(value: unknown, fallback = 0): number {
  const num = Number(value);

  if (!Number.isFinite(num)) {
    return fallback;
  }

  const normalized = Math.floor(num);
  return normalized < 0 ? 0 : normalized;
}

function normalizeAttendanceData(raw: unknown): AttendanceData {
  if (!raw || typeof raw !== "object") {
    return defaultAttendanceData;
  }

  const record = raw as Record<string, unknown>;
  const updatedAtRaw = toSafeString(record.updatedAt, "");
  const parsedUpdatedAt = Date.parse(updatedAtRaw);

  return {
    internshipName: toSafeString(record.internshipName, defaultAttendanceData.internshipName),
    period: toSafeString(record.period, defaultAttendanceData.period),
    requiredDays: toSafeInt(record.requiredDays),
    presentDays: toSafeInt(record.presentDays),
    lateDays: toSafeInt(record.lateDays),
    leaveDays: toSafeInt(record.leaveDays),
    remoteDays: toSafeInt(record.remoteDays),
    notes: toSafeString(record.notes),
    updatedAt: Number.isNaN(parsedUpdatedAt)
      ? new Date().toISOString()
      : new Date(parsedUpdatedAt).toISOString(),
  };
}

function clampAttendanceData(data: AttendanceData): AttendanceData {
  const requiredDays = Math.max(0, data.requiredDays);
  const presentDays = Math.min(Math.max(0, data.presentDays), requiredDays || data.presentDays);
  const lateDays = Math.max(0, data.lateDays);
  const leaveDays = Math.max(0, data.leaveDays);
  const remoteDays = Math.max(0, data.remoteDays);

  return {
    ...data,
    requiredDays,
    presentDays,
    lateDays,
    leaveDays,
    remoteDays,
  };
}

function hashSecret(secret: string): string {
  return createHash("sha256").update(`attendance:${secret}`).digest("hex");
}

function safeCompare(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function resolveKvConfig():
  | {
      url: string;
      token: string;
    }
  | null {
  const url =
    process.env.KV_REST_API_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
  const token =
    process.env.KV_REST_API_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), token };
}

async function kvGetJson(key: string): Promise<unknown | null> {
  const config = resolveKvConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/get/${encodeURIComponent(key)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV GET failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    result?: unknown;
    error?: string;
  };

  if (payload.error) {
    throw new Error(payload.error);
  }

  if (typeof payload.result !== "string") {
    return null;
  }

  try {
    return JSON.parse(payload.result);
  } catch {
    return null;
  }
}

async function kvSetJson(key: string, value: unknown): Promise<void> {
  const config = resolveKvConfig();

  if (!config) {
    throw new Error("KV is not configured");
  }

  const response = await fetch(`${config.url}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(value),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV SET failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    result?: unknown;
    error?: string;
  };

  if (payload.error) {
    throw new Error(payload.error);
  }
}

export function isAttendanceAdminEnabled(): boolean {
  return Boolean(process.env.ATTENDANCE_ADMIN_PASSWORD?.trim());
}

export function getAttendanceAdminTokenFromEnv(): string | null {
  const secret = process.env.ATTENDANCE_ADMIN_PASSWORD?.trim();

  if (!secret) {
    return null;
  }

  return hashSecret(secret);
}

export function verifyAttendancePassword(password: string): boolean {
  const secret = process.env.ATTENDANCE_ADMIN_PASSWORD?.trim();

  if (!secret) {
    return false;
  }

  return safeCompare(hashSecret(password.trim()), hashSecret(secret));
}

export function isAttendanceAdminCookieValid(cookieValue: string | undefined): boolean {
  if (!cookieValue) {
    return false;
  }

  const token = getAttendanceAdminTokenFromEnv();

  if (!token) {
    return false;
  }

  return safeCompare(cookieValue, token);
}

export async function readAttendanceData(): Promise<AttendanceData> {
  const kvConfig = resolveKvConfig();

  if (kvConfig) {
    try {
      const parsed = await kvGetJson(attendanceKvKey);

      if (parsed) {
        return clampAttendanceData(normalizeAttendanceData(parsed));
      }

      return {
        ...defaultAttendanceData,
        updatedAt: new Date().toISOString(),
      };
    } catch {
      return {
        ...defaultAttendanceData,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  try {
    const raw = await fs.readFile(attendanceFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    return clampAttendanceData(normalizeAttendanceData(parsed));
  } catch {
    return {
      ...defaultAttendanceData,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function writeAttendanceData(raw: unknown): Promise<AttendanceData> {
  const normalized = clampAttendanceData(normalizeAttendanceData(raw));
  const nextData = {
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  const kvConfig = resolveKvConfig();

  if (kvConfig) {
    await kvSetJson(attendanceKvKey, nextData);
    return nextData;
  }

  await fs.mkdir(path.dirname(attendanceFilePath), { recursive: true });
  await fs.writeFile(attendanceFilePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf-8");

  return nextData;
}
