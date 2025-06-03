"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { parseISO } from "date-fns";
import { useState } from "react";

export default function CalendarInput() {
  const [inputText, setInputText] = useState("");
  const [markedDates, setMarkedDates] = useState<Date[]>([]);

  const generateDates = async () => {
    const res = await fetch("/api/generate-dates", {
      method: "POST",
      body: JSON.stringify({ prompt: inputText }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    const dates = data.dates.map((d: string) => parseISO(d));
    setMarkedDates(dates);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="如:5.27号化疗，每两周一次..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <Button onClick={generateDates}>生成日期</Button>
      <Calendar mode="multiple" selected={markedDates} />
    </div>
  );
}
