import CalendarInput from "../components/CalendarInput";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">GPT化疗/护理日期标记器</h1>
      <CalendarInput />
    </main>
  );
}
