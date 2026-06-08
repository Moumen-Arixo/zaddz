import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Landmark, Save } from "lucide-react";
import { motion } from "motion/react";

export function CcpSettings() {
  const [fullName, setFullName] = useState("");
  const [ccpNumber, setCcpNumber] = useState("");
  const [ccpKey, setCcpKey] = useState("");
  const [rip, setRip] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم حفظ بيانات الدفع بنجاح.");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full min-h-[80vh]">
      <div className="w-full max-w-[560px] mb-4">
         <Link to="/dashboard/teacher" className="btn-glass text-sm inline-block">العودة للوحة القيادة</Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-[560px] p-8 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-bl-full -z-10"></div>
        
        <div className="text-center flex flex-col items-center gap-2 mb-2">
           <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center mb-2 border border-accent-500/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
             <Landmark className="w-8 h-8 text-accent-400" />
           </div>
           <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
             🏦 بيانات الحساب البريدي (CCP)
           </h1>
           <p className="text-gray-400 text-sm">هذه البيانات ستظهر للتلاميذ عند طلبهم شحن الرصيد</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 mt-2">
          
          <div className="flex flex-col gap-1.5 border-b border-white/5 pb-5">
            <label className="text-sm font-medium text-gray-300 px-1">الاسم واللقب (كما يظهر في الصك)</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-right" 
              placeholder="مثال: محمد عبدالرحمن"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-medium text-gray-300 px-1">رقم الحساب (CCP)</label>
              <input 
                type="text" 
                value={ccpNumber}
                onChange={(e) => setCcpNumber(e.target.value)}
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-left font-mono tracking-widest text-lg" 
                dir="ltr"
                placeholder="00799999"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 col-span-1">
              <label className="text-sm font-medium text-gray-300 px-1 text-center">مفتاح</label>
              <input 
                type="text" 
                value={ccpKey}
                onChange={(e) => setCcpKey(e.target.value)}
                className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-center font-mono text-lg" 
                dir="ltr"
                placeholder="12"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-5">
            <label className="text-sm font-medium text-gray-300 px-1">رقم RIP الكامل</label>
            <input 
              type="text" 
              value={rip}
              onChange={(e) => setRip(e.target.value)}
              className="bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-left font-mono tracking-wider" 
              dir="ltr"
              placeholder="0079999912345678"
              maxLength={20}
              required
            />
          </div>

          <button type="submit" className="btn-accent py-3.5 mt-2 text-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Save className="w-5 h-5" /> 💾 حفظ بيانات الدفع
          </button>
        </form>

      </motion.div>
    </div>
  );
}
