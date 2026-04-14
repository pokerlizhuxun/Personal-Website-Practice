"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Locale } from "@/types/content";
import type { AttendanceData, AttendanceEntry, AttendanceStatus } from "@/types/attendance";

type AttendanceApiResponse = {
  data: AttendanceData;
  canEdit: boolean;
  authEnabled: boolean;
};

type MonthCursor = {
  year: number;
  month: number;
};

type CalendarCell = {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
};

const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const STATUS_VALUES: AttendanceStatus[] = ["present", "leave", "off", "unset"];
const LONG_PRESS_MS = 520;
const SWIPE_THRESHOLD_PX = 42;

const dictionary = {
  zh: {
    sectionTitle: "实习统计",
    sectionDesc: "真实日历视图，支持按日期记录出勤、请假和固定公休。",
    monthPresent: "本月出勤天数",
    monthLeave: "本月请假次数",
    monthOff: "本月公休日",
    monthCompletion: "本月已标记率",
    internshipName: "实习名称",
    period: "统计周期",
    notes: "整体备注",
    lastUpdated: "最后更新",
    legend: "图例",
    status: {
      present: "出勤",
      leave: "请假",
      off: "公休/固定不去",
      unset: "待填写",
    },
    weekday: ["一", "二", "三", "四", "五", "六", "日"],
    prevMonth: "上个月",
    nextMonth: "下个月",
    todayMonth: "回到本月",
    today: "今天",
    note: "备注",
    statusLabel: "状态",
    overtime: "加班时长(小时)",
    fixedOff: "固定不去日期",
    editorTitle: "编辑日期",
    editorDesc: "点击日历日期后可以调整状态并补充备注。",
    applyDay: "应用到本日",
    clearSelection: "清除选择",
    saveButton: "保存统计",
    saving: "保存中...",
    saveSuccess: "已保存",
    saveError: "保存失败，请稍后重试。",
    loginTitle: "管理员登录",
    loginHint: "仅管理员可编辑日历状态。",
    passwordLabel: "管理员密码",
    loginButton: "登录后编辑",
    logoutButton: "退出编辑",
    loginError: "密码错误或登录失败。",
    authMissing: "服务端未配置管理员密码，当前为只读模式。",
    tooltipDate: "日期",
    tooltipStatus: "状态",
    tooltipNoteEmpty: "无备注",
    tooltipOvertime: "加班",
    tooltipHours: "小时",
    tapHint: "移动端可点按日期查看详情",
    selectedDetailTitle: "日期详情",
    noDateSelected: "请选择一个日期",
  },
  en: {
    sectionTitle: "Internship Stats",
    sectionDesc: "A real calendar view for attendance, leave, and fixed off-days.",
    monthPresent: "Present Days (Month)",
    monthLeave: "Leave Count (Month)",
    monthOff: "Off Days (Month)",
    monthCompletion: "Marked Rate (Month)",
    internshipName: "Internship",
    period: "Period",
    notes: "General Notes",
    lastUpdated: "Last Updated",
    legend: "Legend",
    status: {
      present: "Present",
      leave: "Leave",
      off: "Off / Fixed Off",
      unset: "Unfilled",
    },
    weekday: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    prevMonth: "Previous",
    nextMonth: "Next",
    todayMonth: "This Month",
    today: "Today",
    note: "Note",
    statusLabel: "Status",
    overtime: "Overtime Hours",
    fixedOff: "Fixed Off Day",
    editorTitle: "Edit Date",
    editorDesc: "Select a date and adjust status with note details.",
    applyDay: "Apply to Date",
    clearSelection: "Clear Selection",
    saveButton: "Save Stats",
    saving: "Saving...",
    saveSuccess: "Saved",
    saveError: "Failed to save. Please try again.",
    loginTitle: "Admin Login",
    loginHint: "Only admin can edit calendar states.",
    passwordLabel: "Admin Password",
    loginButton: "Login to Edit",
    logoutButton: "Log Out",
    loginError: "Invalid password or login failed.",
    authMissing: "Admin password is not configured. View-only mode is active.",
    tooltipDate: "Date",
    tooltipStatus: "Status",
    tooltipNoteEmpty: "No note",
    tooltipOvertime: "Overtime",
    tooltipHours: "hours",
    tapHint: "Tap a date on mobile to view details",
    selectedDetailTitle: "Date Details",
    noDateSelected: "Please select a date",
  },
} as const;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } | null {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!matched) {
    return null;
  }

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function getShanghaiDayOfWeek(dateKey: string): number {
  const timestamp = Date.parse(`${dateKey}T00:00:00+08:00`);
  if (Number.isNaN(timestamp)) {
    return 1;
  }
  return new Date(timestamp).getUTCDay();
}

