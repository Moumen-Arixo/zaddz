import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Camera, School, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const BEM_SUBJECTS = ["رياضيات", "فيزياء", "علوم طبيعية", "لغة عربية", "لغة فرنسية", "لغة إنجليزية", "تاريخ وجغرافيا", "تربية إسلامية", "تربية مدنية"];
const BAC_SUBJECTS = ["رياضيات", "فيزياء", "علوم طبيعية", "أدب عربي", "لغة فرنسية", "لغة إنجليزية", "تاريخ وجغرافيا", "فلسفة", "علوم إسلامية", "هندسة مدنية", "هندسة ميكانيكية", "هندسة كهربائية", "هندسة الطرائق", "تسيير واقتصاد"];

export function RegisterTeacher() {
  const [level, setLevel] = useState<"bem" | "bac" | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const subjects = level === "bem" ? BEM_SUBJECTS : level === "bac" ? BAC_SUBJECTS : [];

  return (
    <div className="flex-1 flex flex-col items-center py-12 px-6 relative z-10 w-full min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[560px] p-8 flex flex-col gap-6"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">👨‍🏫 انضم كأستاذ جديد</h1>
          <p className="text-gray-400 text-sm">انشر معرفتك وساعد جيل المستقبل الجزائري</p>
        </div>

        <div className="flex justify-center my-2">
          <div 
            className={cn(
              "relative w-[130px] h-[130px] rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group overflow-hidden bg-dark-800/50 hover:scale-105",
              imagePreview ? "border-green-500 border-solid" : "border-white/20 hover:border-accent-400"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-8 h-8 text-gray-400 group-hover:text-accent-400 mb-2 transition-colors" />
                <span className="text-xs text-gray-400 group-hover:text-accent-400 transition-colors font-medium">الصورة الشخصية</span>
              </>
            )}
            {imagePreview && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setLevel("bem")}
            className={cn(
              "cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3",
              level === "bem"
                ? "border-accent-400 bg-accent-500/10 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.3)] z-10"
                : "border-white/10 bg-dark-800/60 hover:-translate-y-1 hover:border-white/20 grayscale hover:grayscale-0"
            )}
          >
            <School className={cn("w-10 h-10", level === "bem" ? "text-accent-400" : "text-gray-400")} />
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

        <AnimatePresence>
          {level && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-sm font-medium text-gray-300 px-1">مادة التدريس</label>
                <select className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 focus:bg-dark-800/90 transition-all appearance-none cursor-pointer">
                  <option value="" disabled selected>اختر المادة...</option>
                  {subjects.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={(e) => {
          e.preventDefault();
          const newTeacher = {
            id: Date.now(),
            name: (e.target as any)[0].value,
            username: (e.target as any)[1].value,
            email: (e.target as any)[2].value,
            password: (e.target as any)[3].value,
            subject: (e.target as any).querySelector("select")?.value || "غير محدد",
            level: level,
            role: "teacher",
            status: "pending",
            imageProfile: imagePreview,
          };
          const teachers = JSON.parse(localStorage.getItem("registered_teachers") || "[]");
          teachers.push(newTeacher);
          localStorage.setItem("registered_teachers", JSON.stringify(teachers));
          alert("تم تقديم طلبك بنجاح. سيتم مراجعته من قبل الإدارة قريباً!");
          window.location.href = "/login";
        }} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">الاسم واللقب</label>
              <input 
                required
                type="text" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 focus:bg-dark-800/90 transition-all text-right" 
                placeholder="أ. سفيان عبدالرحمن"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">اسم المستخدم</label>
              <input 
                required
                type="text" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 focus:bg-dark-800/90 transition-all text-left" 
                dir="ltr"
                placeholder="prof_sofiane"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">البريد الإلكتروني</label>
              <input 
                required
                type="email" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 focus:bg-dark-800/90 transition-all text-left" 
                dir="ltr"
                placeholder="prof@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">كلمة المرور</label>
              <input 
                required
                type="password" 
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 focus:bg-dark-800/90 transition-all text-left" 
                dir="ltr"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-dark-800/40 border border-white/5 rounded-xl p-4 flex items-center justify-between mt-2">
            <span className="font-mono text-lg font-bold text-accent-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">5 + 2 = ?</span>
            <input 
              required
              type="text" 
              className="bg-dark-900 border border-white/10 rounded-lg w-20 px-3 py-2 text-center text-white focus:outline-none focus:border-accent-400 transition-colors" 
              placeholder="CAPTCHA"
            />
          </div>

          <button type="submit" className="btn-accent w-full mt-4 py-3.5 text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            🌟 تقديم طلب الانضمام كأستاذ
          </button>
        </form>

        <div className="mt-2 text-center text-sm font-medium">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
            شريك معنا بالفعل؟ <span className="text-accent-400 hover:text-accent-300">سجل الدخول</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
