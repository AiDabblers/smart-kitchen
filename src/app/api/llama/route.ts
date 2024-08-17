import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json();
    console.log('Received command:', command);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: "You are a smart kitchen assistant." },
          { role: "user", content: command }
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from OpenRouter AI: ${response.statusText}`);
    }

    const completion = await response.json();
    const responseMessage = completion.choices[0].message.content;
    console.log('Received response:', responseMessage);

    return NextResponse.json({ response: responseMessage });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response("Error processing request", { status: 500 });
  }
}
