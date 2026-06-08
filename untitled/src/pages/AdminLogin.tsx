import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { motion } from "motion/react";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((username === "admin" && password === "Admin123!") || (username === "demo_admin" && password === "demo123")) {
      localStorage.setItem("userRole", "admin");
      navigate("/dashboard/admin");
    } else {
      alert("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[480px] p-8 flex flex-col gap-6 border-red-500/20"
      >
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-red-400 p-[2px] mb-2 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
             <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
               <Shield className="w-7 h-7 text-white" />
             </div>
          </div>
          <h1 className="text-2xl font-bold text-red-500 tracking-tight">إدارة المنصة</h1>
          <p className="text-gray-400 text-sm">تسجيل دخول المديرين فقط</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">اسم المستخدم</label>
            <input 
              type="text" 
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300 px-1">كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:bg-dark-800/90 transition-all text-left" 
              dir="ltr"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full mt-4 py-3.5 text-lg rounded-xl bg-gradient-to-l from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] transition-all duration-300 transform hover:-translate-y-0.5">
            دخول للوحة التحكم 🛡️
          </button>
        </form>

        <div className="mt-4 border-t border-white/10 pt-4 flex flex-col gap-3">
          <p className="text-gray-400 text-sm text-center">حسابات تجريبية للإدارة:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
             <button 
                onClick={() => {setUsername("admin"); setPassword("Admin123!");}}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 transition-colors flex flex-col items-center"
             >
               <span className="font-bold text-red-400">المدير الرئيسي</span>
               <span className="text-xs text-gray-400 font-mono">admin / Admin123!</span>
             </button>
             <button 
                onClick={() => {setUsername("demo_admin"); setPassword("demo123");}}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 transition-colors flex flex-col items-center"
             >
               <span className="font-bold text-orange-400">مدير تجريبي</span>
               <span className="text-xs text-gray-400 font-mono">demo_admin / demo123</span>
             </button>
          </div>
        </div>

        <div className="mt-2 text-center text-sm font-medium">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
