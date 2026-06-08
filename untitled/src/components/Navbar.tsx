import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Bell, ChevronDown, CreditCard, X, Settings, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem("userRole");
  const isAuth = !!userRole;

  const [showDrawer, setShowDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const notifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    let count = 0;

    // Simplistic read check
    if (userRole === "admin") count = notifs.filter((n: any) => !n.read).length;
    else if (userRole === "teacher")
      count = notifs.filter(
        (n: any) => !n.read && (n.target === "all" || n.target === "teachers"),
      );
    else if (userRole === "student")
      count = notifs.filter(
        (n: any) =>
          !n.read &&
          (n.target === "all" ||
            n.target === "students" ||
            n.sender !== "الإدارة"),
      );

    setUnreadCount(count > 0 ? count : 0);
  }, [location, userRole]);

  // Close drawer when route changes
  useEffect(() => {
    setShowDrawer(false);
  }, [location]);

  return (
    <>
      <nav className="nav-glass h-16 flex items-center justify-between px-6 z-50 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDrawer(true)}
            className="text-white hover:text-primary-400 transition-colors p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            to="/"
            className="text-2xl font-black text-gradient tracking-tight"
          >
            Zad DZ
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isAuth ? (
            <>
              <Link to="/login" className="btn-glass px-4 py-2 text-sm">
                دخول
              </Link>
              <Link
                to="/register/student"
                className="btn-primary px-4 py-2 text-sm shadow-[0_0_10px_rgba(14,165,233,0.3)]"
              >
                تسجيل
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/notifications"
                className="relative p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] border-2 border-dark-900"></span>
                )}
              </Link>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1.5 pr-2 rounded-full transition-colors border border-transparent hover:border-white/10"
                onClick={() => {
                  if (confirm("هل تريد تسجيل الخروج؟")) {
                    localStorage.removeItem("userRole");
                    navigate("/");
                  }
                }}
                title="تسجيل الخروج"
              >
                <span className="text-sm font-medium text-gray-200 hidden sm:inline-block">
                  {userRole === "admin"
                    ? "مدير المنصة"
                    : userRole === "teacher"
                      ? "الأستاذ التجريبي"
                      : "التلميذ التجريبي"}
                </span>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md",
                    userRole === "admin"
                      ? "bg-red-500"
                      : userRole === "teacher"
                        ? "bg-accent-500"
                        : "bg-primary-500",
                  )}
                >
                  {userRole === "admin"
                    ? "م"
                    : userRole === "teacher"
                      ? "أ"
                      : "ت"}
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-dark-900 border-l border-white/10 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <span className="text-xl font-black text-gradient">Zad DZ</span>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                >
                  الرئيسية
                </Link>
                <Link
                  to="/browser"
                  className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                >
                  متصفح الدورات
                </Link>

                {userRole === "student" && (
                  <>
                    <Link
                      to="/dashboard/student"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                    >
                      لوحة القيادة
                    </Link>
                    <Link
                      to="/student/chat"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                    >
                      <Bot className="w-5 h-5" /> المساعد الدراسي الذكي (قيد التجريب)
                    </Link>
                    <Link
                      to="/recharge"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                    >
                      <CreditCard className="w-5 h-5" /> المحفظة وشحن الرصيد
                    </Link>
                    <Link
                      to="/funded-subjects"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors text-primary-400"
                    >
                      📦 المواد التي تم شحن الرصيد فيها
                    </Link>
                    <Link
                      to="/voting"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors text-accent-400"
                    >
                      🗳️ حملات التصويت للأساتذة
                    </Link>
                  </>
                )}

                {userRole === "teacher" && (
                  <>
                    <Link
                      to="/dashboard/teacher"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors border-t border-white/5 mt-2 pt-4"
                    >
                      لوحة قيادة الأستاذ
                    </Link>
                    <Link
                      to="/teacher/transfers"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors text-accent-400"
                    >
                      <CreditCard className="w-5 h-5" /> تحويلات التلاميذ
                      المعلقة
                    </Link>
                    <Link
                      to="/teacher/notify"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                    >
                      <Bell className="w-5 h-5" /> إرسال إشعار للمشتركين
                    </Link>
                    <Link
                      to="/teacher/ccp"
                      className="p-3 text-white hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors"
                    >
                      <Settings className="w-5 h-5" /> إعداد بيانات الدفع
                    </Link>
                    {localStorage.getItem("show_teacher_payment") !==
                      "false" && (
                      <Link
                        to="/teacher/payment"
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg flex items-center gap-3 font-bold transition-colors"
                      >
                        <CreditCard className="w-5 h-5" /> الدفع الشهري المستحق
                      </Link>
                    )}
                  </>
                )}

                {userRole === "admin" && (
                  <Link
                    to="/dashboard/admin"
                    className="p-3 text-red-400 hover:bg-white/5 rounded-lg flex items-center gap-3 font-medium transition-colors border-t border-white/5 mt-2 pt-4"
                  >
                    إدارة المنصة الشاملة
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
