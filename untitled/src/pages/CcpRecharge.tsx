import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UploadCloud, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

// Mock Data
const SUBJECTS = [
  { id: "math", name: "رياضيات" },
  { id: "physics", name: "فيزياء" }
];

const TEACHERS = [
  { id: "t1", name: "أ. محمد عبد الله", subject: "رياضيات", ccp: "00799999", key: "12", rip: "0079999912345678" },
  { id: "t2", name: "أ. سمير خليل", subject: "فيزياء", ccp: "12345678", key: "99", rip: "1234567890123456" }
];

const HISTORY = [
  { id: 1, teacher: "أ. محمد عبد الله", subject: "رياضيات", amount: 2000, date: "2024-10-15", status: "pending" },
  { id: 2, teacher: "أ. سمير خليل", subject: "فيزياء", amount: 3500, date: "2024-10-10", status: "accepted" },
  { id: 3, teacher: "أ. أمينة", subject: "فلسفة", amount: 1500, date: "2024-09-28", status: "rejected" },
];

export function CcpRecharge() {
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [amount, setAmount] = useState("");
  const [fileName, setFileName] = useState("");

  const filteredTeachers = TEACHERS.filter(t => t.subject === SUBJECTS.find(s => s.id === subject)?.name);
  const selectedTeacher = TEACHERS.find(t => t.id === teacherId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="flex items-center gap-1 text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded border border-yellow-400/30 text-xs font-bold"><Clock className="w-3 h-3" /> معلق</span>;
      case "accepted":
        return <span className="flex items-center gap-1 text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-500/30 text-xs font-bold"><CheckCircle className="w-3 h-3" /> مقبول</span>;
      case "rejected":
        return <span className="flex items-center gap-1 text-red-400 bg-red-500/20 px-2 py-1 rounded border border-red-500/30 text-xs font-bold"><XCircle className="w-3 h-3" /> مرفوض</span>;
      default:
        return null;
    }
  };

  const [history, setHistory] = useState(HISTORY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !fileName) {
       alert("الرجاء تحديد المبلغ ورفع صورة الوصل!");
       return;
    }
    
    setHistory([{
      id: Date.now(),
      teacher: selectedTeacher?.name || "",
      subject: SUBJECTS.find(s => s.id === subject)?.name || "",
      amount: parseInt(amount, 10),
      date: new Date().toISOString().split('T')[0],
      status: "pending"
    }, ...history]);
    
    setAmount("");
    setFileName("");
    setSubject("");
    setTeacherId("");
    alert("تم رفع معلومات التحويل بنجاح، سيتم التفقد قريباً من طرف الأستاذ.");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">💳 شحن الرصيد عبر CCP</h1>
          <p className="text-gray-400 text-sm mt-1">قم بتحويل المبلغ للأستاذ المناسب للحصول على الرصيد.</p>
        </div>
        <Link to="/dashboard/student" className="btn-glass text-sm">العودة للوحة القيادة</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* New Transfer Form */}
        <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-accent-500/10 rounded-br-full -z-10"></div>
          
          <h3 className="text-xl font-bold mb-2">تحويل جديد ➕</h3>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">1. اختر المادة</label>
              <select 
                value={subject} 
                onChange={(e) => { setSubject(e.target.value); setTeacherId(""); }}
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>المادة...</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300 px-1">2. اختر الأستاذ</label>
              <select 
                value={teacherId} 
                onChange={(e) => setTeacherId(e.target.value)}
                disabled={!subject || filteredTeachers.length === 0}
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>الأستاذ...</option>
                {filteredTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <AnimatePresence>
            {selectedTeacher && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-accent-500/5 border border-accent-500/30 rounded-xl p-5 mt-2 relative">
                  <h4 className="text-accent-400 font-bold mb-4 flex items-center gap-2">
                    🏦 بيانات الحساب البريدي (CCP)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">الاسم الكامل</span>
                      <span className="font-bold text-white bg-dark-900/50 px-3 py-2 rounded-lg border border-white/5">{selectedTeacher.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">رقم الحساب (CCP)</span>
                      <div className="flex gap-2">
                        <span className="font-mono text-lg font-bold text-white bg-dark-900/50 px-3 py-2 rounded-lg border border-white/5 flex-1 text-left" dir="ltr">{selectedTeacher.ccp}</span>
                        <span className="font-mono text-lg font-bold text-gray-400 bg-dark-900/50 px-3 py-2 rounded-lg border border-white/5 text-center flex-shrink-0" dir="ltr">{selectedTeacher.key}</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <span className="text-xs text-gray-400 mb-1">RIP</span>
                      <span className="font-mono text-white bg-dark-900/50 px-3 py-2 rounded-lg border border-white/5 tracking-wider text-left" dir="ltr">{selectedTeacher.rip}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300 px-1">المبلغ المحول (دج)</label>
                    <input 
                      type="number" 
                      min="50"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-left font-bold text-lg"
                      dir="ltr"
                      placeholder="2000"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-300 px-1">صورة الوصل (البرهان)</label>
                    <label className="flex flex-col items-center justify-center p-6 bg-dark-800/40 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-accent-400 hover:bg-dark-800/60 transition-all group overflow-hidden relative min-h-[120px]">
                      <input type="file" className="hidden" accept=".jpg,.png,.webp,.pdf" onChange={handleFileChange} />
                      {fileName ? (
                        <div className="flex items-center gap-2 text-accent-400 font-bold z-10">
                          <CheckCircle className="w-5 h-5" /> 
                          <span className="truncate max-w-[200px]" dir="ltr">{fileName}</span>
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-accent-400 mb-2 transition-colors z-10" />
                          <span className="text-sm font-medium text-gray-300 z-10">اضغط لرفع صورة أو اسحب وإفلت</span>
                          <span className="text-xs text-gray-500 mt-1 z-10">JPG, PNG, WEBP, PDF (أقصى 4MB)</span>
                        </>
                      )}
                      {fileName && <div className="absolute inset-0 bg-accent-500/5 opacity-50"></div>}
                    </label>
                  </div>

                  <button type="submit" className="btn-accent w-full py-3.5 mt-2 flex justify-center items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> تأكيد التحويل المالي
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </form>

        {/* History Table */}
        <div className="glass-card p-6 flex flex-col gap-4">
          <h3 className="text-xl font-bold mb-2">سجل التحويلات 📜</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right align-middle">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-3 font-medium">الأستاذ</th>
                  <th className="py-3 font-medium">المادة</th>
                  <th className="py-3 font-medium text-center">المبلغ</th>
                  <th className="py-3 font-medium text-center">التاريخ</th>
                  <th className="py-3 font-medium text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-bold text-white">
                      {item.teacher}
                    </td>
                    <td className="py-4 text-gray-300">{item.subject}</td>
                    <td className="py-4 text-center">
                      <span className="font-bold text-accent-400">{item.amount} دج</span>
                    </td>
                    <td className="py-4 text-center text-gray-400 font-mono text-xs" dir="ltr">{item.date}</td>
                    <td className="py-4 flex justify-center">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
