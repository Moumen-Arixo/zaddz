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

app.get("/*", async (req, res) => {
  try {
    const [rows] = await pool.query(`
       SELECT 
          c.*, 
          u.full_name as teacher, 
          u.email as teacher_email 
       FROM courses c 
       JOIN users u ON c.teacher_id = u.id 
       ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Join query failed, trying simple query", err);
    try {
       const [rows] = await pool.query(`SELECT * FROM courses ORDER BY created_at DESC`);
       res.json(rows);
    } catch(errFallback) {
       console.error("Simple query failed", errFallback);
       res.json([]);
    }
  }
});

app.post("/*", async (req, res) => {
  try {
    const { title, description, level, price, discount, teacher_id, subject } = req.body;
    
    const teacherIdToUse = teacher_id || 2; // Default demo teacher ID 2 if not provided
    
    // Ensure courses table is set up or assume it already is 
    const [result]: any = await pool.query(
      "INSERT INTO courses (teacher_id, title, description, level, price, discount) VALUES (?, ?, ?, ?, ?, ?)",
      [teacherIdToUse, title, description || '', level, price, discount || 0]
    );
    
    res.json({ success: true, courseId: result.insertId });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course", details: err.message });
  }
});

export const handler = serverless(app);
