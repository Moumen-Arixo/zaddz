import express from "express";
import serverless from "serverless-http";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

const defaultSettings = {
  copyrightYear: new Date().getFullYear().toString(),
  primaryColor: "#0ea5e9",
  secondaryColor: "#eab308",
  borderRadius: "12px"
};

app.get("/*", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
          id INT PRIMARY KEY DEFAULT 1,
          primary_color VARCHAR(50) DEFAULT '#0ea5e9',
          secondary_color VARCHAR(50) DEFAULT '#eab308'
      );
    `).catch(() => {});
    
    const [rows]: any = await pool.query("SELECT * FROM platform_settings WHERE id = 1");
    if (rows && rows.length > 0) {
      res.json({
        copyrightYear: defaultSettings.copyrightYear,
        primaryColor: rows[0].primary_color,
        secondaryColor: rows[0].secondary_color,
        borderRadius: defaultSettings.borderRadius
      });
    } else {
      res.json(defaultSettings);
    }
  } catch (err) {
    res.json(defaultSettings);
  }
});

app.post("/*", async (req, res) => {
  try {
    const { primaryColor, secondaryColor, borderRadius, copyrightYear } = req.body;
    
    const newSettings = {
      copyrightYear: copyrightYear || defaultSettings.copyrightYear,
      primaryColor: primaryColor || defaultSettings.primaryColor,
      secondaryColor: secondaryColor || defaultSettings.secondaryColor,
      borderRadius: borderRadius || defaultSettings.borderRadius
    };
    
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS platform_settings (
            id INT PRIMARY KEY DEFAULT 1,
            primary_color VARCHAR(50) DEFAULT '#0ea5e9',
            secondary_color VARCHAR(50) DEFAULT '#eab308'
        );
      `);
      const [existing]: any = await pool.query("SELECT id FROM platform_settings WHERE id = 1");
      if (existing && existing.length > 0) {
        await pool.query("UPDATE platform_settings SET primary_color=?, secondary_color=? WHERE id=1", [primaryColor, secondaryColor]);
      } else {
        await pool.query("INSERT INTO platform_settings (id, primary_color, secondary_color) VALUES (1, ?, ?)", [primaryColor, secondaryColor]);
      }
    } catch (dbErr) {
      console.error("DB Save Settings Error", dbErr);
    }

    res.json({ success: true, settings: newSettings });
  } catch (err) {
     res.status(500).json({ error: "Failed to save settings" });
  }
});

app.put("/*", async (req, res) => {
    // Netlify might route PUT to the same, forward to POST
    req.method = "POST";
    app._router.handle(req, res, () => {});
});

export const handler = serverless(app);
