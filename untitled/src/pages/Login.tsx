import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, GraduationCap, School } from "lucide-react";
import { motion } from "motion/react";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check registered students
    const students = JSON.parse(localStorage.getItem("registered_students") || "[]");
    const student = students.find((s: any) => (s.username === username || s.email === username) && s.password === password);
    if (student) {
      if (student.status === "suspended") {
        return alert("تم إيقاف حسابك من قبل الإدارة.");
      }
      localStorage.setItem("userRole", "student");
      localStorage.setItem("userId", student.id.toString());
      return navigate("/dashboard/student");
    }

    // Check registered teachers
    const teachers = JSON.parse(localStorage.getItem("registered_teachers") || "[]");
    const teacher = teachers.find((t: any) => (t.username === username || t.email === username) && t.password === password);
    if (teacher) {
      if (teacher.status === "pending") {
        return alert("حسابك لم يتم اعتماده بعد من قبل الإدارة.");
      } else if (teacher.status === "rejected") {
        return alert("تم رفض طلب انضمامك.");
      }
      localStorage.setItem("userRole", "teacher");
      localStorage.setItem("userId", teacher.id.toString());
      return navigate("/dashboard/teacher");
    }

    // Check admin
    if (username === "admin" && password === "admin123") {
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("userId", "admin_1");
      return navigate("/dashboard/admin");
    }

    alert("بيانات الدخول غير صحيحة. تحقق من اسم المستخدم وكلمة المرور.");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[480px] p-8 flex flex-col gap-6"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 p-[2px] mb-2 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
             <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
               <Lock className="w-7 h-7 text-white" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm">ادرس بذكاء وتفوق في امتحاناتك المصيرية</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">اسم المستخدم أو البريد الإلكتروني</label>
            <input 
              type="text" 
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="user@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="••••••••"
            />
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-center justify-between mt-2">
            <span className="font-mono text-lg font-bold text-primary-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">15 + 8 = ?</span>
            <input 
              type="text" 
              className="bg-dark-900 border border-white/10 rounded-lg w-20 px-3 py-2 text-center text-white focus:outline-none focus:border-primary-400 transition-colors" 
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
              <input type="checkbox" className="rounded border-white/20 bg-dark-800 text-primary-500 focus:ring-primary-500/50 w-4 h-4" />
              تذكرني (30 يوم)
            </label>
            <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">نسيت كلمة المرور؟</a>
          </div>

          <button type="submit" className="btn-primary w-full mt-4 py-3.5 text-lg">
            دخول 🚀
          </button>
        </form>

        <div className="mt-4 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm mb-3">ليس لديك حساب؟</p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <Link to="/register/student" className="text-primary-400 hover:text-primary-300 transition-colors">
              سجل كتلميذ 🎓
            </Link>
            <Link to="/register/teacher" className="text-accent-400 hover:text-accent-300 transition-colors">
              انضم كأستاذ 👨‍🏫
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
