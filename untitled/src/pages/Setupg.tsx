import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, GraduationCap, School } from "lucide-react";
import { motion } from "motion/react";

export function Setupg() {
  const navigate = useNavigate();

  const handleLogin = (role: string, username: string) => {
    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", username);
    
    // Add them to registered localstorage so the app recognizes them
    if (role === "student") {
      const students = JSON.parse(localStorage.getItem("registered_students") || "[]");
      if (!students.find((s: any) => s.username === username)) {
        students.push({ id: username, username, password: "123", name: "التلميذ التجريبي", status: "active" });
        localStorage.setItem("registered_students", JSON.stringify(students));
      }
      navigate("/dashboard/student");
    } else if (role === "teacher") {
      const teachers = JSON.parse(localStorage.getItem("registered_teachers") || "[]");
      if (!teachers.find((t: any) => t.username === username)) {
        teachers.push({ id: username, username, password: "123", name: "الأستاذ التجريبي", subject: "رياضيات", status: "active" });
        localStorage.setItem("registered_teachers", JSON.stringify(teachers));
      }
      navigate("/dashboard/teacher");
    } else if (role === "admin") {
      navigate("/dashboard/admin");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[420px] p-8 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-2xl flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">تسجيل دخول خاص</h1>
          <p className="text-gray-400 text-sm">الحسابات التجريبية الثلاثة</p>
        </div>

        <div className="flex flex-col gap-4 mt-4">
           <button type="button"
              onClick={() => handleLogin("student", "demo_student_1")}
              className="bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-xl py-4 transition-colors flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
           >
             <GraduationCap className="w-6 h-6 text-primary-400"/>
             <span className="font-bold text-primary-400">تلميذ (Student)</span>
           </button>
           
           <button type="button"
              onClick={() => handleLogin("teacher", "demo_teacher_1")}
              className="bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 rounded-xl py-4 transition-colors flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
           >
             <School className="w-6 h-6 text-accent-400"/>
             <span className="font-bold text-accent-400">أستاذ (Teacher)</span>
           </button>
           
           <button type="button"
              onClick={() => handleLogin("admin", "demo_admin_1")}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl py-4 transition-colors flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
           >
             <Lock className="w-6 h-6 text-red-400"/>
             <span className="font-bold text-red-400">مدير (Admin)</span>
           </button>
        </div>

      </motion.div>
    </div>
  );
}
