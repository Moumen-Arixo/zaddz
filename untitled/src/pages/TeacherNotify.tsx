import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight, Send } from "lucide-react";

export function TeacherNotify() {
  const [msg, setMsg] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg) return;
    
    const notifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifs.unshift({
      id: Date.now(),
      sender: "أستاذ المادة",
      target: "students",
      message: msg,
      date: new Date().toLocaleDateString("ar-DZ") + " " + new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute:'2-digit' }),
      read: false
    });
    localStorage.setItem("notifications", JSON.stringify(notifs));
    
    setMsg("");
    alert("تم إرسال الإشعار بنجاح لتلاميذ المادة!");
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10 min-h-screen">
      
      <div className="flex items-center gap-4 mb-2">
        <Link to="/dashboard/teacher" className="btn-glass p-2 border border-white/10 flex items-center justify-center rounded-full hover:bg-white/10">
          <ArrowRight className="w-5 h-5 text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-primary-400">
          <Bell className="w-6 h-6" /> إرسال إشعار للمشتركين
        </h1>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-primary-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full -z-10"></div>
        <p className="text-sm text-gray-300 mb-6">
          سيتم إرسال هذا الإشعار إلى جميع التلاميذ المشتركين في دوراتك. سيظهر لديهم في صفحة الإشعارات الخاصة بهم.
        </p>

        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">رسالة الإشعار:</label>
            <textarea 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={5} 
              className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 transition-colors resize-none" 
              placeholder="اكتب إشعاراً لتلاميذ دوراتك (مثال: تم إضافة ملف جديد أو درس مباشر...)" 
              required
            ></textarea>
          </div>
          <button type="submit" className="bg-gradient-to-l from-primary-600 to-primary-400 hover:from-primary-500 hover:to-primary-300 shadow-[0_0_15px_rgba(14,165,233,0.3)] text-white py-3 rounded-xl font-bold transition-all w-full sm:w-auto self-end px-8 flex items-center justify-center gap-2 text-lg">
            إرسال الآن <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
