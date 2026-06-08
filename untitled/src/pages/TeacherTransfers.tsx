import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, ArrowRight, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

// Removed Mock Data
const MOCK_TRANSFERS: any[] = [];

export function TeacherTransfers() {
  const [transfers, setTransfers] = useState(MOCK_TRANSFERS);

  const handleAction = (id: number, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من ${newStatus === 'accepted' ? 'قبول' : 'رفض'} هذا التحويل؟`)) return;
    
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const pendingCount = transfers.filter(t => t.status === "pending").length;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
      
      <div className="flex items-center gap-4 mb-2">
        <Link to="/dashboard/teacher" className="btn-glass p-2 border border-white/10 flex items-center justify-center rounded-full hover:bg-white/10">
          <ArrowRight className="w-5 h-5 text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent-400" /> تحويلات التلاميذ المدفوعة
        </h1>
        {pendingCount > 0 && (
          <span className="bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] mr-auto">
            {pendingCount} معلق
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {transfers.map(transfer => (
          <div key={transfer.id} className={cn(
            "glass-card p-4 flex flex-col sm:flex-row gap-6 items-center transition-opacity border-r-4",
            transfer.status === "pending" ? "border-r-accent-500" : transfer.status === "accepted" ? "border-r-green-500 opacity-60" : "border-r-red-500 opacity-60"
          )}>
            <div className="w-full sm:w-[240px] h-[160px] sm:h-[140px] bg-dark-800 rounded-xl border border-white/10 overflow-hidden shrink-0 relative group cursor-pointer">
              <img src={transfer.image} alt="Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold gap-2">
                <ExternalLink className="w-6 h-6" /> تكبير الوصل
              </div>
            </div>
            
            <div className="flex-1 flex flex-col w-full">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-lg text-white">{transfer.student}</h4>
                  <p className="text-sm text-gray-400">الدورة: {transfer.course}</p>
                </div>
                <span className="text-xs text-gray-500 font-mono bg-dark-800 px-2 py-1 rounded">{transfer.date}</span>
              </div>
              
              <div className="text-2xl font-black text-accent-400 my-2 drop-shadow-md">{transfer.amount} دج</div>
              
              <div className="flex gap-2 mt-auto">
                {transfer.status === "pending" ? (
                  <>
                    <button onClick={() => handleAction(transfer.id, "accepted")} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2">
                      <CheckCircle className="w-4 h-4"/> قبول التفعيل
                    </button>
                    <button onClick={() => handleAction(transfer.id, "rejected")} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 py-2.5 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2">
                      <XCircle className="w-4 h-4"/> رفض
                    </button>
                  </>
                ) : (
                  <div className={cn(
                    "w-full py-2.5 rounded-lg text-sm font-bold text-center flex justify-center items-center gap-2 border",
                    transfer.status === "accepted" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {transfer.status === "accepted" ? <><CheckCircle className="w-4 h-4"/> تم قبول التحويل</> : <><XCircle className="w-4 h-4"/> تم رفض التحويل</>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
