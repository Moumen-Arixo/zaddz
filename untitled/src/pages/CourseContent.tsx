import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Video,
  Radio,
  Edit3,
  Download,
  Play,
  ExternalLink,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  X,
  Bot
} from "lucide-react";

// No Mock Data

export function CourseContent() {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [playingVideoTitle, setPlayingVideoTitle] = useState<string>("");
  const [openSections, setOpenSections] = useState({
    documents: true,
    videos: true,
    live: true,
    exercises: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");

    const savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );
    const found = savedCourses.find((c: any) => c.id === id);
    if (found) {
      if (!found.content) {
        found.content = { documents: [], videos: [], live: [], exercises: [] };
      }

      // Check access ownership
      if (userRole !== "admin" && userRole !== "teacher") {
        const studentSubscribed = JSON.parse(localStorage.getItem("student_subscribed_courses") || "[]");
        const isSubscribed = studentSubscribed.some((sub: any) => sub.id === id);
        
        // Mock fallback for demo mock courses
        if (!isSubscribed && id !== "mock1" && id !== "mock2") {
          alert("عذراً، يجب عليك الاشتراك في هذه الدورة للوصول إلى محتوياتها.");
          window.location.href = `/course/details/${id}`; // redirect to details
          return;
        }
      }

      setCourse(found);
    }
  }, [id]);

  const getSecureUrl = (url: string) => {
    if (!url || !url.startsWith("/api/files/")) return url;

    // Create a mock token
    const tokenParams = {
      role: localStorage.getItem("userRole") || "student",
      courseId: id,
    };

    const token = btoa(JSON.stringify(tokenParams));
    return `${url}?token=${token}`;
  };

  const handlePlayVideo = (videoInfo: any) => {
    setPlayingVideo(
      getSecureUrl(videoInfo.url) ||
        "https://www.w3schools.com/html/mov_bbb.mp4",
    );
    setPlayingVideoTitle(videoInfo.title || "الدرس");
  };

  if (!course) {
    return <div className="text-center py-20">جاري التحميل...</div>;
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8 relative z-10">
      {/* Header */}
      <div className="glass-card p-6 border-t-4 border-t-primary-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-bl-full -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-3">
              <span className="bg-primary-500/20 text-primary-300 text-xs border border-primary-500/30 px-2 py-1 rounded-md">
                {course.level === 'bac' ? 'ثانوي' : course.level === 'bem' ? 'متوسط' : course.level}
              </span>
              <span className="bg-accent-500/20 text-accent-300 text-xs border border-accent-500/30 px-2 py-1 rounded-md">
                {course.subject}
              </span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              {course.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1.5">
                {course.teacherImage ? (
                  <img src={course.teacherImage} alt={course.teacher} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex justify-center items-center text-[10px] font-bold">
                    {course.teacher?.[0] || "أ"}
                  </div>
                )}
                {course.teacher || "أستاذ"}
              </div>
              <span className="text-gray-500">•</span>
              <span>
                تاريخ النشر: {course.date || "جديد"}
              </span>
            </div>
          </div>
          <Link to="/dashboard/student" className="btn-glass text-sm">
            العودة للوحة القيادة
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        
        {/* Documents */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("documents")}
            className="w-full text-xl font-bold p-4 flex items-center justify-between text-blue-400 hover:bg-white/5 transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" /> الملفات والمراجع
            </div>
            {openSections.documents ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSections.documents && (
            <div className="p-4 border-t border-white/5">
              {course.content.documents.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا توجد ملفات حالياً
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.content.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="bg-dark-800/50 p-4 rounded-xl flex items-center justify-between group hover:border-blue-400/50 hover:shadow-[0_0_15px_rgba(96,165,250,0.15)] transition-all border border-white/5"
                    >
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-500/10 text-blue-400 flex justify-center items-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors truncate">
                            {doc.title}
                          </h3>
                          <div className="flex gap-2 text-xs text-gray-500 mt-1 font-mono truncate">
                            <span>{doc.date}</span>{" "}
                            {doc.size && (
                              <>
                                • <span>{doc.size}</span>
                              </>
                            )}
                            {doc.fileName && (
                              <>
                                • <span>{doc.fileName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <a
                          href={
                            getSecureUrl(doc.url) ||
                            "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 ml-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" /> تحميل
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Videos */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("videos")}
            className="w-full text-xl font-bold p-4 flex items-center justify-between text-accent-400 hover:bg-white/5 transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6" /> الدروس المسجلة
            </div>
            {openSections.videos ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSections.videos && (
            <div className="p-4 border-t border-white/5">
              {course.content.videos.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا توجد دروس מסجلة حالياً
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.content.videos.map((video: any) => (
                    <div
                      key={video.id}
                      className="bg-dark-800/50 p-4 rounded-xl flex items-center justify-between group hover:border-accent-400/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all bg-gradient-to-l hover:from-white/[0.02] hover:to-transparent border border-white/5"
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-lg bg-dark-800 border border-white/10 overflow-hidden shrink-0 group-hover:border-accent-400/50 transition-colors">
                          <div className="absolute inset-0 bg-accent-500/10 flex justify-center items-center">
                            <Play
                              className="w-6 h-6 text-accent-400 opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all drop-shadow-md"
                              fill="currentColor"
                            />
                          </div>
                          {video.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded font-mono">
                              {video.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-sm text-white group-hover:text-accent-300 transition-colors truncate">
                            {video.title}
                          </h3>
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            {video.date}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePlayVideo(video)}
                          className="shrink-0 bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30 px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-[0_0_10px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                          <Play className="w-4 h-4" /> مشاهدة الدرس
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Live Streams */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("live")}
            className="w-full text-xl font-bold p-4 flex items-center justify-between text-green-400 hover:bg-white/5 transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-6 h-6" /> البث المباشر
            </div>
            {openSections.live ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSections.live && (
            <div className="p-4 border-t border-white/5">
              {course.content.live.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا يوجد بث مباشر حالياً
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.content.live.map((stream: any) => (
                    <div
                      key={stream.id}
                      className="bg-dark-800/50 p-4 rounded-xl flex items-center justify-between group hover:border-green-400/50 hover:shadow-[0_0_15px_rgba(74,222,128,0.15)] transition-all border border-green-500/20"
                    >
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-green-500/10 text-green-400 flex justify-center items-center relative">
                          {stream.status === "upcoming" ? (
                            <Radio className="w-5 h-5" />
                          ) : (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-green-400 opacity-30"></span>
                              <Radio className="w-5 h-5 relative" />
                            </>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-sm text-white truncate">
                            {stream.title}
                          </h3>
                          <div className="flex gap-2 text-xs font-mono mt-1 text-green-400/70 truncate">
                            <span>{stream.date}</span>{" "}
                            {stream.time && (
                              <>
                                • <span>{stream.time}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <a
                          href={
                            stream.url ||
                            `https://meet.jit.si/ClassroomZadDZ_${course.id}_${stream.id || 'room'}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 ml-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-5 py-2 rounded-lg text-sm font-bold transition-all animate-pulse hover:animate-none flex items-center gap-2"
                        >
                          <LinkIcon className="w-4 h-4" /> فتح القاعة
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Exercises */}
        <section className="glass-card overflow-hidden">
          <button
            onClick={() => toggleSection("exercises")}
            className="w-full text-xl font-bold p-4 flex items-center justify-between text-purple-400 hover:bg-white/5 transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="w-6 h-6" /> التمارين والتطبيقات
            </div>
            {openSections.exercises ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {openSections.exercises && (
            <div className="p-4 border-t border-white/5">
              {course.content.exercises.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  لا توجد تمارين حالياً
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.content.exercises.map((ex: any) => (
                    <div
                      key={ex.id}
                      className="bg-dark-800/50 p-4 rounded-xl flex items-center justify-between group hover:border-purple-400/50 hover:shadow-[0_0_15px_rgba(192,132,252,0.15)] transition-all border border-white/5"
                    >
                      <div className="flex items-center gap-3 w-full pr-2">
                        <div className="w-10 h-10 shrink-0 rounded-lg bg-purple-500/10 text-purple-400 flex justify-center items-center">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">
                            {ex.title}
                          </h3>
                          <span className="text-xs text-gray-500 mt-1 inline-block">
                            {ex.date}
                          </span>
                        </div>
                        <a
                          href={getSecureUrl(ex.url) || "#"}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 ml-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 py-2 px-4 rounded-lg text-sm font-bold transition-colors flex justify-center items-center gap-2"
                        >
                          تحميل الملف <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-5xl bg-dark-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-dark-800">
              <h3 className="font-bold text-lg text-white">
                {playingVideoTitle}
              </h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="w-full aspect-video bg-black flex justify-center items-center">
              <video
                src={playingVideo}
                controls
                autoPlay
                className="w-full h-full max-h-[75vh] outline-none"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              >
                المتصفح الخاص بك لا يدعم تشغيل الفيديو.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
