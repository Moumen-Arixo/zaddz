import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, AlertCircle, CheckCircle, CreditCard, PlayCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Mock funded subjects
const FUNDED_SUBJECTS = [
  { id: "math", name: "رياضيات", balance: 1500 },
  { id: "physics", name: "فيزياء", balance: 2000 }
];

const INITIAL_COURSES: any[] = [];

export function FundedSubjects() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<any | null>(null);
  const [availableCourses, setAvailableCourses] = useState<any[]>(INITIAL_COURSES);
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>([]);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    // Read courses added by teacher from local storage
    const savedCourses = JSON.parse(localStorage.getItem("teacher_courses") || "[]");
    const formattedAddedCourses = savedCourses.map((c: any) => ({
      ...c,
      price: c.price ? parseInt(c.price, 10) : 0,
      subject: c.subject || "math", // default if missing
      teacher: "أستاذ تجريبي",
    }));
    
    setAvailableCourses([...formattedAddedCourses, ...INITIAL_COURSES]);

    // Load subscribed courses from local storage
    const savedSubscribed = JSON.parse(localStorage.getItem("student_subscribed_courses") || "[]");
    setSubscribedCourses(savedSubscribed);
  }, []);

  const handleSubscribe = (courseId: any) => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    const newSubscribed = [...subscribedCourses, course];
    setSubscribedCourses(newSubscribed);
    localStorage.setItem("student_subscribed_courses", JSON.stringify(newSubscribed));

    setNotification(`تم الاشتراك في دورة ${course.title} بنجاح! تجدها الآن في لوحة التلميذ.`);
    setTimeout(() => setNotification(""), 3000);
    setShowConfirm(null);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 relative z-10">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary-400" />
          المواد المشحونة
        </h1>
        <p className="text-gray-400 text-sm">اختر المادة التي شحنت رصيدها للاشتراك في دوراتها المتاحة.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 flex flex-col gap-4">
          <h2 className="text-lg font-bold">موادي المتاحة:</h2>
          {FUNDED_SUBJECTS.map((subject) => (
            <div 
              key={subject.id} 
              onClick={() => setSelectedSubject(subject.id)}
              className={cn(
                "glass-card p-4 flex flex-col cursor-pointer transition-all border",
                selectedSubject === subject.id 
                  ? "border-primary-400 bg-primary-500/10 shadow-[0_0_15px_rgba(56,189,248,0.2)]" 
                  : "border-white/10 hover:border-white/30"
              )}
            >
              <span className="font-bold text-lg mb-1">{subject.name}</span>
              <span className="text-sm text-primary-400 font-bold">{subject.balance} دج متاح</span>
            </div>
          ))}
          {FUNDED_SUBJECTS.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4 bg-dark-800/50 rounded-lg border border-dashed border-white/10">
              ليس لديك رصيد في أي مادة حالياً.
            </div>
          )}
          <Link to="/recharge" className="btn-glass text-center py-3 mt-2 flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" /> شحن رصيد إضافي
          </Link>
        </div>

        <div className="md:col-span-3">
          {selectedSubject ? (
            <div className="flex flex-col gap-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                الدورات المتاحة في مادة {FUNDED_SUBJECTS.find(s => s.id === selectedSubject)?.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableCourses.filter(c => c.subject === selectedSubject).map(course => (
                  <div key={course.id} className="glass-card p-5 flex flex-col relative">
                    <h4 className="text-lg font-bold mb-2">{course.title}</h4>
                    <span className="text-sm text-gray-400 mb-4">{course.teacher}</span>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-accent-400 font-bold">{course.price} دج</span>
                      <button 
                        onClick={() => setShowConfirm(course.id)} 
                        className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" /> اشتراك
                      </button>
                    </div>

                    <AnimatePresence>
                      {showConfirm === course.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute inset-0 bg-dark-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 border border-primary-500/30"
                        >
                          <h5 className="font-bold text-lg mb-2">تأكيد الاشتراك</h5>
                          <p className="text-sm text-gray-300 mb-6">هل أنت متأكد من خصم <span className="text-accent-400 font-bold">{course.price} دج</span> من رصيد مادة {FUNDED_SUBJECTS.find(s => s.id === selectedSubject)?.name} للاشتراك في هذه الدورة؟</p>
                          <div className="flex gap-3 w-full">
                            <button onClick={() => setShowConfirm(null)} className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-lg text-sm font-bold transition-colors">
                              إلغاء
                            </button>
                            <button onClick={() => handleSubscribe(course.id)} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 py-2.5 rounded-lg text-sm font-bold transition-colors">
                              تأكيد الاشتراك
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
              <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-300 mb-2">يرجى اختيار مادة</h3>
              <p className="text-gray-500 max-w-sm">اختر إحدى المواد من القائمة الجانبية لاستعراض الدورات المتاحة للاشتراك بناءً على رصيدك.</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-3 z-50 animate-bounce">
          <span className="text-xl">✅</span>
          {notification}
        </div>
      )}

    </div>
  );
}
