import { createHash, timingSafeEqual } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "redis";
import type { AttendanceData, AttendanceEntry, AttendanceStatus } from "@/types/attendance";

export const ATTENDANCE_ADMIN_COOKIE = "attendance_admin";

const attendanceFilePath = path.join(process.cwd(), "content", "attendance.json");
const attendanceKvKey = process.env.ATTENDANCE_KV_KEY?.trim() || "attendance:data";
const redisUrl = process.env.KV_REDIS_URL?.trim() || "";
type AttendanceRedisClient = ReturnType<typeof createClient>;
let redisClientPromise: Promise<AttendanceRedisClient> | null = null;

const defaultAttendanceData: AttendanceData = {
  internshipName: "Internship Attendance",
  period: "2026-Q2",
  requiredDays: 0,
  presentDays: 0,
  lateDays: 0,
  leaveDays: 0,
  remoteDays: 0,
  notes: "",
  entries: [],
  fixedOffDates: [],
  updatedAt: new Date(0).toISOString(),
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const validStatuses: AttendanceStatus[] = ["present", "leave", "off", "unset"];

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

function isValidDateKey(value: string): boolean {
  if (!datePattern.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

function normalizeStatus(value: unknown): AttendanceStatus {
  if (typeof value === "string" && validStatuses.includes(value as AttendanceStatus)) {
    return value as AttendanceStatus;
  }

  return "unset";
}

function normalizeAttendanceEntries(value: unknown): AttendanceEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = new Map<string, AttendanceEntry>();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as Record<string, unknown>;
    const date = toSafeString(record.date, "");

    if (!isValidDateKey(date)) {
      continue;
    }

    const note = toSafeString(record.note, "");
    const overtimeHoursRaw = record.overtimeHours;
    const overtimeHours =
      overtimeHoursRaw === undefined || overtimeHoursRaw === null
        ? undefined
        : Math.max(0, Number(overtimeHoursRaw));

    deduped.set(date, {
      date,
      status: normalizeStatus(record.status),
      note: note || undefined,
      overtimeHours: Number.isFinite(overtimeHours) ? overtimeHours : undefined,
    });
  }

  return Array.from(deduped.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeFixedOffDates(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = new Set<string>();

  for (const item of value) {
    const date = toSafeString(item, "");
    if (isValidDateKey(date)) {
      deduped.add(date);
    }
  }

  return Array.from(deduped).sort((a, b) => a.localeCompare(b));
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
    entries: normalizeAttendanceEntries(record.entries),
    fixedOffDates: normalizeFixedOffDates(record.fixedOffDates),
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
  const entries = normalizeAttendanceEntries(data.entries);
  const fixedOffDates = normalizeFixedOffDates(data.fixedOffDates);

  return {
    ...data,
    requiredDays,
    presentDays,
    lateDays,
    leaveDays,
    remoteDays,
    entries,
    fixedOffDates,
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

function isRedisConfigured(): boolean {
  return Boolean(redisUrl);
}

async function getRedisClient(): Promise<AttendanceRedisClient> {
  if (!redisUrl) {
    throw new Error("KV_REDIS_URL is not configured");
  }

  if (!redisClientPromise) {
    const client = createClient({
      url: redisUrl,
    });

    client.on("error", () => {
      // Keep runtime stable; read/write handlers already handle failures.
    });

    redisClientPromise = (async () => {
      await client.connect();
      return client;
    })();
  }

  return redisClientPromise;
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
  if (isRedisConfigured()) {
    try {
      const redis = await getRedisClient();
      const raw = await redis.get(attendanceKvKey);

      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
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

  if (isRedisConfigured()) {
    const redis = await getRedisClient();
    await redis.set(attendanceKvKey, JSON.stringify(nextData));
    return nextData;
  }

  await fs.mkdir(path.dirname(attendanceFilePath), { recursive: true });
  await fs.writeFile(attendanceFilePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf-8");

  return nextData;
}
