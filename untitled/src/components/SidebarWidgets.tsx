import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Plus, Trash2, Check, Cloud, Database, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";
import { initAuth, googleSignIn, googleSignOut, getAccessToken } from "../lib/firebase";
import { fetchApi } from "../config";

// Pomodoro Component
export function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      // Play alarm
      // new Audio('/alarm.mp3').play();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="glass-card p-6 flex flex-col items-center">
      <h3 className="font-bold mb-4">مؤقت بومودورو</h3>
      <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="60" cy="60" r="54" className="stroke-dark-800" strokeWidth="8" fill="transparent" />
          <circle 
            cx="60" cy="60" r="54" 
            className="stroke-primary-500 transition-all duration-1000 linear" 
            strokeWidth="8" fill="transparent" 
            strokeDasharray="339.292" 
            strokeDashoffset={339.292 * (progress / 100)} 
            strokeLinecap="round" 
          />
        </svg>
        <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center hover:bg-primary-500/30 transition-colors">
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>
        <button onClick={reset} className="w-10 h-10 rounded-full bg-white/5 text-gray-400 flex items-center justify-center hover:bg-white/10 transition-colors">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Todo List Component
export function TodoList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "مراجعة درس المتتاليات", completed: false },
    { id: 2, text: "حل تمرين الفيزياء", completed: true },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([{ id: Date.now(), text: newTask, completed: false }, ...tasks]);
    setNewTask("");
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="glass-card p-6 flex flex-col h-full mt-6">
      <h3 className="font-bold mb-4">المهام اليومية</h3>
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="مهمة جديدة..." 
          className="flex-1 bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-white"
        />
        <button onClick={addTask} className="bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 text-primary-300 rounded-lg px-3 flex items-center gap-1 transition-colors text-sm font-bold min-w-fit">
          <Plus className="w-4 h-4" /> إضافة
        </button>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 max-h-[300px]">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => toggleTask(task.id)}
                 className={cn(
                   "w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm",
                   task.completed ? "bg-green-500 border-green-500" : "border-gray-500 hover:border-gray-300"
                 )}
               >
                 {task.completed && <Check className="w-3 h-3 text-white" />}
               </button>
               <span className={cn("text-sm transition-colors", task.completed ? "line-through text-gray-500" : "text-white")}>
                 {task.text}
               </span>
             </div>
             <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-gray-500 text-sm text-center mt-4">لا توجد مهام.</p>}
      </div>
    </div>
  );
}

export function GoogleDriveWidget() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have token
    const gdToken = localStorage.getItem("gdrive_access_token");
    if (gdToken) setIsConnected(true);

    // Listen for OAuth messages from popup
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'GDRIVE_AUTH_CODE') {
        const code = event.data.code;
        try {
          setIsConnecting(true);
          const redirectUri = window.location.origin + window.location.pathname;
          const res = await fetchApi("/api/gdrive/exchange", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirectUri })
          });
          const data = await res.json();
          if (data.success) {
            localStorage.setItem("gdrive_access_token", data.token);
            if (data.refresh_token) {
              localStorage.setItem("gdrive_refresh_token", data.refresh_token);
            }
            setIsConnected(true);
            setError(null);
          } else {
            throw new Error(data.error);
          }
        } catch (err: any) {
          setError(err.message || "فشل الربط");
        } finally {
          setIsConnecting(false);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      // The current page URL will act as the redirect URI
      const currentUrl = window.location.origin + window.location.pathname;
      const response = await fetchApi(`/api/gdrive/auth-url?redirectUri=${encodeURIComponent(currentUrl)}`);
      const { url } = await response.json();
      
      // Open Google Auth directly in popup
      const authWindow = window.open(url, "oauth_popup", "width=600,height=700");
      if (!authWindow) {
         setError("يرجى السماح بالنوافذ المنبثقة لإكمال عملية الربط.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الربط.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    try {
      localStorage.removeItem("gdrive_access_token");
      localStorage.removeItem("gdrive_refresh_token");
      setIsConnected(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col mb-6 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Cloud className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold">Google Drive</h3>
          <p className="text-xs text-gray-400">مزامنة الكورسات والمرفقات</p>
        </div>
      </div>

      <div className="space-y-3">
        {isConnected ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              <span>متصل بنجاح</span>
            </div>
            <p className="text-xs text-gray-400">حسابك مرتبط الآن.</p>
            <button 
              onClick={handleDisconnect} 
              disabled={isConnecting}
              className="text-xs text-red-400 hover:underline mt-1 text-right disabled:opacity-50"
            >
              {isConnecting ? "جاري الإلغاء..." : "إلغاء الربط"}
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-wait"
            >
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {isConnecting ? "جاري الربط..." : "ربط حساب Google Drive"}
            </button>
            {error && (
              <p className="text-xs text-red-400 text-center mt-2">{error}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SidebarWidgets() {
  return (
    <div className="flex flex-col gap-0 sticky top-24">
      <Pomodoro />
      <TodoList />
    </div>
  );
}
