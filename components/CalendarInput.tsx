"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { parseISO } from "date-fns";
import { useState } from "react";

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
      <Calendar mode="multiple" selected={markedDates} />
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
