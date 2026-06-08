import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { INITIAL_COURSES } from "./Browser";
import {
  Save,
  PlusCircle,
  Trash2,
  FileText,
  Video,
  Radio,
  Edit3,
  ArrowRight,
  Bot
} from "lucide-react";
import { cn } from "../lib/utils";

import { setupCourseFoldersInGDrive, uploadFileToGDrive } from "../lib/gdrive";

export function CourseManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const userRole = localStorage.getItem("userRole");

  // Content type for new addition
  const [contentType, setContentType] = useState("document");
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState(""); // For links/videos
  const [contentFile, setContentFile] = useState<File | null>(null);

  useEffect(() => {
    // Load from localStorage
    let savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );

    // Mix with initial courses to support exploring them
    const allCourses = [...savedCourses, ...INITIAL_COURSES];

    const found = allCourses.find(
      (c: any) => c.id?.toString() === id?.toString(),
    );
    if (found) {
      if (!found.content) {
        found.content = { documents: [], videos: [], live: [], exercises: [] };
      }
      setCourse(found);
    } else {
      alert("لم يتم العثور على الدورة");
      navigate(
        userRole === "admin" ? "/dashboard/admin" : "/dashboard/teacher",
      );
    }
  }, [id, navigate, userRole]);

  const saveCourseToStorage = (updatedCourse: any) => {
    const savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );
    const existingIndex = savedCourses.findIndex(
      (c: any) => c.id?.toString() === id?.toString(),
    );

    let updated;
    if (existingIndex >= 0) {
      updated = savedCourses.map((c: any) =>
        c.id?.toString() === id?.toString() ? updatedCourse : c,
      );
    } else {
      updated = [...savedCourses, updatedCourse];
    }

    localStorage.setItem("teacher_courses", JSON.stringify(updated));
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    saveCourseToStorage(course);
    alert("تم حفظ بيانات الدورة بنجاح!");
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle) return;

    setIsUploading(true);
    let finalUrl = contentUrl;
    let finalFileName = contentFile ? contentFile.name : null;

    if (contentFile) {
      try {
        const gdToken = localStorage.getItem("gdrive_access_token");
        if (gdToken && (contentType === "document" || contentType === "video" || contentType === "exercise")) {
           // Ensure folders exist
           let subjectName = course.subject || "منوعة";
           const gDriveFolders = await setupCourseFoldersInGDrive(gdToken, subjectName, course.title);
           if (gDriveFolders && gDriveFolders.subfolders[contentType as keyof typeof gDriveFolders.subfolders]) {
              const targetFolderId = gDriveFolders.subfolders[contentType as keyof typeof gDriveFolders.subfolders];
              const gdRes = await uploadFileToGDrive(gdToken, contentFile, targetFolderId);
              if (gdRes && gdRes.webViewLink) {
                 finalUrl = gdRes.webViewLink;
              } else {
                 throw new Error("Failed to upload to Google Drive");
              }
           } else {
              throw new Error("Failed to create Google Drive folders");
           }
        } else {
           // Fallback to local upload
           const formData = new FormData();
           formData.append("file", contentFile);
           formData.append("courseId", id || "");

           const res = await fetch("/api/upload", {
             method: "POST",
             body: formData,
           });
           const data = await res.json();
           if (data.url) {
             finalUrl = data.url;
           }
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("فشل رفع الملف، يرجى المحاولة مرة أخرى.");
        setIsUploading(false);
        return;
      }
    }

    const newItem = {
      id: Date.now().toString() + Math.random().toString(),
      title: contentTitle,
      type: contentType,
      url: finalUrl,
      fileName: finalFileName,
      date: new Date().toLocaleDateString("ar-DZ"),
    };

    const updatedCourse = {
      ...course,
      content: {
        ...course.content,
        documents:
          contentType === "document"
            ? [...course.content.documents, newItem]
            : course.content.documents,
        videos:
          contentType === "video"
            ? [...course.content.videos, newItem]
            : course.content.videos,
        live:
          contentType === "live"
            ? [...course.content.live, newItem]
            : course.content.live,
        exercises:
          contentType === "exercise"
            ? [...course.content.exercises, newItem]
            : course.content.exercises,
      },
    };

    setCourse(updatedCourse);
    saveCourseToStorage(updatedCourse);

    // Reset form
    setContentTitle("");
    setContentUrl("");
    setContentFile(null);
    setIsUploading(false);
  };

  const handleDeleteContent = (type: string, contentId: string) => {
    const updatedCourse = {
      ...course,
      content: {
        ...course.content,
        [type]: course.content[type].filter(
          (item: any) => item.id?.toString() !== contentId?.toString(),
        ),
      },
    };

    setCourse(updatedCourse);
    saveCourseToStorage(updatedCourse);
  };

  const handleDeleteCourse = () => {
    const savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );
    const updated = savedCourses.filter(
      (c: any) => c.id?.toString() !== id?.toString(),
    );
    localStorage.setItem("teacher_courses", JSON.stringify(updated));
    navigate(userRole === "admin" ? "/dashboard/admin" : "/dashboard/teacher");
  };

  const getSecureUrl = (url: string) => {
    if (!url || !url.startsWith("/api/files/")) return url;
    const tokenParams = {
      role: userRole || localStorage.getItem("userRole") || "teacher",
      courseId: id,
    };
    const token = btoa(JSON.stringify(tokenParams));
    return `${url}?token=${token}`;
  };

  if (!course) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={
              userRole === "admin" ? "/dashboard/admin" : "/dashboard/teacher"
            }
            className="btn-glass p-2 border border-white/10 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            <ArrowRight className="w-5 h-5 text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            إدارة محتوى الدورة
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const questions = JSON.parse(localStorage.getItem(`course_questions_${course.id}`) || "[]");
              if (questions.length === 0) {
                alert("لا توجد أسئلة من التلاميذ حتى الآن لهذه الدورة.");
                return;
              }
              const questionsText = questions.map((q: any, i: number) => `${i+1}. ${q.q}`).join("\n");
              try {
                alert("جاري تحليل الأسئلة واستخراج أهم النقاط بواسطة الذكاء الاصطناعي...");
                const res = await fetch("/api/ai/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messages: [{ role: "user", content: `تصفح الأسئلة التالية من التلاميذ حول درس '${course.subject}':\n\n${questionsText}\n\nما هي أكثر الأسئلة تكراراً؟ وما هي المفاهيم التي يبدو أن التلاميذ يجدون صعوبة في فهمها؟ اكتب تقريراً مختصراً للأستاذ.` }],
                    model: "Big Pickle",
                    systemPrompt: "أنت مساعد ذكي للأستاذ، تحلل أسئلة التلاميذ وتعطيه ملخصاً مفيداً."
                  })
                });
                const data = await res.json();
                alert("تقرير الذكاء الاصطناعي حول تفاعل التلاميذ:\n\n" + data.reply);
              } catch(e) {
                alert("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
              }
            }}
            className="bg-accent-500/20 hover:bg-accent-500/30 text-accent-400 border border-accent-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
          >
            <Bot className="w-4 h-4" /> تقرير بأسئلة التلاميذ
          </button>
          <button
            onClick={handleDeleteCourse}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            🔴 حذف الدورة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Details Form */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 border-t-2 border-t-accent-500">
            <h3 className="text-lg font-bold mb-4">تعديل بيانات الدورة</h3>
            <form onSubmit={handleSaveDetails} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  عنوان الدورة
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) =>
                    setCourse({ ...course, title: e.target.value })
                  }
                  className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  الوصف
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) =>
                    setCourse({ ...course, description: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    السعر (دج)
                  </label>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) =>
                      setCourse({ ...course, price: e.target.value })
                    }
                    className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-400 text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    الخصم (%)
                  </label>
                  <input
                    type="number"
                    value={course.discount}
                    onChange={(e) =>
                      setCourse({ ...course, discount: e.target.value })
                    }
                    className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-400 text-left"
                    dir="ltr"
                  />
                </div>
              </div>
              <button className="btn-glass bg-white/5 hover:bg-white/10 mt-2 py-2 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> حفظ التعديلات
              </button>
            </form>
          </div>

          <div className="glass-card p-6 border-t-2 border-t-primary-500">
            <h3 className="text-lg font-bold mb-4">إضافة محتوى جديد</h3>
            <form onSubmit={handleAddContent} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  نوع المحتوى
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-400"
                >
                  <option value="document">📄 ملف / مستند</option>
                  <option value="video">🎥 درس مسجل (فيديو)</option>
                  <option value="live">🔴 بث مباشر</option>
                  <option value="exercise">✏️ تمرين / تطبيق</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  العنوان
                </label>
                <input
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="عنوان المحتوى..."
                  className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-400"
                  required
                />
              </div>

              {(contentType === "document" || contentType === "exercise") && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    رفع ملف
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setContentFile(e.target.files?.[0] || null)
                    }
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30"
                  />
                </div>
              )}

              {(contentType === "video" || contentType === "live") && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    رابط (URL)
                  </label>
                  <input
                    type="url"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-dark-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-400 text-left"
                    dir="ltr"
                    required={(contentType === "video" || contentType === "live")}
                  />
                </div>
              )}

              <button
                disabled={isUploading}
                className="btn-primary mt-2 py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>جاري الإضافة...</>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" /> إضافة المحتوى
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Content Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ContentTable
            title="الملفات والمراجع"
            icon={<FileText className="w-5 h-5 text-blue-400" />}
            items={course.content?.documents || []}
            type="documents"
            onDelete={(id) => handleDeleteContent("documents", id)}
            getSecureUrl={getSecureUrl}
          />
          <ContentTable
            title="الدروس المسجلة"
            icon={<Video className="w-5 h-5 text-accent-400" />}
            items={course.content?.videos || []}
            type="videos"
            onDelete={(id) => handleDeleteContent("videos", id)}
            getSecureUrl={getSecureUrl}
          />
          <ContentTable
            title="البث المباشر"
            icon={<Radio className="w-5 h-5 text-green-400" />}
            items={course.content?.live || []}
            type="live"
            onDelete={(id) => handleDeleteContent("live", id)}
            getSecureUrl={getSecureUrl}
          />
          <ContentTable
            title="التمارين والتطبيقات"
            icon={<Edit3 className="w-5 h-5 text-purple-400" />}
            items={course.content?.exercises || []}
            type="exercises"
            onDelete={(id) => handleDeleteContent("exercises", id)}
            getSecureUrl={getSecureUrl}
          />
        </div>
      </div>
    </div>
  );
}

