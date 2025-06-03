import { NextRequest, NextResponse } from "next/server";

import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("收到请求");
  const { prompt } = await req.json();
  console.log("用户输入:", prompt);

  const fullPrompt = `你是医疗助手，请将用户输入的化疗/护理计划，解析为未来半年内的所有相关日期，输出格式为：
       		{
          		"dates": ["2025-05-27", "2025-06-10", ...] // ISO 格式
        		}

			现在用户输入是：
				"${prompt}"
  			`;

  let result;
  try {
    result = await openai.chat.completions.create({
      model: process.env.MODEL!,
      messages: [{ role: "user", content: fullPrompt }],
    });
    console.log("AI 返回:", result.choices[0].message.content);
  } catch (e) {
    console.error("API 调用失败", e);
    return NextResponse.json(
      {
        error: "API 调用失败",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }

  try {
    let content = result.choices[0].message.content!;
    content = content.replace(/```json|```/g, "").trim();
    const json = JSON.parse(content);
    // 校验 json.dates 是否为数组且每项为 ISO 日期字符串
    if (
      !json.dates ||
      !Array.isArray(json.dates) ||
      json.dates.length === 0 ||
      !json.dates.every(
        (d: unknown) =>
          typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d as string)
      )
    ) {
      return NextResponse.json(
        { error: "AI 返回格式不正确或无有效日期", raw: content },
        { status: 400 }
      );
    }
    return NextResponse.json(json);
  } catch (e: unknown) {
    let message = "未知错误";
    if (e instanceof Error) message = e.message;
    return NextResponse.json(
      { error: "解析 AI 返回内容失败", message },
      { status: 400 }
    );
  }
}
