import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { SidebarWidgets } from "../components/SidebarWidgets";
import { useEffect, useState } from "react";

// Initial mock subscribed courses for demonstration
const INITIAL_SUBSCRIBED = [
  { id: "mock1", title: "المراجعة النهائية (الجزء 1)", subject: "رياضيات", teacher: "أ. محمد", description: "شرح مفصل ومبسط للدروس الأساسية مع حلول مقترحة للتمارين...", price: 1500 },
  { id: "mock2", title: "المراجعة النهائية (الجزء 2)", subject: "رياضيات", teacher: "أ. محمد", description: "شرح مفصل ومبسط للدروس الأساسية مع حلول مقترحة للتمارين...", price: 1000 }
];

export function StudentDashboard() {
  const [subscribedCourses, setSubscribedCourses] = useState<any[]>(INITIAL_SUBSCRIBED);

  useEffect(() => {
    const savedSubscribed = JSON.parse(localStorage.getItem("student_subscribed_courses") || "[]");
    
    // Process saved subscribed courses to ensure they have needed fields
    const formattedSubscribed = savedSubscribed.map((c: any) => ({
      ...c,
      subject: c.subject === 'math' ? 'رياضيات' :
               c.subject === 'physics' ? 'فيزياء' :
               c.subject === 'science' ? 'علوم' :
               c.subject === 'philosophy' ? 'فلسفة' : (c.subject || 'مادة عامة'),
    }));

    if (savedSubscribed.length > 0) {
      setSubscribedCourses([...formattedSubscribed, ...INITIAL_SUBSCRIBED]);
    }
  }, []);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 relative z-10">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Welcome Bar */}
        <div className="glass-card p-5 border-r-4 border-r-primary-500 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              أهلاً بك، التلميذ التجريبي 👋
            </h2>
            <p className="text-gray-400 text-sm mt-1">المستوى: ثالثة ثانوي (BAC)</p>
          </div>
        </div>

        {/* Balances */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📦 أرصدتي</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-bold text-accent-400">1500 دج</span>
              <span className="text-sm font-bold text-white mt-1">الرياضيات</span>
            </div>
            <div className="glass-card p-4 flex flex-col justify-center items-center text-center border border-dashed border-white/20">
               <span className="text-sm text-gray-400 mb-2">ليس لديك رصيد إضافي</span>
               <Link to="/recharge" className="text-xs text-primary-400 hover:underline">شحن الرصيد لمواد اخرى</Link>
            </div>
          </div>
        </div>

        {/* Subscribed Courses */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">📚 دوراتي المشترك بها</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscribedCourses.map((course) => (
              <div key={course.id} className="glass-card flex flex-col relative overflow-hidden group hover:bg-white/[0.02]">
                <div
                  className={`w-full h-24 flex items-start p-4 ${course.bgClass || 'bg-gradient-to-br from-dark-800 to-dark-900 border-b border-white/5'}`}
                >
                    <div className="absolute top-3 left-3 bg-green-500/80 text-white backdrop-blur-sm shadow-sm text-xs px-2 py-1 rounded font-bold border border-green-500/50">
                      مشترك
                    </div>
                    <div className="flex gap-2">
                       <span className="bg-primary-500/80 text-white backdrop-blur-sm text-xs border border-primary-500/50 px-2 py-1 rounded-md shadow-sm">{course.subject}</span>
                    </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="text-lg font-bold mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description || "شرح مفصل ومبسط للدروس..."}</p>
                  
                  <div className="flex items-center gap-2 mb-4 p-2 bg-dark-800/40 rounded-lg border border-white/5">
                    {course.teacherImage ? (
                      <img src={course.teacherImage} alt={course.teacher} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                        {course.teacher?.[0] || "أ"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-300">{course.teacher}</span>
                  </div>
                  
                  <Link to={`/course/${course.id}`} className="btn-primary w-full py-2.5 mt-auto flex justify-center items-center gap-2">
                    <PlayCircle className="w-5 h-5"/> عرض المحتوى
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar right / flex layout means it's on the right (which is left because RTL) */}
      <div className="w-full md:w-[320px] shrink-0">
        <SidebarWidgets />
      </div>

    </div>
  );
}
