import express from "express";
import serverless from "serverless-http";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

app.get("/*", (req, res) => {
  const redirectUri = req.query.redirectUri || "https://zaddz.netlify.app/dashboard/teacher";
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri as string,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file",
    access_type: "offline",
    prompt: "consent",
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/auth?${params}` });
});

app.post("/*", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || "Failed to exchange code");
    }
    
    res.json({ success: true, token: data.access_token, refresh_token: data.refresh_token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export const handler = serverless(app);
