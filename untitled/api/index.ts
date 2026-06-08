import app from "../server";

export default function (req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Serverless Error:", err);
    res.status(500).json({ error: "Serverless function crashed", details: err.message });
  }
}

