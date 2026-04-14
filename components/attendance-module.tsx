"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/types/content";
import type { AttendanceData } from "@/types/attendance";

type AttendanceApiResponse = {
  data: AttendanceData;
  canEdit: boolean;
  authEnabled: boolean;
};

const dictionary = {
  zh: {
    sectionTitle: "实习出勤统计",
    sectionDesc: "访客仅可查看，你登录后可更新这部分数据。",
    internshipName: "实习名称",
    period: "统计周期",
    requiredDays: "应到天数",
    presentDays: "出勤天数",
    lateDays: "迟到天数",
    leaveDays: "请假天数",
    remoteDays: "远程办公天数",
    notes: "备注",
    rate: "出勤率",
    absentDays: "缺勤天数",
    lastUpdated: "最后更新",
    loading: "正在加载出勤数据...",
    loginTitle: "管理员登录",
    loginHint: "只有输入管理员密码后才可编辑。",
    passwordLabel: "管理员密码",
    loginButton: "登录并编辑",
    logoutButton: "退出编辑",
    saveButton: "保存统计",
    saving: "保存中...",
    loginError: "密码错误或登录失败。",
    saveError: "保存失败，请稍后重试。",
    authMissing: "服务器未配置管理员密码，当前只能查看。",
    saveSuccess: "已保存",
  },
  en: {
    sectionTitle: "Internship Attendance",
    sectionDesc: "Visitors can view only. You can update this section after admin login.",
    internshipName: "Internship",
    period: "Period",
    requiredDays: "Required Days",
    presentDays: "Present Days",
    lateDays: "Late Days",
    leaveDays: "Leave Days",
    remoteDays: "Remote Days",
    notes: "Notes",
    rate: "Attendance Rate",
    absentDays: "Absent Days",
    lastUpdated: "Last Updated",
    loading: "Loading attendance data...",
    loginTitle: "Admin Login",
    loginHint: "Only the admin password can unlock editing.",
    passwordLabel: "Admin Password",
    loginButton: "Login to Edit",
    logoutButton: "Log Out",
    saveButton: "Save Stats",
    saving: "Saving...",
    loginError: "Invalid password or login failed.",
    saveError: "Failed to save. Please try again.",
    authMissing: "Admin password is not configured on the server. View-only mode is active.",
    saveSuccess: "Saved",
  },
} as const;

function toDateLabel(locale: Locale, isoText: string): string {
  const time = Date.parse(isoText);

  if (Number.isNaN(time)) {
    return "-";
  }

  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(new Date(time));
}

function parseNumberInput(value: string, fallback: number): number {
  const n = Number(value);

  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }

  return Math.floor(n);
}

interface AttendanceModuleProps {
  locale: Locale;
  initialData: AttendanceData;
  initialAuthEnabled: boolean;
}