function isWeekendInShanghai(dateKey: string): boolean {
  const day = getShanghaiDayOfWeek(dateKey);
  return day === 0 || day === 6;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const total = cursor.year * 12 + (cursor.month - 1) + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = (total % 12) + 1;
  return { year: nextYear, month: nextMonth };
}

function getTodayInShanghai(): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "1970");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "01");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "01");

  return { year, month, day };
}

function formatMonthLabel(locale: Locale, cursor: MonthCursor): string {
  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "long",
  });

  return formatter.format(new Date(`${toDateKey(cursor.year, cursor.month, 1)}T12:00:00+08:00`));
}

function toDateLabel(locale: Locale, isoText: string): string {
  const time = Date.parse(isoText);
  if (Number.isNaN(time)) {
    return "-";
  }

  const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(new Date(time));
}

function buildCalendar(cursor: MonthCursor): CalendarCell[] {
  const firstDateKey = toDateKey(cursor.year, cursor.month, 1);
  const firstDayOfWeek = getShanghaiDayOfWeek(firstDateKey);
  const leadingCount = (firstDayOfWeek + 6) % 7;
  const daysInCurrentMonth = getDaysInMonth(cursor.year, cursor.month);
  const prevCursor = shiftMonth(cursor, -1);
  const daysInPrevMonth = getDaysInMonth(prevCursor.year, prevCursor.month);

  const cells: CalendarCell[] = [];

  for (let i = 0; i < leadingCount; i += 1) {
    const day = daysInPrevMonth - leadingCount + i + 1;
    cells.push({
      dateKey: toDateKey(prevCursor.year, prevCursor.month, day),
      day,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    cells.push({
      dateKey: toDateKey(cursor.year, cursor.month, day),
      day,
      inCurrentMonth: true,
    });
  }

  const trailingCount = (7 - (cells.length % 7)) % 7;
  const nextCursor = shiftMonth(cursor, 1);

  for (let day = 1; day <= trailingCount; day += 1) {
    cells.push({
      dateKey: toDateKey(nextCursor.year, nextCursor.month, day),
      day,
      inCurrentMonth: false,
    });
  }

  return cells;
}

function sortedEntries(entriesMap: Map<string, AttendanceEntry>): AttendanceEntry[] {
  return Array.from(entriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function sortedDateSet(values: Set<string>): string[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function parseOvertimeInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return Math.round(parsed * 10) / 10;
}

function getNextStatus(status: AttendanceStatus): AttendanceStatus {
  const index = STATUS_VALUES.indexOf(status);
  if (index < 0) {
    return "present";
  }

  return STATUS_VALUES[(index + 1) % STATUS_VALUES.length];
}

interface AttendanceModuleProps {
  locale: Locale;
  initialData: AttendanceData;
  initialAuthEnabled: boolean;
}

export function AttendanceModule({ locale, initialData, initialAuthEnabled }: AttendanceModuleProps) {
  const copy = dictionary[locale];
  const today = useMemo(() => getTodayInShanghai(), []);
  const [data, setData] = useState<AttendanceData>(initialData);
  const [authEnabled, setAuthEnabled] = useState(initialAuthEnabled);
  const [canEdit, setCanEdit] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<MonthCursor>({ year: today.year, month: today.month });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<AttendanceStatus>("unset");
  const [draftNote, setDraftNote] = useState("");
  const [draftOvertime, setDraftOvertime] = useState("");
  const [draftFixedOff, setDraftFixedOff] = useState(false);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);
  const suppressClickDateRef = useRef<string | null>(null);

  const entriesMap = useMemo(() => {
    const map = new Map<string, AttendanceEntry>();
    for (const entry of data.entries ?? []) {
      map.set(entry.date, entry);
    }
    return map;
  }, [data.entries]);

  const fixedOffSet = useMemo(() => {
    return new Set(data.fixedOffDates ?? []);
  }, [data.fixedOffDates]);

  const todayKey = useMemo(() => toDateKey(today.year, today.month, today.day), [today.day, today.month, today.year]);

  const calendarCells = useMemo(() => buildCalendar(visibleMonth), [visibleMonth]);

  const resolveStatus = useCallback((dateKey: string): AttendanceStatus => {
    const entry = entriesMap.get(dateKey);

    if (entry && entry.status !== "unset") {
      return entry.status;
    }

    if (fixedOffSet.has(dateKey) || isWeekendInShanghai(dateKey)) {
      return "off";
    }

    if (entry?.status === "unset") {
      return "unset";
    }

    return "unset";
  }, [entriesMap, fixedOffSet]);

  const monthlyStats = useMemo(() => {
    const days = getDaysInMonth(visibleMonth.year, visibleMonth.month);
    let present = 0;
    let leave = 0;
    let off = 0;
    let marked = 0;

    for (let day = 1; day <= days; day += 1) {
      const dateKey = toDateKey(visibleMonth.year, visibleMonth.month, day);
      const status = resolveStatus(dateKey);

      if (status === "present") {
        present += 1;
        marked += 1;
      } else if (status === "leave") {
        leave += 1;
        marked += 1;
      } else if (status === "off") {
        off += 1;
        marked += 1;
      }
    }

    return {
      present,
      leave,
      off,
      completion: days <= 0 ? 0 : Math.round((marked / days) * 1000) / 10,
    };
  }, [visibleMonth, resolveStatus]);

  const selectedDetails = useMemo(() => {
    if (!selectedDate) {
      return null;
    }

    const entry = entriesMap.get(selectedDate);
    const status = resolveStatus(selectedDate);

    return {
      date: selectedDate,
      status,
      note: entry?.note?.trim() || copy.tooltipNoteEmpty,
      overtimeHours: entry?.overtimeHours,
    };
  }, [copy.tooltipNoteEmpty, entriesMap, resolveStatus, selectedDate]);

  async function refresh() {
    const response = await fetch("/api/attendance", { cache: "no-store" });
    const payload = (await response.json()) as AttendanceApiResponse;
    setData(payload.data);
    setCanEdit(payload.canEdit);
    setAuthEnabled(payload.authEnabled);
  }

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

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaveMessage("");

    const response = await fetch("/api/attendance", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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

  function commitDateChange(
    dateKey: string,
    nextStatus: AttendanceStatus,
    nextNote: string,
    nextOvertimeHours: number | undefined,
    isFixedOff: boolean,
  ) {
    const nextEntriesMap = new Map(entriesMap);
    const nextFixedOffSet = new Set(fixedOffSet);
    const trimmedNote = nextNote.trim();

    if (nextStatus === "unset" && !trimmedNote && nextOvertimeHours === undefined) {
      nextEntriesMap.delete(dateKey);
    } else {
      nextEntriesMap.set(dateKey, {
        date: dateKey,
        status: nextStatus,
        note: trimmedNote || undefined,
        overtimeHours: nextOvertimeHours,
      });
    }

    if (isFixedOff) {
      nextFixedOffSet.add(dateKey);
    } else {
      nextFixedOffSet.delete(dateKey);
    }

    setData((previous) => ({
      ...previous,
      entries: sortedEntries(nextEntriesMap),
      fixedOffDates: sortedDateSet(nextFixedOffSet),
    }));
    setSaveMessage("");
    setSaveError("");
  }

  function openEditor(dateKey: string) {
    const parsed = parseDateKey(dateKey);
    if (!parsed) {
      return;
    }

    const entry = entriesMap.get(dateKey);
    setSelectedDate(dateKey);
    setDraftStatus(entry?.status ?? resolveStatus(dateKey));
    setDraftNote(entry?.note ?? "");
    setDraftOvertime(entry?.overtimeHours === undefined ? "" : String(entry.overtimeHours));
    setDraftFixedOff(fixedOffSet.has(dateKey));

    if (canEdit) {
      setMobileEditorOpen(true);
    }
  }

  function clearSelectedDraft() {
    setSelectedDate(null);
    setDraftStatus("unset");
    setDraftNote("");
    setDraftOvertime("");
    setDraftFixedOff(false);
    setMobileEditorOpen(false);
  }

  function applySelectedDate() {
    if (!selectedDate) {
      return;
    }

    const overtimeHours = parseOvertimeInput(draftOvertime);
    commitDateChange(selectedDate, draftStatus, draftNote, overtimeHours, draftFixedOff);
  }

  function handleQuickStatusCycle(dateKey: string) {
    if (!canEdit) {
      return;
    }

    const entry = entriesMap.get(dateKey);
    const currentStatus = entry?.status ?? resolveStatus(dateKey);
    const nextStatus = getNextStatus(currentStatus);
    const note = entry?.note ?? "";
    const overtimeHours = entry?.overtimeHours;
    const isFixedOff = fixedOffSet.has(dateKey);

    commitDateChange(dateKey, nextStatus, note, overtimeHours, isFixedOff);

    setSelectedDate(dateKey);
    setDraftStatus(nextStatus);
    setDraftNote(note);
    setDraftOvertime(overtimeHours === undefined ? "" : String(overtimeHours));
    setDraftFixedOff(isFixedOff);
  }

  function clearLongPressTimer() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function handleDayTouchStart(dateKey: string) {
    if (!canEdit) {
      return;
    }

    clearLongPressTimer();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      suppressClickDateRef.current = dateKey;
      handleQuickStatusCycle(dateKey);
    }, LONG_PRESS_MS);
  }

  function handleDayTouchEnd() {
    clearLongPressTimer();
  }

  function handleDayClick(dateKey: string) {
    if (suppressClickDateRef.current === dateKey) {
      suppressClickDateRef.current = null;
      return;
    }

    openEditor(dateKey);
  }

  function handleCalendarTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 1) {
      return;
    }

    swipeStartXRef.current = event.touches[0].clientX;
    swipeStartYRef.current = event.touches[0].clientY;
  }

  function handleCalendarTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (swipeStartXRef.current === null || swipeStartYRef.current === null) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - swipeStartXRef.current;
    const deltaY = touch.clientY - swipeStartYRef.current;
    swipeStartXRef.current = null;
    swipeStartYRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    setVisibleMonth((current) => shiftMonth(current, deltaX > 0 ? -1 : 1));
  }

  function statusSquareClass(status: AttendanceStatus): string {
    if (status === "present") {
      return "border-[#2f9e44] bg-[#2f9e44]";
    }

    if (status === "leave") {
      return "border-[#d94848] bg-[#d94848]";
    }

    if (status === "off") {
      return "border-[#8a8f98] bg-[#8a8f98]";
    }

    return "border-[#9ca3af] bg-transparent";
  }

  function dayCardClass(status: AttendanceStatus, isCurrentMonth: boolean, isSelected: boolean): string {
    const base =
      "relative h-16 rounded-xl border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f3d3e]/55 sm:h-20 sm:p-2.5";
    const faded = isCurrentMonth ? "" : " opacity-45";
    const selected = isSelected ? " ring-2 ring-[#0f3d3e]/55" : "";

    if (status === "present") {
      return `${base} border-[#2f9e44]/35 bg-[#2f9e44]/10${faded}${selected}`;
    }
    if (status === "leave") {
      return `${base} border-[#d94848]/35 bg-[#d94848]/10${faded}${selected}`;
    }
    if (status === "off") {
      return `${base} border-[#8a8f98]/35 bg-[#8a8f98]/12${faded}${selected}`;
    }

    return `${base} border-dashed border-black/15 bg-white/70${faded}${selected}`;
  }

  return (
    <section className="section-card space-y-5 px-4 py-5 sm:px-6 md:space-y-6 md:px-8 md:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-[#112426] sm:text-3xl">{copy.sectionTitle}</h1>
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.monthPresent}</p>
          <p className="mt-2 text-2xl font-semibold text-[#2f9e44]">{monthlyStats.present}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.monthLeave}</p>
          <p className="mt-2 text-2xl font-semibold text-[#d94848]">{monthlyStats.leave}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.monthOff}</p>
          <p className="mt-2 text-2xl font-semibold text-[#69707a]">{monthlyStats.off}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.monthCompletion}</p>
          <p className="mt-2 text-2xl font-semibold text-[#0f3d3e]">{monthlyStats.completion}%</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.internshipName}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.internshipName || "-"}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.period}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{data.period || "-"}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.lastUpdated}</p>
          <p className="mt-2 text-base font-semibold text-[#112426]">{toDateLabel(locale, data.updatedAt)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
        <p className="text-xs uppercase tracking-[0.12em] text-[#4d5759]">{copy.notes}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#112426]">{data.notes || "-"}</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white/80 p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <button
              type="button"
              onClick={() => {
                setVisibleMonth((current) => shiftMonth(current, -1));
              }}
              className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[#112426] transition hover:border-[#0f3d3e]/35"
            >
              {copy.prevMonth}
            </button>
            <button
              type="button"
              onClick={() => {
                setVisibleMonth((current) => shiftMonth(current, 1));
              }}
              className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[#112426] transition hover:border-[#0f3d3e]/35"
            >
              {copy.nextMonth}
            </button>
            <button
              type="button"
              onClick={() => {
                setVisibleMonth({ year: today.year, month: today.month });
              }}
              className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold text-[#112426] transition hover:border-[#0f3d3e]/35"
            >
              {copy.todayMonth}
            </button>
          </div>
          <p className="text-sm font-semibold text-[#112426]">{formatMonthLabel(locale, visibleMonth)}</p>
        </div>

        <p className="mt-2 text-xs text-[#586668]">
          {copy.tapHint}
          {" · "}
          {locale === "zh" ? "左右滑动切换月份，长按日期可快速切换状态" : "Swipe to switch month, long-press to quick-toggle status"}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#425153]">
          <span className="font-semibold text-[#112426]">{copy.legend}</span>
          {STATUS_VALUES.map((status) => (
            <span key={status} className="inline-flex items-center gap-2">
              <span className={`h-3.5 w-3.5 rounded-sm border ${statusSquareClass(status)}`} />
              {copy.status[status]}
            </span>
          ))}
        </div>

        <div
          className="mt-1"
          onTouchStart={handleCalendarTouchStart}
          onTouchEnd={handleCalendarTouchEnd}
          onTouchCancel={() => {
            swipeStartXRef.current = null;
            swipeStartYRef.current = null;
            clearLongPressTimer();
          }}
        >
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#4d5759] sm:gap-2 sm:text-xs">
            {copy.weekday.map((day) => (
              <div key={day} className="rounded-lg bg-black/[0.03] py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
            {calendarCells.map((cell) => {
              const entry = entriesMap.get(cell.dateKey);
              const status = resolveStatus(cell.dateKey);
              const isSelected = selectedDate === cell.dateKey;
              const overtimeText =
                entry?.overtimeHours === undefined
                  ? ""
                  : `${copy.tooltipOvertime}: ${entry.overtimeHours} ${copy.tooltipHours}`;
              const tooltipText = [
                `${copy.tooltipDate}: ${cell.dateKey}`,
                `${copy.tooltipStatus}: ${copy.status[status]}`,
                entry?.note?.trim() ? entry.note.trim() : copy.tooltipNoteEmpty,
                overtimeText,
              ]
                .filter(Boolean)
                .join("\n");

              return (
                <div key={cell.dateKey} className="group relative">
                  <button
                    type="button"
                    onTouchStart={() => {
                      handleDayTouchStart(cell.dateKey);
                    }}
                    onTouchMove={handleDayTouchEnd}
                    onTouchEnd={handleDayTouchEnd}
                    onTouchCancel={handleDayTouchEnd}
                    onClick={() => {
                      handleDayClick(cell.dateKey);
                    }}
                    aria-label={`${cell.dateKey} ${copy.status[status]}`}
                    title={tooltipText}
                    className={`${dayCardClass(status, cell.inCurrentMonth, isSelected)} cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-semibold text-[#112426]">{cell.day}</span>
                      <span className={`h-3.5 w-3.5 rounded-sm border ${statusSquareClass(status)}`} />
                    </div>
                    <p className="mt-1 truncate text-[10px] text-[#4d5759] sm:mt-2 sm:text-[11px]">
                      {cell.dateKey === todayKey ? copy.today : copy.status[status]}
                    </p>
                  </button>

                  <div className="pointer-events-none absolute left-1/2 top-0 z-20 hidden w-56 -translate-x-1/2 -translate-y-[102%] rounded-lg border border-black/10 bg-[#0f3d3e] px-3 py-2 text-xs leading-5 text-white shadow-lg md:group-hover:block md:group-focus-within:block">
                    <p>{`${copy.tooltipDate}: ${cell.dateKey}`}</p>
                    <p>{`${copy.tooltipStatus}: ${copy.status[status]}`}</p>
                    <p>{entry?.note?.trim() ? entry.note.trim() : copy.tooltipNoteEmpty}</p>
                    {entry?.overtimeHours !== undefined ? (
                      <p>{`${copy.tooltipOvertime}: ${entry.overtimeHours} ${copy.tooltipHours}`}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-black/10 bg-white/85 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4d5759]">
            {copy.selectedDetailTitle}
          </p>
          {selectedDetails ? (
            <div className="mt-2 space-y-1 text-sm text-[#112426]">
              <p>{`${copy.tooltipDate}: ${selectedDetails.date}`}</p>
              <p>{`${copy.tooltipStatus}: ${copy.status[selectedDetails.status]}`}</p>
              <p>{selectedDetails.note}</p>
              {selectedDetails.overtimeHours !== undefined ? (
                <p>{`${copy.tooltipOvertime}: ${selectedDetails.overtimeHours} ${copy.tooltipHours}`}</p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#586668]">{copy.noDateSelected}</p>
          )}
        </div>
      </div>

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
              className="min-w-0 flex-1 rounded-xl border border-black/20 bg-white px-3 py-2 text-sm text-[#112426] outline-none focus:border-[#0f3d3e]"
              placeholder={copy.passwordLabel}
            />
            <button
              type="button"
              onClick={() => {
                handleLogin().catch(() => {
                  setLoginError(copy.loginError);
                });
              }}
              className="w-full rounded-xl bg-[#0f3d3e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2f31] sm:w-auto"
            >
              {copy.loginButton}
            </button>
          </div>
          {loginError ? <p className="mt-2 text-xs text-[#9a2e2e]">{loginError}</p> : null}
        </div>
      ) : null}

      {!authEnabled ? <p className="text-xs text-[#9a2e2e]">{copy.authMissing}</p> : null}

      {canEdit ? (
        <div className="hidden gap-3 rounded-2xl border border-[#0f3d3e]/25 bg-white/75 p-4 md:grid">
          <div>
            <p className="text-sm font-semibold text-[#112426]">{copy.editorTitle}</p>
            <p className="mt-1 text-xs text-[#425153]">{copy.editorDesc}</p>
            <p className="mt-2 text-sm text-[#112426]">{selectedDate ?? "-"}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.statusLabel}
              <select
                value={draftStatus}
                onChange={(event) => {
                  setDraftStatus(event.target.value as AttendanceStatus);
                }}
                disabled={!selectedDate}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e] disabled:cursor-not-allowed disabled:bg-black/[0.03]"
              >
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {copy.status[status]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm text-[#112426]">
              {copy.overtime}
              <input
                type="number"
                min={0}
                step="0.5"
                value={draftOvertime}
                onChange={(event) => {
                  setDraftOvertime(event.target.value);
                }}
                disabled={!selectedDate}
                className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e] disabled:cursor-not-allowed disabled:bg-black/[0.03]"
              />
            </label>
          </div>

          <label className="grid gap-1 text-sm text-[#112426]">
            {copy.note}
            <textarea
              rows={3}
              value={draftNote}
              onChange={(event) => {
                setDraftNote(event.target.value);
              }}
              disabled={!selectedDate}
              className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e] disabled:cursor-not-allowed disabled:bg-black/[0.03]"
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-[#112426]">
            <input
              type="checkbox"
              checked={draftFixedOff}
              onChange={(event) => {
                setDraftFixedOff(event.target.checked);
              }}
              disabled={!selectedDate}
              className="h-4 w-4 rounded border-black/20 accent-[#0f3d3e] disabled:cursor-not-allowed"
            />
            {copy.fixedOff}
          </label>

          <div className="sticky bottom-2 z-10 -mx-1 grid gap-2 rounded-xl border border-black/10 bg-white/95 p-2 sm:static sm:-mx-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3 sm:border-none sm:bg-transparent sm:p-0">
            <button
              type="button"
              onClick={applySelectedDate}
              disabled={!selectedDate}
              className="w-full rounded-xl bg-[#0f3d3e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2f31] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {copy.applyDay}
            </button>
            <button
              type="button"
              onClick={clearSelectedDraft}
              className="w-full rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#112426] transition hover:border-[#0f3d3e]/40 sm:w-auto"
            >
              {copy.clearSelection}
            </button>
            <button
              type="button"
              onClick={() => {
                handleSave().catch(() => {
                  setSaveError(copy.saveError);
                });
              }}
              disabled={saving}
              className="w-full rounded-xl border border-[#0f3d3e]/20 bg-[#0f3d3e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0b2f31] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {saving ? copy.saving : copy.saveButton}
            </button>
            {saveMessage ? <span className="text-xs text-[#1f7a1f]">{saveMessage}</span> : null}
            {saveError ? <span className="text-xs text-[#9a2e2e]">{saveError}</span> : null}
          </div>
        </div>
      ) : null}

      {canEdit && mobileEditorOpen && selectedDate ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label={locale === "zh" ? "关闭编辑" : "Close editor"}
            className="absolute inset-0 bg-black/35"
            onClick={() => {
              setMobileEditorOpen(false);
            }}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border border-black/10 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#112426]">{copy.editorTitle}</p>
                <p className="mt-1 text-xs text-[#425153]">{selectedDate}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileEditorOpen(false);
                }}
                className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold text-[#112426]"
              >
                {locale === "zh" ? "关闭编辑" : "Close"}
              </button>
            </div>

            <div className="grid gap-3">
              <label className="grid gap-1 text-sm text-[#112426]">
                {copy.statusLabel}
                <select
                  value={draftStatus}
                  onChange={(event) => {
                    setDraftStatus(event.target.value as AttendanceStatus);
                  }}
                  className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
                >
                  {STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {copy.status[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm text-[#112426]">
                {copy.overtime}
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={draftOvertime}
                  onChange={(event) => {
                    setDraftOvertime(event.target.value);
                  }}
                  className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
                />
              </label>

              <label className="grid gap-1 text-sm text-[#112426]">
                {copy.note}
                <textarea
                  rows={4}
                  value={draftNote}
                  onChange={(event) => {
                    setDraftNote(event.target.value);
                  }}
                  className="rounded-xl border border-black/20 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f3d3e]"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-[#112426]">
                <input
                  type="checkbox"
                  checked={draftFixedOff}
                  onChange={(event) => {
                    setDraftFixedOff(event.target.checked);
                  }}
                  className="h-4 w-4 rounded border-black/20 accent-[#0f3d3e]"
                />
                {copy.fixedOff}
              </label>

              <div className="mt-1 grid gap-2">
                <button
                  type="button"
                  onClick={applySelectedDate}
                  className="w-full rounded-xl bg-[#0f3d3e] px-4 py-2.5 text-sm font-semibold text-white"
                >
                  {copy.applyDay}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSave().catch(() => {
                      setSaveError(copy.saveError);
                    });
                  }}
                  disabled={saving}
                  className="w-full rounded-xl border border-[#0f3d3e]/20 bg-[#0f3d3e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {saving ? copy.saving : copy.saveButton}
                </button>
                <button
                  type="button"
                  onClick={clearSelectedDraft}
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#112426]"
                >
                  {copy.clearSelection}
                </button>
                {saveMessage ? <span className="text-xs text-[#1f7a1f]">{saveMessage}</span> : null}
                {saveError ? <span className="text-xs text-[#9a2e2e]">{saveError}</span> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
