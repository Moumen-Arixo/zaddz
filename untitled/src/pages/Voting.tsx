import React, { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export function Voting() {
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<Record<string, 'up'|'down'>>({});
  const [globalVotes, setGlobalVotes] = useState<Record<string, {up: number, down: number}>>({});

  useEffect(() => {
    // 1. Get all registered teachers who are "pending"
    const allTeachers = JSON.parse(localStorage.getItem("registered_teachers") || "[]");
    const pending = allTeachers.filter((t: any) => t.status === "pending");
    setPendingTeachers(pending);

    // 2. Load the current user's votes
    const userId = localStorage.getItem("userId");
    if (userId) {
      const userVotesData = JSON.parse(localStorage.getItem(`votes_user_${userId}`) || "{}");
      setMyVotes(userVotesData);
    }

    // 3. Load global votes counts
    const globalData = JSON.parse(localStorage.getItem("global_teacher_votes") || "{}");
    setGlobalVotes(globalData);
  }, []);

  const handleVote = (teacherId: string, type: 'up' | 'down') => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return alert("يجب تسجيل الدخول كطالب للتصويت");
    }

    if (myVotes[teacherId]) return; // Already voted

    // Save my vote
    const newMyVotes = { ...myVotes, [teacherId]: type };
    setMyVotes(newMyVotes);
    localStorage.setItem(`votes_user_${userId}`, JSON.stringify(newMyVotes));

    // Update global votes
    const currentGlobal = { ...globalVotes };
    if (!currentGlobal[teacherId]) {
      currentGlobal[teacherId] = { up: 0, down: 0 };
    }
    currentGlobal[teacherId][type] += 1;
    setGlobalVotes(currentGlobal);
    localStorage.setItem("global_teacher_votes", JSON.stringify(currentGlobal));
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 relative z-10 flex flex-col gap-6">
      <div className="glass-card p-6 border-r-4 border-r-accent-500">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          🗳️ حملات التصويت للأساتذة
        </h2>
        <p className="text-gray-400 mt-2">
          قم بالتصويت على الأساتذة لدعمهم في تقديم المزيد من الدورات القيمة. رأي التلاميذ يساعد الإدارة في القبول.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingTeachers.length === 0 && (
          <div className="text-gray-400 col-span-full text-center py-10 glass-card">
            لا توجد طلبات انضمام في الوقت الحالي
          </div>
        )}
        
        {pendingTeachers.map(t => {
          const voteStats = globalVotes[t.id] || { up: 0, down: 0 };
          const myVote = myVotes[t.id];

          return (
            <div key={t.id} className={cn("glass-card p-6 border border-dashed border-accent-500/50 flex flex-col", myVote && "opacity-70")}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-xl mb-1">{t.name}</h4>
                  <p className="text-accent-400 text-sm">{t.subject} • {t.level === 'bac' ? 'ثانوي' : 'متوسط'}</p>
                </div>
                <div className="flex flex-col gap-1 text-sm text-center bg-dark-900/50 p-2 rounded-lg border border-white/5 whitespace-nowrap min-w-[60px]">
                  <span className="text-green-400 font-mono font-bold">✅ {voteStats.up}</span>
                  <span className="text-red-400 font-mono font-bold">❌ {voteStats.down}</span>
                </div>
              </div>

              <div className="mt-auto">
                {!myVote ? (
                  <div className="flex gap-3">
                    <button onClick={() => handleVote(t.id, "up")} className="flex-1 bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 py-3 rounded-xl text-sm font-bold transition-colors">
                      موافق
                    </button>
                    <button onClick={() => handleVote(t.id, "down")} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 py-3 rounded-xl text-sm font-bold transition-colors">
                      معارض
                    </button>
                  </div>
                ) : (
                  <div className="bg-dark-800 border border-white/10 text-center py-3 rounded-xl text-sm font-bold text-gray-300">
                    {myVote === 'up' ? '✅ تم التصويت: موافق' : '❌ تم التصويت: معارض'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