export function AttendanceModule({ locale, initialData, initialAuthEnabled }: AttendanceModuleProps) {
  const copy = dictionary[locale];
  const [data, setData] = useState<AttendanceData>(initialData);
  const [canEdit, setCanEdit] = useState(false);
  const [authEnabled, setAuthEnabled] = useState(initialAuthEnabled);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const response = await fetch("/api/attendance", { cache: "no-store" });
    const payload = (await response.json()) as AttendanceApiResponse;
    setData(payload.data);
    setCanEdit(payload.canEdit);
    setAuthEnabled(payload.authEnabled);
  }

  const attendanceRate = useMemo(() => {
    if (data.requiredDays <= 0) {
      return 0;
    }

    return Math.round((data.presentDays / data.requiredDays) * 1000) / 10;
  }, [data]);

  const absentDays = useMemo(() => {
    return Math.max(0, data.requiredDays - data.presentDays - data.leaveDays);
  }, [data]);

  async function handleLogin() {
    setLoginError("");
    setSaveMessage("");

    const response = await fetch("/api/attendance/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setLoginError(copy.loginError);
      return;
    }

    setPassword("");
    await refresh();
  }

  async function handleLogout() {
    await fetch("/api/attendance/logout", { method: "POST" });
    setSaveMessage("");
    await refresh();
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload: AttendanceData = {
      internshipName: String(formData.get("internshipName") ?? "").trim(),
      period: String(formData.get("period") ?? "").trim(),
      requiredDays: parseNumberInput(String(formData.get("requiredDays") ?? "0"), data.requiredDays),
      presentDays: parseNumberInput(String(formData.get("presentDays") ?? "0"), data.presentDays),
      lateDays: parseNumberInput(String(formData.get("lateDays") ?? "0"), data.lateDays),
      leaveDays: parseNumberInput(String(formData.get("leaveDays") ?? "0"), data.leaveDays),
      remoteDays: parseNumberInput(String(formData.get("remoteDays") ?? "0"), data.remoteDays),
      notes: String(formData.get("notes") ?? "").trim(),
      updatedAt: data.updatedAt,
    };

    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    const response = await fetch("/api/attendance", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setSaving(false);
      setSaveError(copy.saveError);
      return;
    }

    const result = (await response.json()) as AttendanceApiResponse;
    setData(result.data);
    setSaving(false);
    setSaveMessage(copy.saveSuccess);
  }

  return (
    <section className="section-card space-y-5 px-6 py-6 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-[#112426]">{copy.sectionTitle}</h2>
          <p className="mt-1 text-sm text-[#425153]">{copy.sectionDesc}</p>
        </div>
        {canEdit ? (
          <button
            type="button"
            onClick={() => {
              handleLogout().catch(() => {
                setSaveError(copy.saveError);
              });
            }}
            className="rounded-full border border-[#0f3d3e]/25 px-4 py-2 text-xs font-semibold text-[#0f3d3e] transition hover:border-[#0f3d3e]"
          >
            {copy.logoutButton}
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.rate}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f3d3e]">{attendanceRate}%</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.requiredDays}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f3d3e]">{data.requiredDays}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.presentDays}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f3d3e]">{data.presentDays}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.absentDays}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f3d3e]">{absentDays}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.internshipName}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.internshipName || "-"}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.period}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.period || "-"}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.lateDays}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.lateDays}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.leaveDays}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.leaveDays}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.remoteDays}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.remoteDays}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
        <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.notes}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#112426]">{data.notes || "-"}</p>
      </div>

      <p className="text-xs text-[#586668]">
        {copy.lastUpdated}: {toDateLabel(locale, data.updatedAt)}
      </p>

      {!canEdit && authEnabled ? (
        <div className="rounded-2xl border border-dashed border-[#0f3d3e]/35 bg-white/65 p-4">
          <p className="text-sm font-semibold text-[#112426]">{copy.loginTitle}</p>
          <p className="mt-1 text-xs text-[#425153]">{copy.loginHint}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="attendance-admin-password">
              {copy.passwordLabel}
            </label>
            <input
              id="attendance-admin-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              className="min-w-[220px] flex-1 rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-[#112426] outline-none focus:border-[#0f3d3e]"
              placeholder={copy.passwordLabel}
            />
            <button
              type="button"
              onClick={() => {
                handleLogin().catch(() => {
                  setLoginError(copy.loginError);
                });
              }}
              className="rounded-xl bg-[#0f3d3e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2f31]"
            >
              {copy.loginButton}
            </button>
          </div>
          {loginError ? <p className="mt-2 text-xs text-[#9a2e2e]">{loginError}</p> : null}
        </div>
      ) : null}

      {!authEnabled ? (
        <p className="text-xs text-[#9a2e2e]">{copy.authMissing}</p>
      ) : null}

      {canEdit ? (
        <form onSubmit={handleSave} className="grid gap-3 rounded-2xl border border-[#0f3d3e]/25 bg-white/75 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.internshipName}
              <input
                name="internshipName"
                defaultValue={data.internshipName}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.period}
              <input
                name="period"
                defaultValue={data.period}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.requiredDays}
              <input
                type="number"
                min={0}
                name="requiredDays"
                defaultValue={data.requiredDays}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.presentDays}
              <input
                type="number"
                min={0}
                name="presentDays"
                defaultValue={data.presentDays}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.lateDays}
              <input
                type="number"
                min={0}
                name="lateDays"
                defaultValue={data.lateDays}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.leaveDays}
              <input
                type="number"
                min={0}
                name="leaveDays"
                defaultValue={data.leaveDays}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.remoteDays}
              <input
                type="number"
                min={0}
                name="remoteDays"
                defaultValue={data.remoteDays}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm text-[#112426]">
            {copy.notes}
            <textarea
              name="notes"
              defaultValue={data.notes}
              rows={4}
              className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#0f3d3e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2f31] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? copy.saving : copy.saveButton}
            </button>
            {saveMessage ? <span className="text-xs text-[#1f7a1f]">{saveMessage}</span> : null}
            {saveError ? <span className="text-xs text-[#9a2e2e]">{saveError}</span> : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}
