import express, { Request, Response } from "express";
import serverless from "serverless-http";

const app = express();
app.use(express.json());

// Setup Terabox Endpoint to bypass CORS
app.post("/*/terabox/setup", async (req: Request, res: Response) => {
  try {
    const { path, jsToken, ndus } = req.body;
    const response = await fetch(`https://www.terabox.com/api/create?jsToken=${jsToken}`, {
      method: "POST",
      headers: {
        'Cookie': `ndus=${ndus}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: new URLSearchParams({
        path: path as string,
        isdir: '1',
        block_list: '[]'
      })
    });
    const data = await response.json();
    res.json(data);
  } catch(err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat Route
app.post("/*/ai/chat", async (req: Request, res: Response) => {
  try {
    const { messages, systemPrompt, model = "Big Pickle" } = req.body;
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const baseUrl = process.env.AI_BASE_URL || "https://opencode.ai/zen/v1/chat/completions";
    // Using base64 to avoid token scanning tools blocking the deploy
    const apiKey = process.env.AI_API_KEY;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    const targetModel = (model === "Big Pickle" || model === "big-pickle") ? "big-pickle" : model;

    const response = await fetch(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: targetModel,
        messages: apiMessages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "AI API Error: " + response.statusText);
    }
    res.json({ reply: data.choices[0].message.content });
  } catch (err: any) {
    res.status(400).json({ error: err.message, reply: `حدث خطأ في الاتصال بالذكاء الاصطناعي: ${err.message}` });
  }
});

export const handler = serverless(app);
