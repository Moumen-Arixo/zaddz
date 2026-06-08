import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, School, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

export function RegisterStudent() {
  const [level, setLevel] = useState<"bem" | "bac" | null>(null);

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[520px] p-8 flex flex-col gap-6"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 p-[2px] mb-2 shadow-[0_0_20px_rgba(14,165,233,0.5)]">
             <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
               <GraduationCap className="w-7 h-7 text-white" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">🎓 إنشاء حساب تلميذ جديد</h1>
          <p className="text-gray-400 text-sm">انضم إلى آلاف التلاميذ المتفوقين في الجزائر</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div
            onClick={() => setLevel("bem")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3",
              level === "bem"
                ? "border-primary-400 bg-primary-500/10 scale-110 shadow-[0_0_30px_rgba(56,189,248,0.4)] z-10"
                : "border-white/10 bg-dark-800/60 hover:-translate-y-1 hover:border-white/20 grayscale hover:grayscale-0"
            )}
          >
            <School className={cn("w-10 h-10", level === "bem" ? "text-primary-400" : "text-gray-400")} />
            <span className="font-bold">طور متوسط<br/><span className="text-sm font-normal text-gray-400">(BEM)</span></span>
          </div>

          <div
            onClick={() => setLevel("bac")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3",
              level === "bac"
                ? "border-accent-400 bg-accent-500/10 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10"
                : "border-white/10 bg-dark-800/60 hover:-translate-y-1 hover:border-white/20 grayscale hover:grayscale-0"
            )}
          >
            <BookOpen className={cn("w-10 h-10", level === "bac" ? "text-accent-400" : "text-gray-400")} />
            <span className="font-bold">طور ثانوي<br/><span className="text-sm font-normal text-gray-400">(BAC)</span></span>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (!level) return alert("يرجى اختيار الطور التعليمي");
          const newStudent = {
            id: Date.now(),
            name: (e.target as any)[0].value,
            username: (e.target as any)[1].value,
            email: (e.target as any)[2].value,
            password: (e.target as any)[3].value,
            level: level,
            role: "student",
            status: "active",
          };
          const students = JSON.parse(localStorage.getItem("registered_students") || "[]");
          students.push(newStudent);
          localStorage.setItem("registered_students", JSON.stringify(students));
          alert("تم تسجيل حسابك بنجاح!");
          window.location.href = "/login";
        }} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">الاسم الكامل</label>
              <input 
                required
                type="text" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-right" 
                placeholder="محمد أمين"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">اسم المستخدم</label>
              <input 
                required
                type="text" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-left" 
                dir="ltr"
                placeholder="med_amine"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">البريد الإلكتروني</label>
            <input 
              required
              type="email" 
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="amine@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">كلمة المرور</label>
            <input 
              required
              type="password" 
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-4 py-3.5 text-lg">
            🎓 إنشاء حساب التلميذ
          </button>
        </form>

        <div className="mt-2 text-center text-sm font-medium">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
            لديك حساب بالفعل؟ <span className="text-primary-400 hover:text-primary-300">سجل الدخول</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
