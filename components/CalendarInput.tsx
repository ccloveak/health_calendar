"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Locale, format, getDay, parse, parseISO, startOfWeek } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
// import enUS from "date-fns/locale/en-US";
import zhCN from "date-fns/locale/zh-CN";

const locales = {
  // "en-US": enUS,
  "zh-CN": zhCN,
};

const localizer = dateFnsLocalizer({
  format: (
    date: number | Date,
    formatStr: string,
    options:
      | {
          locale?: Locale;
          weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
          firstWeekContainsDate?: number;
          useAdditionalWeekYearTokens?: boolean;
          useAdditionalDayOfYearTokens?: boolean;
        }
      | undefined
  ) => format(date, formatStr, { ...options, locale: zhCN }),
  parse: (
    value: string,
    formatStr: string,
    backupDate: number | Date,
    options:
      | {
          locale?: Locale;
          weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
          firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
          useAdditionalWeekYearTokens?: boolean;
          useAdditionalDayOfYearTokens?: boolean;
        }
      | undefined
  ) => parse(value, formatStr, backupDate, { ...options, locale: zhCN }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// 示例事件：不同颜色可用 event.style 自定义
const events = [
  {
    title: "化疗",
    start: new Date("2025-05-27"),
    end: new Date("2025-05-29"),
    allDay: true,
    type: "chemotherapy",
  },
  {
    title: "PICC维护",
    start: new Date("2025-06-03"),
    end: new Date("2025-06-03"),
    allDay: true,
    type: "picc",
  },
  {
    title: "PICC维护",
    start: new Date("2025-05-27"),
    end: new Date("2025-05-27"),
    allDay: true,
    type: "picc",
  },
];

const messages = {
  allDay: "全天",
  previous: "上一月",
  next: "下一月",
  today: "今天",
  month: "月",
  week: "周",
  day: "日",
  agenda: "议程",
  date: "日期",
  time: "时间",
  event: "事件",
  noEventsInRange: "这个范围内没有事件。",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventStyleGetter = (event: any) => {
  let backgroundColor = "#3174ad";
  if (event.type === "picc") backgroundColor = "#F59E0B";
  if (event.type === "chemotherapy") backgroundColor = "#EF4444";
  return {
    style: {
      backgroundColor,
      borderRadius: "4px",
      color: "white",
      border: "none",
      padding: "2px",
    },
  };
};

export default function CalendarInput() {
  const [inputText, setInputText] = useState("");
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateDates = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-dates", {
      method: "POST",
      body: JSON.stringify({ prompt: inputText }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      let errorMsg = "生成日期失败";
      try {
        const error = await res.json();
        errorMsg = error.error || errorMsg;
      } catch {}
      setError(errorMsg);
      setDialogOpen(true);
      setLoading(false);
      return;
    }

    try {
      const data = await res.json();
      if (!data.dates || !Array.isArray(data.dates)) {
        setError("AI 返回数据格式不正确");
        setDialogOpen(true);
        setLoading(false);
        return;
      }
      const dates = data.dates.map((d: string) => parseISO(d));
      setMarkedDates(dates);
    } catch {
      setError("返回数据格式错误");
      setDialogOpen(true);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="如:5.27号化疗，每两周一次..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <Button onClick={generateDates} disabled={loading}>
        {loading ? "生成中..." : "生成日期"}
      </Button>
      {/* <Calendar mode="multiple" selected={markedDates} /> */}

      <BigCalendar
        localizer={localizer}
        messages={messages}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month"]}
        defaultView="month"
        eventPropGetter={eventStyleGetter}
        style={{ height: 800 }}
        allDayAccessor={() => true}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>错误</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-red-600 text-sm">{error}</div>
          <Button className="mt-4" onClick={() => setDialogOpen(false)}>
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
