export type AttendanceStatus = "present" | "leave" | "off" | "unset";

export interface AttendanceEntry {
  date: string;
  status: AttendanceStatus;
  note?: string;
  overtimeHours?: number;
}

export interface AttendanceData {
  internshipName: string;
  period: string;
  requiredDays: number;
  presentDays: number;
  lateDays: number;
  leaveDays: number;
  remoteDays: number;
  notes: string;
  entries: AttendanceEntry[];
  fixedOffDates: string[];
  updatedAt: string;
}
