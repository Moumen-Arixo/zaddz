import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Check, X, FileEdit, PlusCircle, Bot, Loader2 } from "lucide-react";
import { setupNewCourseAutomated } from "../lib/terabox";
import { SidebarWidgets, GoogleDriveWidget } from "../components/SidebarWidgets";
import { fetchApi } from "../config";

export function TeacherDashboard() {
  const navigate = useNavigate();
  const isCCPConfigured = false; // Mock
  
  const [courses, setCourses] = useState<any[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: "", level: "bac", subject: "math", description: "", price: "", discount: "0", bgClass: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
  });

  const [teacherInfo, setTeacherInfo] = useState<any>({});
  
  const [customColor1, setCustomColor1] = useState("#4f46e5");
  const [customColor2, setCustomColor2] = useState("#ec4899");
  const [isUploadingBackground, setIsUploadingBackground] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingBackground(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
         setNewCourse({ ...newCourse, bgClass: `bg-[url('${data.url}')] bg-cover bg-center` });
      } else {
         alert("فشل رفع الصورة: " + data.error);
      }
    } catch {
      alert("خطأ في الاتصال أثناء الرفع");
    } finally {
      setIsUploadingBackground(false);
    }
  };

  const applyCustomGradient = () => {
    setNewCourse({ ...newCourse, bgClass: `bg-[linear-gradient(to_bottom_right,${customColor1},${customColor2})]` });
  };
  
  const [aiReport, setAiReport] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const generateTeacherReport = async () => {
    setIsGeneratingReport(true);
    setAiReport("");
    try {
      const allQuestions = JSON.parse(localStorage.getItem(`all_student_questions`) || "[]");
      const recentQuestions = allQuestions.slice(-10).map((q: any) => q.q).join(" | ");
      const totalStudents = courses.reduce((acc, c) => acc + (c.students || 0), 0);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `تخيل أنك محلل أداء للأساتذة. الأستاذ ${teacherInfo?.name || ""} ينشر دورات بمستوى مبيعات (عدد الدورات المنشورة: ${courses.length} وعدد إجمالي المشتركين: ${totalStudents}). 
          الأسئلة الأكثر تكراراً من التلاميذ مؤخراً: ${recentQuestions || "لا توجد أسئلة بعد"}.
          بناء على هذه الأسئلة، قم بتحليلها واقتراح كيفية الإجابة عليها، واكتب له نصائح قصيرة ومباشرة حول كيفية تطوير محتواه وجذب المزيد من الطلاب.` }],
          model: "Big Pickle",
          systemPrompt: "أنت مساعد ذكي للأستاذ والمستشار الشخصي له، يجب أن تكون الإجابة قصيرة ومشجعة في أسطر أو نقاط محدودة."
        })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      setAiReport(data.reply);
    } catch(err: any) {
      setAiReport("حدث خطأ في الاتصال بالذكاء الاصطناعي: " + err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  useEffect(() => {
    // Check if this window is a popup returning from Google OAuth
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && window.opener) {
      window.opener.postMessage({ type: 'GDRIVE_AUTH_CODE', code }, '*');
      window.close();
      return;
    }

    // Load courses from backend API
    fetchApi("/api/courses")
      .then(res => res.json())
      .then(data => {
        const currentUserIdInt = parseInt(localStorage.getItem("userId") || "0", 10);
        // Map backend names to frontend naming
        setCourses(data.filter((c: any) => c.teacher_id === currentUserIdInt).map((c: any) => ({
          id: c.id.toString(),
          title: c.title,
          description: c.description,
          level: c.level.toLowerCase(),
          subject: c.subject || 'math', // if not saved
          price: c.price.toString(),
          discount: c.discount?.toString() || '0',
          teacherId: c.teacher_id.toString(),
          teacher: c.teacher || "أستاذ",
          teacherImage: null,
          students: 0,
          bgClass: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
          content: { documents: [], videos: [], live: [], exercises: [] }
        })));
      })
      .catch(err => console.error(err));
    
    const currentUserId = localStorage.getItem("userId");
    const teachers = JSON.parse(localStorage.getItem("registered_teachers") || "[]");
    const currentTeacher = teachers.find((t: any) => t.id.toString() === currentUserId);
    if (currentTeacher) {
      setTeacherInfo(currentTeacher);
    }
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.price) return alert("يرجى ملء عنوان الدورة والسعر");

    const currentUserId = localStorage.getItem("userId") || 2;

    // Setup Terabox folders automatically
    const courseConfig: any = {
      level: newCourse.level.toUpperCase(),
      subject: newCourse.subject,
      courseName: newCourse.title
    };

    let teraboxData = null;
    try {
      teraboxData = await setupNewCourseAutomated(courseConfig);
    } catch (err) {
      console.error("Terabox folder setup failed", err);
    }
    
    try {
      const res = await fetchApi("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCourse.title,
          description: newCourse.description,
          level: newCourse.level,
          price: newCourse.price,
          discount: newCourse.discount,
          teacher_id: currentUserId,
          subject: newCourse.subject
        })
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error("Failed to save to database");
      }

      const courseData = {
        ...newCourse,
        id: data.courseId.toString(),
        students: 0,
        teacherId: currentUserId.toString(),
        teacher: teacherInfo.name || "أستاذ",
        teacherImage: teacherInfo.imageProfile || null,
        content: { documents: [], videos: [], live: [], exercises: [] },
        terabox: teraboxData
      };

      const updatedCourses = [courseData, ...courses];
      setCourses(updatedCourses);
      
      // Keep a local copy in case other components still use it without refetching immediately
      const allSavedCourses = JSON.parse(localStorage.getItem("teacher_courses") || "[]");
      localStorage.setItem("teacher_courses", JSON.stringify([courseData, ...allSavedCourses]));
      
      // Reset form
      setNewCourse({ title: "", level: "bac", subject: "math", description: "", price: "", discount: "0", bgClass: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20" });
      alert("تم نشر الدورة وتجهيز مساحة التخزين بنجاح!");
    } catch(err) {
       console.error("DB Error", err);
       alert("حدث خطأ أثناء الاتصال بقاعدة البيانات.");
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 relative z-10">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Welcome Bar */}
        <div className="glass-card p-5 border-r-4 border-r-accent-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {teacherInfo.imageProfile ? (
              <img src={teacherInfo.imageProfile} alt={teacherInfo.name} className="w-12 h-12 rounded-full object-cover border-2 border-accent-500" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent-500/20 border-2 border-accent-500 flex items-center justify-center text-accent-500 font-bold text-xl">
                {teacherInfo.name?.[0] || 'أ'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                أهلاً بك، {teacherInfo.name || "الأستاذ"} 👋
              </h2>
              <p className="text-gray-400 text-sm mt-1">المادة: {teacherInfo.subject || "غير محدد"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-full text-sm font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            حساب نشط
          </div>
        </div>

        {/* CCP Warning */}
        {!isCCPConfigured && (
          <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-400 shrink-0 sm:mt-0.5" />
            <div className="flex-1">
              <h3 className="text-orange-400 font-bold mb-1">يجب إعداد بيانات الدفع الخاصة بك</h3>
              <p className="text-sm text-gray-300 mb-3">حسابك مفعل ولكن لا يمكن للتلاميذ الدفع لك أو الاشتراك في دوراتك حتى تقوم بإدخال بيانات حسابك البريدي الجاري (CCP).</p>
              <Link to="/teacher/ccp" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors inline-block text-center w-full sm:w-auto shadow-md">
                إعداد بيانات CCP الآن
              </Link>
            </div>
          </div>
        )}

         {/* Create Course */}
        <div>
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">➕ إنشاء دورة جديدة</h3>
           <form onSubmit={handleCreateCourse} className="glass-card p-6 flex flex-col gap-4">
             <div className="grid grid-cols-1 gap-4">
               <div>
                 <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">عنوان الدورة</label>
                 <input type="text" value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-right" placeholder="مثال: المراجعة النهائية..." required />
               </div>
             </div>
             
             <div>
               <div className="flex justify-between items-end mb-1.5">
                 <label className="text-sm font-medium text-gray-300 px-1">وصف قصير</label>
                 <button 
                   type="button" 
                   onClick={async () => {
                     try {
                       if (!newCourse.title || !newCourse.subject) {
                         alert("يرجى إدخال عنوان الدورة والمادة أولاً بوضوح لكي يتم توليد وصف مناسب");
                         return;
                       }
                       setNewCourse({...newCourse, description: "جاري كتابة الوصف بواسطة الذكاء الاصطناعي..."});
                       let subjectName = newCourse.subject;
                       if (newCourse.subject === "math") subjectName = "الرياضيات";
                       if (newCourse.subject === "physics") subjectName = "الفيزياء";
                       if (newCourse.subject === "science") subjectName = "العلوم الطبيعية";
                       if (newCourse.subject === "arabic") subjectName = "اللغة العربية";

                       const res = await fetch("/api/ai/chat", {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                           messages: [{ role: "user", content: `قم بكتابة وصف احترافي ومشوق (3-2 أسطر كحد أقصى) لدورة تعليمية بعنوان "${newCourse.title}" في مادة "${subjectName}" للمستوى "${newCourse.level}". الوصف يجب أن يكون قصيراً ومقنعاً للتلاميذ للاشتراك. استخدم اللغة العربية السليمة.` }],
                           model: "Big Pickle",
                           systemPrompt: "أنت مساعد ذكي متخصص في التسويق التعليمي بأسلوب مميز."
                         })
                       });
                       const data = await res.json();
                       if (!res.ok) throw new Error(data.error);
                       setNewCourse({...newCourse, description: data.reply});
                     } catch(err) {
                       alert("حدث خطأ في توليد الوصف.");
                       setNewCourse({...newCourse, description: ""});
                     }
                   }}
                   className="text-xs bg-accent-500/20 text-accent-400 px-2 py-1.5 rounded hover:bg-accent-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                 >
                   <Bot className="w-3.5 h-3.5" /> مساعدة بالذكاء الاصطناعي
                 </button>
               </div>
               <textarea rows={3} value={newCourse.description} onChange={e => setNewCourse({...newCourse, description: e.target.value})} className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors resize-none" placeholder="اكتب نبذة عن ما سيتم تدريسه..."></textarea>
             </div>

             <div>
               <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">اختر خلفية ملونة للدورة</label>
               <div className="flex flex-col gap-4">
                 <div className="flex flex-wrap gap-3">
                   {[
                     "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
                     "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
                     "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
                     "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
                     "bg-gradient-to-br from-amber-500/20 to-orange-500/20",
                     "bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80')] bg-cover bg-center", // Math pattern
                     "bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80')] bg-cover bg-center", // Science pattern
                     "bg-[url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80')] bg-cover bg-center", // Writing pattern
                     "bg-[url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?w=400&q=80')] bg-cover bg-center", // Cosmos pattern
                     "bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80')] bg-cover bg-center", // Tech pattern
                     "bg-[url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&q=80')] bg-cover bg-center", // Desk pattern
                     "bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80')] bg-cover bg-center"  // Code pattern
                   ].map((bg, idx) => (
                     <div 
                       key={idx}
                       onClick={() => setNewCourse({...newCourse, bgClass: bg})}
                       className={`w-16 h-12 rounded-lg cursor-pointer border-2 transition-all ${bg} ${newCourse.bgClass === bg ? 'border-accent-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.5)] z-10' : 'border-white/10 hover:border-white/30'}`}
                     />
                   ))}
                 </div>
                 
                 <div className="bg-dark-800/40 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-end">
                   <div className="flex-1 w-full">
                     <p className="text-sm text-gray-400 mb-2">أو ابحث عن خلفية بالكلمات:</p>
                     <div className="flex gap-2 items-center">
                       <input type="text" value={customColor1} onChange={(e) => setCustomColor1(e.target.value)} placeholder="مثال: math" className="w-full bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-accent-400" />
                       <button type="button" onClick={() => setNewCourse({ ...newCourse, bgClass: `bg-[url('https://source.unsplash.com/800x600/?${encodeURIComponent(customColor1)}')] bg-cover bg-center` })} className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg font-bold transition-colors">ابحث</button>
                     </div>
                   </div>
                   <div className="flex-1 w-full flex flex-col justify-end border-t md:border-t-0 md:border-r border-white/5 pt-4 md:pt-0 md:pr-4">
                     <p className="text-sm text-gray-400 mb-2">أو ارفع صورة من جهازك:</p>
                     <label className="bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 border border-primary-500/30 text-xs px-3 py-2 rounded-lg font-bold transition-colors cursor-pointer text-center block disabled:opacity-50">
                       {isUploadingBackground ? "جاري الرفع..." : "اختر صورة 🖼️"}
                       <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploadingBackground} />
                     </label>
                   </div>
                 </div>
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">السعر (دج)</label>
                 <select value={newCourse.price} onChange={e => setNewCourse({...newCourse, price: e.target.value})} className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors appearance-none cursor-pointer" required>
                    <option value="" disabled>اختر السعر...</option>
                    {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000].map(p => (
                      <option key={p} value={p}>{p === 0 ? "مجاناً (0 دج)" : `${p} دج`}</option>
                    ))}
                  </select>
               </div>
               <div>
                 <label className="text-sm font-medium text-gray-300 px-1 mb-1.5 block">الخصم (%)</label>
                 <input type="number" min="0" max="25" value={newCourse.discount} onChange={e => setNewCourse({...newCourse, discount: e.target.value})} className="w-full bg-dark-800/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-400 transition-colors text-left" dir="ltr" placeholder="0" />
               </div>
             </div>

             <button type="submit" className="btn-accent py-3.5 mt-2 flex justify-center items-center gap-2">
               <PlusCircle className="w-5 h-5"/> نشر الدورة
             </button>
           </form>
        </div>

        {/* My Courses */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📚 دوراتي ({courses.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.length > 0 ? courses.map((course: any) => (
              <div key={course.id} className="glass-card flex flex-col group overflow-hidden">
                <div
                  className={`w-full h-24 flex items-start justify-between p-4 ${course.bgClass || 'bg-gradient-to-br from-dark-800 to-dark-900 border-b border-white/5'}`}
                >
                  <div className="flex gap-2 mb-2">
                    <span className="bg-accent-500/80 text-white backdrop-blur-sm text-xs border border-accent-500/50 px-2 py-1 rounded-md shadow-sm">{course.level === 'bac' ? 'ثانوي' : course.level === 'bem' ? 'متوسط' : course.level}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-lg font-bold mb-2">{course.title}</h4>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 min-h-[40px]">{course.description || "بدون وصف"}</p>
                  <div className="flex items-center justify-between mb-4 mt-auto pt-4 border-t border-white/5">
                    <div className="bg-dark-800/50 px-3 py-1.5 rounded-lg border border-white/5 flex gap-1 items-center">
                      <span className="font-bold text-accent-400">{course.price}</span>
                      <span className="text-xs text-gray-400">دج</span>
                    </div>
                    <div className="text-sm text-gray-300 font-medium bg-white/5 px-2 py-1 rounded">👨‍🎓 {course.students || 0} مسجلين</div>
                  </div>
                  <Link to={`/teacher/course/${course.id}/manage`} className="btn-glass bg-white/5 hover:bg-white/10 w-full py-2.5 mt-2 flex justify-center items-center gap-2 transition-colors">
                    <FileEdit className="w-4 h-4"/> إدارة المحتوى والملفات
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-8 text-center text-gray-500">
                لم تقم بنشر أي دورة بعد.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sidebar right / flex layout means it's on the right (which is left because RTL) */}
      <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-6">
        
        <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold border-b border-white/10 pb-2 flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent-400" /> تحليل الأداء بالذكاء الاصطناعي
            </h3>
            <p className="text-sm text-gray-400">احصل على تقرير ذكي يلخص نشاطك في المنصة، مع نصائح لزيادة عدد المسجلين، وتحسين الدورات.</p>
            <button 
                  onClick={generateTeacherReport}
                  disabled={isGeneratingReport}
                  className="bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30 px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <Bot className="w-5 h-5" />
                  {isGeneratingReport ? "جاري التوليد..." : "توليد تقرير ذكي عن الأداء"}
            </button>

            {aiReport && (
              <div className="mt-2 bg-dark-900/50 border border-white/10 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                {aiReport}
              </div>
            )}
        </div>

        <div className="flex flex-col gap-6">
          <GoogleDriveWidget />
          <SidebarWidgets />
        </div>
      </div>

    </div>
  );
}

