import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, ArrowRight } from "lucide-react";

export function StudentChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "مرحباً بك في المساعد الذكي! اسأل أي سؤال مستعصي في دراستك. إجاباتي مولدة آلياً لتخفيف الضغط على الأساتذة، وسيتم رفع الاستفسارات الهامة والمتكررة للأستاذ ليجيب عنها لاحقاً أو في بث مباشر." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Save AI question to questions list to report later
      const questions = JSON.parse(localStorage.getItem(`all_student_questions`) || "[]");
      questions.push({ q: userMessage, date: new Date().toISOString() });
      localStorage.setItem(`all_student_questions`, JSON.stringify(questions));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          model: "Big Pickle",
          systemPrompt: `أنت مساعد ذكي مخصص للإجابة على أسئلة التلاميذ. قم بتبسيط المفاهيم والإجابة بشكل مشجع ومختصر.`
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "لا يمكنني الإجابة الآن." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ في الاتصال بالخدمة." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col relative z-10">
        <div className="mb-6">
          <Link
            to="/dashboard/student"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            العودة للوحة القيادة
          </Link>
        </div>
        
        <main className="flex-1 flex items-center justify-center">
          
          <div className="glass-card flex flex-col h-[75vh] w-full max-w-4xl border-r-4 border-r-accent-500 overflow-hidden">
            <div className="p-4 bg-dark-800/80 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center text-accent-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold">المساعد الدراسي الذكي</h2>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  متصل - يجمع الأسئلة للأساتذة
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-primary-600 text-white rounded-tl-sm" : "bg-dark-800 border border-white/5 text-gray-200 rounded-tr-sm"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-dark-800 border border-white/5 rounded-2xl rounded-tr-sm p-4 flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-dark-800/50 border-t border-white/5">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="اسأل سؤالك هنا وسيتم رفعه أيضاً لأستاذك..."
                  className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-all font-medium text-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-accent-500 hover:bg-accent-600 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center p-3"
                >
                  <Send className="w-5 h-5 rtl:-scale-x-100" />
                </button>
              </form>
            </div>
          </div>

        </main>
    </div>
  );
}
