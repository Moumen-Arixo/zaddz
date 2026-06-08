import { useState, useEffect } from "react";
import { Search, Filter, RotateCcw, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchApi } from "../config";

// Mock data
export const INITIAL_COURSES: any[] = [];

export function Browser() {
  const [courses, setCourses] = useState<any[]>(INITIAL_COURSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [notification, setNotification] = useState("");
  const [subscribedCourseIds, setSubscribedCourseIds] = useState<any[]>([]);

  const userRole = localStorage.getItem("userRole");

  const handleSubscribe = (course: any) => {
    if (userRole !== "student") {
      setNotification("يلزم التسجيل بحساب تلميذ للاشتراك في الدورات");
      setTimeout(() => setNotification(""), 3000);
      return;
    }

    if (course.isFree || course.price === "مجانًا" || course.price === "0 دج") {
      const savedSubscribed = JSON.parse(
        localStorage.getItem("student_subscribed_courses") || "[]",
      );
      const isAlreadySubscribed = savedSubscribed.find(
        (c: any) => c.id === course.id,
      );

      if (!isAlreadySubscribed) {
        savedSubscribed.push(course);
        localStorage.setItem(
          "student_subscribed_courses",
          JSON.stringify(savedSubscribed),
        );
        setSubscribedCourseIds((prev) => [...prev, course.id]);
      }

      setNotification("تم الاشتراك في الدورة المجانية بنجاح!");
      setTimeout(() => setNotification(""), 3000);
    } else {
      setNotification("تم توجيهك لصفحة الدفع (ميزة معطلة حالياً)");
      setTimeout(() => setNotification(""), 3000);
    }
  };

  useEffect(() => {
    // Read courses from backend API instead of localStorage
    fetchApi("/api/courses")
      .then(res => res.json())
      .then(data => {
        const formattedAddedCourses = data.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description || "بدون وصف",
          teacher: c.teacher || "أستاذ تجريبي",
          level: c.level === "bac" ? "ثانوي (BAC)" : "متوسط (BEM)",
          subject:
            c.subject === "math"
              ? "رياضيات"
              : c.subject === "physics"
                ? "فيزياء"
                : c.subject === "science"
                  ? "علوم"
                  : c.subject === "philosophy"
                    ? "فلسفة"
                    : c.subject || "مادة عامة",
          price: c.discount > 0 ? (c.price - c.discount) + " دج" : c.price + " دج",
          isFree: parseFloat(c.price) === 0,
        }));
        setCourses([...formattedAddedCourses, ...INITIAL_COURSES]);
      })
      .catch(err => {
        console.error("Failed to load courses from DB", err);
      });

    // Load subscribed courses
    const savedSubscribed = JSON.parse(
      localStorage.getItem("student_subscribed_courses") || "[]",
    );
    setSubscribedCourseIds(savedSubscribed.map((c: any) => c.id));
  }, []);

  const normalizeArabic = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[أإآا]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي");
  };

  const filteredCourses = courses.filter((course) => {
    const searchNormalized = normalizeArabic(searchQuery.toLowerCase());
    const titleNormalized = normalizeArabic(course.title?.toLowerCase() || "");
    const descNormalized = normalizeArabic(
      course.description?.toLowerCase() || "",
    );

    const matchSearch =
      !searchQuery ||
      titleNormalized.includes(searchNormalized) ||
      descNormalized.includes(searchNormalized);

    let matchLevel = true;
    if (selectedLevel === "bem") matchLevel = course.level?.includes("متوسط");
    else if (selectedLevel === "bac")
      matchLevel = course.level?.includes("ثانوي");

    let matchSubject = true;
    if (selectedSubject === "math")
      matchSubject = course.subject?.includes("رياضيات");
    else if (selectedSubject === "physics")
      matchSubject = course.subject?.includes("فيزياء");
    else if (selectedSubject === "science")
      matchSubject = course.subject?.includes("علوم");
    else if (selectedSubject === "philosophy")
      matchSubject = course.subject?.includes("فلسفة");

    return matchSearch && matchLevel && matchSubject;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedLevel("");
    setSelectedSubject("");
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 relative z-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">متصفح الدورات 📚</h1>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن دورة..."
            className="w-full bg-dark-800/50 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-white focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-400 transition-colors cursor-pointer appearance-none"
        >
          <option value="">كل المستويات</option>
          <option value="bem">متوسط (BEM)</option>
          <option value="bac">ثانوي (BAC)</option>
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="bg-dark-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-400 transition-colors cursor-pointer appearance-none"
        >
          <option value="">كل المواد</option>
          <option value="math">رياضيات</option>
          <option value="physics">فيزياء</option>
          <option value="science">علوم</option>
          <option value="philosophy">فلسفة</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            title="إعادة تعيين"
            onClick={resetFilters}
            className="btn-glass p-2.5 px-3"
          >
            <RotateCcw className="w-5 h-5 text-gray-300" /> إعادة تعيين
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div
              key={course.id}
              className="glass-card p-5 flex flex-col h-full group hover:bg-white/[0.02]"
            >
              <div
                className={`w-full h-24 rounded-t-xl mb-3 flex items-start justify-between p-3 ${course.bgClass || 'bg-gradient-to-br from-dark-800 to-dark-900 border-b border-white/5'}`}
              >
                <div className="flex gap-2 text-xs font-semibold">
                  <span className="bg-primary-500/80 text-white backdrop-blur-sm border border-primary-500/30 px-2 py-1 rounded-md shadow-sm">
                    {course.level === 'bac' ? 'ثانوي' : course.level === 'bem' ? 'متوسط' : course.level}
                  </span>
                  <span className="bg-accent-500/80 text-white backdrop-blur-sm border border-accent-500/30 px-2 py-1 rounded-md shadow-sm">
                    {course.subject}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 px-3">
                {course.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-3 px-3">
                {course.description || "بدون وصف"}
              </p>

              <div className="flex items-center gap-2 mb-4 p-2 bg-dark-800/40 rounded-lg border border-white/5 mx-3">
                {course.teacherImage ? (
                  <img src={course.teacherImage} alt={course.teacher} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {course.teacher?.[0] || 'أ'}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-300">
                  {course.teacher}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto px-3 pb-3">
                <div className="flex flex-col">
                  {course.isFree ? (
                    <span className="text-green-400 font-bold text-lg flex items-center gap-1">
                      🎉 مجانًا
                    </span>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-lg">
                          {course.price}
                        </span>
                        {course.discount && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold animate-pulse">
                            -{course.discount}
                          </span>
                        )}
                      </div>
                      {course.oldPrice && (
                        <span className="text-gray-500 text-sm line-through">
                          {course.oldPrice}
                        </span>
                      )}
                    </>
                  )}
                </div>
                {userRole === "admin" ? (
                  <Link
                    to={`/teacher/course/${course.id}/manage`}
                    className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 py-2 px-4 rounded-lg text-sm font-bold transition-colors"
                  >
                    إدارة محتوى الدورة
                  </Link>
                ) : subscribedCourseIds.includes(course.id) ? (
                  <button
                    disabled
                    className="bg-green-500/20 text-green-400 border border-green-500/30 py-2 px-4 rounded-lg text-sm font-bold cursor-not-allowed"
                  >
                    تم الاشتراك في هذه الدورة
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(course)}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    اشترك الآن
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-60">
            <FolderOpen className="w-20 h-20 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold">لا توجد نتائج مطابقة</h3>
            <p className="text-gray-500 mt-2">
              حاول تغيير خيارات البحث والتصفية المتطابقة.
            </p>
          </div>
        )}
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
