import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const apiKey = process.env.DIFY_API_KEY;
    const body = await request.json();

    console.log("リクエストボディ:", body);

    const response = await fetch("https://dify.codeland.jp/v1/workflows/run", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: body.inputs,
        response_mode: body.response_mode,
        user:  body.user,
        conversation_id: body.conversation_id
      }),
    });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Dify APIエラー:", errorData);
        return NextResponse.json(
          { message: "Failed to fetch data", error: errorData },
          { status: response.status }
        );
      }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("サーバーエラー:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
