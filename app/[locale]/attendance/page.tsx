import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AttendanceModule } from "@/components/attendance-module";
import { isAttendanceAdminEnabled, readAttendanceData } from "@/lib/attendance";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

type AttendancePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AttendancePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: locale === "zh" ? "实习统计" : "Internship Stats",
    description:
      locale === "zh"
        ? "实习出勤日历、请假记录与月度自动统计。"
        : "Internship attendance calendar with leave records and monthly auto stats.",
    alternates: {
      canonical: `${siteConfig.siteUrl}/${locale}/attendance`,
    },
  };
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const attendanceData = await readAttendanceData();
  const attendanceAuthEnabled = isAttendanceAdminEnabled();

  return (
    <AttendanceModule
      locale={locale}
      initialData={attendanceData}
      initialAuthEnabled={attendanceAuthEnabled}
    />
  );
}