function ContentTable({
  title,
  icon,
  items,
  type,
  onDelete,
  getSecureUrl,
}: {
  title: string;
  icon: any;
  items: any[];
  type: string;
  onDelete: (id: string) => void;
  getSecureUrl: (url: string) => string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="glass-card p-0 overflow-hidden">
      <div className="bg-dark-800/40 px-5 py-3 border-b border-white/5 flex items-center gap-2 font-bold">
        {icon} {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-white/5 text-gray-500">
              <th className="py-2 px-4 font-medium w-12 text-center">#</th>
              <th className="py-2 px-4 font-medium">العنوان</th>
              <th className="py-2 px-4 font-medium text-center">
                تاريخ الإضافة
              </th>
              <th className="py-2 px-4 font-medium text-center w-16">حذف</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 text-center text-gray-500">
                  {idx + 1}
                </td>
                <td className="py-3 px-4 font-medium text-gray-200">
                  <div className="flex items-center gap-2">
                    <span>{item.title}</span>
                    {item.url && (
                      <a
                        href={getSecureUrl(item.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-2 py-1 rounded transition-colors whitespace-nowrap"
                      >
                        الوصول
                      </a>
                    )}
                  </div>
                  {item.fileName && (
                    <div
                      className="text-xs text-gray-500 font-mono mt-1 flex items-center justify-end"
                      dir="ltr"
                    >
                      {item.fileName}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-center text-gray-400 font-mono text-xs">
                  {item.date}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1 bg-red-400/0 hover:bg-red-400/10 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
