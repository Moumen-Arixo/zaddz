import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Bell,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Send,
  Bot,
  Settings
} from "lucide-react";
import { cn } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";

// Mock Data
const MOCK_TEACHERS: any[] = [];
const MOCK_STUDENTS: any[] = [];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifyTarget, setNotifyTarget] = useState("all");
  const [notifyMessage, setNotifyMessage] = useState("");
  
  const [yearInput, setYearInput] = useState(settings.copyrightYear);
  const [primaryColorInput, setPrimaryColorInput] = useState(settings.primaryColor);
  const [secondaryColorInput, setSecondaryColorInput] = useState(settings.secondaryColor);
  const [borderRadiusInput, setBorderRadiusInput] = useState(settings.borderRadius || "12px");

  useEffect(() => {
    setYearInput(settings.copyrightYear);
    setPrimaryColorInput(settings.primaryColor);
    setSecondaryColorInput(settings.secondaryColor);
    setBorderRadiusInput(settings.borderRadius || "12px");
  }, [settings]);

  const handleSaveSettings = async () => {
    await updateSettings({
      copyrightYear: yearInput,
      primaryColor: primaryColorInput,
      secondaryColor: secondaryColorInput,
      borderRadius: borderRadiusInput
    });
    alert("تم حفظ الإعدادات وتحديثها لدى جميع المستخدمين!");
  };

  const handleResetSettings = async () => {
    if(confirm("هل أنت متأكد من إرجاع الإعدادات والألوان الافتراضية؟")) {
       await resetSettings();
       alert("تم استعادة الألوان الافتراضية بنجاح.");
    }
  };

  const [adminCcp, setAdminCcp] = useState(
    () => localStorage.getItem("admin_ccp_account") || "",
  );
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem("admin_ccp_key") || "",
  );
  const [adminName, setAdminName] = useState(
    () => localStorage.getItem("admin_ccp_name") || "",
  );
  const [showPaymentToTeachers, setShowPaymentToTeachers] = useState(
    () => localStorage.getItem("show_teacher_payment") !== "false",
  );

  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);

  const [aiReport, setAiReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateAdminReport = async () => {
    setIsGeneratingReport(true);
    setAiReport("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `تخيل أنك محلل بيانات ومستشار للإدارة. حلل المنصة التي تحتوي على ${students.length} تلميذ، ${teachers.filter(t => t.status === "approved").length} أستاذ، و ${coursesCount} دورة. قدم تقريراً شاملاً ومفصلاً ومنسقاً بنقاط يتضمن المشاكل المحتملة، الرؤى الاستراتيجية، وخطوات عملية للنمو.` }],
          model: "Big Pickle",
          systemPrompt: "أنت مساعد ذكي للمدير العام لمنصة تعليمية جزائرية، تقدم تحليلات استراتيجية مفصلة."
        })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      setAiReport(data.reply);
    } catch(err: any) {
      setAiReport("حدث خطأ أثناء توليد التقرير: " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    const savedTeachers = JSON.parse(
      localStorage.getItem("registered_teachers") || "[]",
    );
    setTeachers([...MOCK_TEACHERS, ...savedTeachers]);

    const savedStudents = JSON.parse(
      localStorage.getItem("registered_students") || "[]",
    );
    setStudents([...MOCK_STUDENTS, ...savedStudents]);

    const savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );
    setCoursesCount(savedCourses.length + 320); // 320 is the mock base
  }, []);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyMessage) return alert("يرجى كتابة رسالة الإشعار");

    // Simulate sending
    const notifs = JSON.parse(localStorage.getItem("notifications") || "[]");
    notifs.unshift({
      id: Date.now(),
      sender: "الإدارة",
      target: notifyTarget,
      message: notifyMessage,
      date:
        new Date().toLocaleDateString("ar-DZ") +
        " " +
        new Date().toLocaleTimeString("ar-DZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      read: false,
    });
    localStorage.setItem("notifications", JSON.stringify(notifs));

    setNotifyMessage("");
    alert("تم إرسال الإشعار بنجاح!");
  };

  const handleTeacherAction = (id: number, status: string) => {
    if (
      !confirm(
        `هل أنت متأكد من ${status === "approved" ? "قبول" : "رفض"} هذا الأستاذ؟`,
      )
    )
      return;

    const updatedTeachers = teachers.map((t) =>
      t.id === id ? { ...t, status } : t,
    );
    setTeachers(updatedTeachers);

    // Attempt persist
    const lsTeachers = JSON.parse(
      localStorage.getItem("registered_teachers") || "[]",
    );
    const newLsTeachers = lsTeachers.map((t: any) =>
      t.id === id ? { ...t, status } : t,
    );
    localStorage.setItem("registered_teachers", JSON.stringify(newLsTeachers));
  };

  const handleStudentAction = (id: number, status: string) => {
    if (
      !confirm(
        `هل أنت متأكد من ${status === "suspended" ? "إيقاف" : "تفعيل"} حساب هذا التلميذ؟`,
      )
    )
      return;

    const updatedStudents = students.map((s) =>
      s.id === id ? { ...s, status } : s,
    );
    setStudents(updatedStudents);

    // Attempt persist
    const lsStudents = JSON.parse(
      localStorage.getItem("registered_students") || "[]",
    );
    const newLsStudents = lsStudents.map((s: any) =>
      s.id === id ? { ...s, status } : s,
    );
    localStorage.setItem("registered_students", JSON.stringify(newLsStudents));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
      {/* Welcome Bar */}
      <div className="glass-card p-5 border-r-4 border-r-red-500 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Shield className="w-6 h-6 text-red-500" /> لوحة الإدارة الشاملة
          </h2>
          <p className="text-gray-400 text-sm mt-1">المدير العام</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("userRole");
            window.location.href = "/";
          }}
          className="btn-glass text-sm text-red-400 border-red-500/30 hover:bg-red-500/10"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "overview"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            📊 نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "notifications"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            🔔 الإشعارات الجماعية
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "teachers"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            👨‍🏫 إدارة الأساتذة
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "students"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            🎓 إدارة التلاميذ
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "payment"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            💰 إعدادات الدفع (للأساتذة)
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "reports"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            🤖 توليد تقرير ذكي عن الأداء
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "text-right px-4 py-3 rounded-xl font-bold transition-colors",
              activeTab === "settings"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent",
            )}
          >
            ⚙️ الإعدادات العامة
          </button>
          <button
            onClick={() => navigate("/browser")}
            className="text-right px-4 py-3 rounded-xl font-bold transition-colors bg-dark-800/40 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
          >
            📚 إدارة الدورات
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-6 flex flex-col items-center text-center">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <span className="text-3xl font-black text-white mb-1">
                    {students.length}
                  </span>
                  <span className="text-sm text-gray-400">تلميذ مسجل</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center text-center">
                  <Shield className="w-8 h-8 text-accent-400 mb-2" />
                  <span className="text-3xl font-black text-white mb-1">
                    {teachers.filter((t) => t.status === "approved").length}
                  </span>
                  <span className="text-sm text-gray-400">أستاذ معتمد</span>
                </div>
                <div className="glass-card p-6 flex flex-col items-center text-center">
                  <BookOpen className="w-8 h-8 text-green-400 mb-2" />
                  <span className="text-3xl font-black text-white mb-1">
                    {coursesCount}
                  </span>
                  <span className="text-sm text-gray-400">دورة منشورة</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <Bell className="w-5 h-5 text-red-500" /> إرسال إشعار
              </h3>
              <form
                onSubmit={handleSendNotification}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    المرسل إليه:
                  </label>
                  <select
                    value={notifyTarget}
                    onChange={(e) => setNotifyTarget(e.target.value)}
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors appearance-none"
                  >
                    <option value="all">للجميع (أساتذة وتلاميذ)</option>
                    <option value="teachers">للأساتذة فقط</option>
                    <option value="students">للتلاميذ فقط</option>
                    <option value="single">إلى مستخدم محدد (حسب الأيدي)</option>
                  </select>
                </div>

                {notifyTarget === "single" && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                      معرف المستخدم (ID):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: usr_123"
                      className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-400 text-left"
                      dir="ltr"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    محتوى الإشعار:
                  </label>
                  <textarea
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors resize-none"
                    placeholder="اكتب الإشعار هنا..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 text-lg rounded-xl bg-gradient-to-l from-red-600 to-red-400 hover:from-red-500 hover:to-red-300 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all flex justify-center items-center gap-2"
                >
                  <Send className="w-5 h-5" /> إرسال الإشعار
                </button>
              </form>
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">
                إدارة الأساتذة (طلبات الانضمام)
              </h3>
              <div className="flex flex-col gap-3">
                {teachers.map((t) => {
                  const stats = JSON.parse(
                    localStorage.getItem("global_teacher_votes") || "{}",
                  )[t.id] || { up: 0, down: 0 };
                  return (
                    <div
                      key={t.id}
                      className="bg-dark-800/50 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-white mb-1">{t.name}</h4>
                        <div className="text-sm text-gray-400">
                          المادة: {t.subject}
                        </div>
                        {t.status === "pending" && (
                          <div className="flex gap-4 mt-2 text-xs font-mono">
                            <span className="text-green-400">
                              ✅ أصوات الموافقة: {stats.up}
                            </span>
                            <span className="text-red-400">
                              ❌ أصوات الرفض: {stats.down}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        {t.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleTeacherAction(t.id, "approved")
                              }
                              className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> قبول
                            </button>
                            <button
                              onClick={() =>
                                handleTeacherAction(t.id, "rejected")
                              }
                              className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" /> رفض
                            </button>
                          </div>
                        ) : (
                          <span className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded border border-green-500/20 text-xs font-bold">
                            {t.status === "approved" ? "معتمد" : "مرفوض"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4 border-b border-white/10 pb-4">
                قائمة التلاميذ
              </h3>
              <div className="flex flex-col gap-3">
                {students.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      "bg-dark-800/50 border rounded-xl p-4 flex items-center justify-between",
                      s.status === "suspended"
                        ? "border-red-500/30 opacity-70"
                        : "border-white/5",
                    )}
                  >
                    <div>
                      <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                        {s.name}
                        {s.status === "suspended" && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                            موقوف
                          </span>
                        )}
                      </h4>
                      <div className="text-sm text-gray-400">
                        المستوى: {s.level}
                      </div>
                    </div>
                    {s.status === "suspended" ? (
                      <button
                        onClick={() => handleStudentAction(s.id, "active")}
                        className="text-green-400 hover:text-green-300 text-sm underline font-bold"
                      >
                        تفعيل الحساب
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStudentAction(s.id, "suspended")}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                      >
                        إيقاف الحساب
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="glass-card p-6 gap-6 flex flex-col">
              <h3 className="text-lg font-bold border-b border-white/10 pb-4">
                إعدادات الدفع لاستلام النسب (من حسابات الأساتذة)
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    الحساب البريدي للإدارة (CCP / RIP)
                  </label>
                  <input
                    type="text"
                    value={adminCcp}
                    onChange={(e) => {
                      setAdminCcp(e.target.value);
                      localStorage.setItem("admin_ccp_account", e.target.value);
                    }}
                    placeholder="مثال: 0011223344"
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    المفتاح (Clé)
                  </label>
                  <input
                    type="text"
                    value={adminKey}
                    onChange={(e) => {
                      setAdminKey(e.target.value);
                      localStorage.setItem("admin_ccp_key", e.target.value);
                    }}
                    placeholder="مثال: 99"
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    الاسم واللقب لمالك الحساب
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      localStorage.setItem("admin_ccp_name", e.target.value);
                    }}
                    placeholder="الاسم الكامل"
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 mt-4 bg-dark-800/40 p-4 border border-white/5 rounded-xl">
                  <input
                    type="checkbox"
                    id="toggle_payment"
                    checked={showPaymentToTeachers}
                    onChange={(e) => {
                      setShowPaymentToTeachers(e.target.checked);
                      localStorage.setItem(
                        "show_teacher_payment",
                        String(e.target.checked),
                      );
                    }}
                    className="w-5 h-5 accent-red-500 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="toggle_payment"
                    className="text-gray-200 cursor-pointer select-none"
                  >
                    إظهار زر "الدفع الشهري" وتفاصيل الدفع للأساتذة في لوحتهم
                    الجانبية
                  </label>
                </div>
              </div>
            </div>
          )}
          {activeTab === "reports" && (
            <div className="glass-card p-6 gap-6 flex flex-col">
              <h3 className="text-lg font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent-400" /> الذكاء الاصطناعي - محلل الأداء
              </h3>
              <p className="text-gray-300">دع الذكاء الاصطناعي يحلل بيانات المنصة ويقترح لك رؤى استراتيجية وخطوات عملية لزيادة التفاعل وتحسين جودة التعليم.</p>
              
              <button 
                  onClick={generateAdminReport}
                  disabled={isGeneratingReport}
                  className="bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30 px-6 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Bot className="w-6 h-6" /> 
                  {isGeneratingReport ? "جاري تحليل البيانات..." : "توليد التقرير الذكي الآن"}
              </button>

              {aiReport && (
                <div className="mt-4 bg-dark-900/50 border border-white/10 rounded-xl p-6 text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                   {aiReport}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="glass-card p-6 gap-6 flex flex-col">
              <h3 className="text-lg font-bold border-b border-white/10 pb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-500" /> الإعدادات العامة والتخصيص
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    عام حقوق النشر (الظاهر في الأسفل)
                  </label>
                  <input
                    type="text"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    dir="ltr"
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                      اللون الأساسي للعلامة (أزرق افتراضيا)
                    </label>
                    <input
                      type="color"
                      value={primaryColorInput}
                      onChange={(e) => setPrimaryColorInput(e.target.value)}
                      className="w-full h-14 bg-dark-800/60 border border-white/10 rounded-xl p-1 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                      اللون الاستثنائي (أصفر افتراضيا)
                    </label>
                    <input
                      type="color"
                      value={secondaryColorInput}
                      onChange={(e) => setSecondaryColorInput(e.target.value)}
                      className="w-full h-14 bg-dark-800/60 border border-white/10 rounded-xl p-1 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">
                    استدارة الأزرار (أمثلة: 0px, 8px, 12px, 9999px)
                  </label>
                  <select
                    value={borderRadiusInput}
                    onChange={(e) => setBorderRadiusInput(e.target.value)}
                    dir="ltr"
                    className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-colors"
                  >
                    <option value="0px">0px (مربع)</option>
                    <option value="4px">4px (دائري قليلاً)</option>
                    <option value="8px">8px (حواف مستديرة)</option>
                    <option value="12px">12px (الافتراضي)</option>
                    <option value="16px">16px (دائري أكثر)</option>
                    <option value="9999px">9999px (بيضوي بالكامل)</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 py-3 bg-gradient-to-l from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
                  >
                    حفظ ونشر التغييرات
                  </button>
                  <button
                    onClick={handleResetSettings}
                    className="px-6 py-3 bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 font-bold rounded-xl transition-all"
                  >
                    استعادة الافتراضي
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
