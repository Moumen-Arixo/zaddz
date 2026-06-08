import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Load notifications
    const stored = JSON.parse(localStorage.getItem("notifications") || "[]");
    
    // Add dummy if empty
    if (stored.length === 0) {
      const dummies = [
        { id: 1, sender: "الإدارة", target: "all", message: "مرحباً بكم في منصة Zad DZ! نتمنى لكم عاماً دراسياً موفقاً.", date: "الآن", read: false },
        { id: 2, sender: "أ. الرياضيات", target: "students", message: "تم نشر المحاضرة الجديدة للوحدة الثانية.", date: "منذ ساعتين", read: true }
      ];
      setNotifications(dummies);
      localStorage.setItem("notifications", JSON.stringify(dummies));
    } else {
      setNotifications(stored);
    }
  }, []);

  const markAsRead = (id: number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const userRole = localStorage.getItem("userRole");
  const returnLink = userRole === "admin" ? "/dashboard/admin" : userRole === "teacher" ? "/dashboard/teacher" : "/dashboard/student";

  // Filter based on role (simple simulation)
  const filteredNav = notifications.filter(n => {
    if (userRole === "admin") return true; 
    if (userRole === "teacher") return n.target === "all" || n.target === "teachers" || n.sender === "الإدارة";
    return n.target === "all" || n.target === "students" || typeof n.sender === "string"; // show all to students in demo
  });

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10 min-h-screen">
      
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <Link to={returnLink} className="btn-glass p-2 border border-white/10 flex items-center justify-center rounded-full hover:bg-white/10">
          <ArrowRight className="w-5 h-5 text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-400" /> الإشعارات
        </h1>
        {filteredNav.some(n => !n.read) && (
          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse mr-auto">
            جديد
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {filteredNav.length > 0 ? filteredNav.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => markAsRead(notif.id)}
            className={cn(
              "glass-card p-5 cursor-pointer transition-all border-r-4", 
              notif.read ? "border-r-gray-600 opacity-60" : "border-r-primary-500 bg-primary-500/5 hover:bg-primary-500/10"
            )}
          >
             <div className="flex justify-between items-start mb-2">
               <h4 className="font-bold flex items-center gap-2 text-white">
                 <span className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center border border-white/10 text-xs">
                   {notif.sender === "الإدارة" ? "🛡️" : "👨‍🏫"}
                 </span>
                 {notif.sender}
               </h4>
               <span className="text-xs text-gray-500 font-mono" dir="ltr">{notif.date}</span>
             </div>
             <p className="text-sm text-gray-300 leading-relaxed pr-10">{notif.message}</p>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-12">لا توجد إشعارات حالياً.</div>
        )}
      </div>
    </div>
  );
}
