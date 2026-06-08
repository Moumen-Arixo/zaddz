import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to UI
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const systemPrompt = `أنت مساعد شخصي ذكي مدمج داخل منصة Zad DZ التعليمية. وظيفتك هي مساعدة المستخدمين (تلاميذ، أساتذة، مدراء) في استخدام المنصة، حل المشاكل التي تواجههم، والإجابة عن أي استفسار يخص المنصة. المنصة تقدم دورات تعليمية للطورين المتوسط والثانوي في الجزائر.`;
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: systemPrompt
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages([...newMessages, { role: "assistant", content: "عذراً، حدث خطأ: " + err.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-accent-500/30 hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] h-[500px] max-h-[80vh] bg-dark-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="p-4 bg-dark-800 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">المساعد الذكي</h3>
                <span className="text-[10px] text-green-400">متصل (Big Pickle)</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                مرحباً! أنا المساعد الذكي للمنصة. كيف يمكنني مساعدتك اليوم؟
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] ${msg.role === 'user' ? 'bg-primary-500/20 text-primary-400' : 'bg-accent-500/20 text-accent-400'}`}>
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                </div>
                <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-primary-600/30 text-white rounded-tr-none' : 'bg-dark-800 border border-white/5 text-gray-300 rounded-tl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                 <div className="w-6 h-6 shrink-0 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="px-3 py-2 rounded-xl text-sm bg-dark-800 border border-white/5 text-gray-300 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent-500" /> يفكر...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-dark-800 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك..."
              className="flex-1 bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center hover:bg-accent-500/30 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
