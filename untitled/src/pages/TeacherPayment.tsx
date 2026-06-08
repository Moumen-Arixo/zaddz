import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  ArrowRight,
  AlertCircle,
  Upload,
  CheckCircle,
} from "lucide-react";

export function TeacherPayment() {
  const [adminCcp, setAdminCcp] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [adminName, setAdminName] = useState("");
  const [amountDue, setAmountDue] = useState(0);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);

  useEffect(() => {
    // Load admin payment info
    setAdminCcp(localStorage.getItem("admin_ccp_account") || "غير محدد بعد");
    setAdminKey(localStorage.getItem("admin_ccp_key") || "-");
    setAdminName(localStorage.getItem("admin_ccp_name") || "الإدارة العامة");

    // Calculate profit -> 40% goes to admin
    const savedCourses = JSON.parse(
      localStorage.getItem("teacher_courses") || "[]",
    );
    let totalRevenue = 0;

    savedCourses.forEach((course: any) => {
      const price = parseFloat(course.price) || 0;
      const studentsCount = parseInt(course.students) || 0;
      totalRevenue += price * studentsCount;
    });

    const adminShare = totalRevenue * 0.4;
    // Round to nearest tens (make last digit 0: e.g., 2434 -> 2430)
    const roundedShare = Math.round(adminShare / 10) * 10;

    setAmountDue(roundedShare);
  }, []);

  const handleUploadReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptImage) return alert("يرجى إرفاق صورة الوصل أولاً.");
    alert("تم إرسال وصل الدفع للإدارة بنجاح. سيتم مراجعته قريباً.");
    setReceiptImage(null);
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6 relative z-10">
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/dashboard/teacher"
          className="btn-glass p-2 border border-white/10 flex items-center justify-center rounded-full hover:bg-white/10"
        >
          <ArrowRight className="w-5 h-5 text-gray-300" />
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          الدفع الشهري للإدارة
        </h1>
      </div>

      <div className="glass-card p-6 border-t-4 border-t-red-500">
        <div className="flex items-start gap-4 flex-col sm:flex-row">
          <div className="bg-red-500/20 p-3 rounded-full shrink-0">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white mb-2">
              مستحقات المنصة
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              حسب سياسة المنصة، يتم خصم نسبة 40% من الدخل الإجمالي لاشتراكات
              التلاميذ في دوراتكم لصالح الإدارة. يرجى تحويل المبلغ الموضح أدناه
              إلى الحساب البريدي للإدارة في أقرب وقت لتفادي تعليق الحساب.
            </p>

            <div className="bg-dark-800/50 border border-red-500/20 rounded-xl p-4 flex flex-col items-center justify-center mb-6">
              <span className="text-gray-400 text-sm mb-1">
                المبلغ المطالب به هذا الشهر:
              </span>
              <span className="text-3xl font-black text-red-400 font-mono tracking-tight">
                {amountDue} دج
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-dark-800/40 p-4 border border-white/5 rounded-xl">
                <span className="text-xs text-gray-500 block mb-1">
                  حساب الـ CCP
                </span>
                <strong className="text-lg font-mono text-white block">
                  {adminCcp}{" "}
                  <span className="text-gray-500 text-sm mx-1">Clé</span>{" "}
                  {adminKey}
                </strong>
              </div>
              <div className="bg-dark-800/40 p-4 border border-white/5 rounded-xl">
                <span className="text-xs text-gray-500 block mb-1">
                  الاسم واللقب (المالك)
                </span>
                <strong className="text-lg text-white block">
                  {adminName}
                </strong>
              </div>
            </div>

            <form
              onSubmit={handleUploadReceipt}
              className="bg-dark-800/30 p-5 rounded-xl border border-white/10 border-dashed text-center"
            >
              <h3 className="text-sm font-bold text-white mb-3 flex justify-center items-center gap-2">
                <Upload className="w-4 h-4 text-gray-400" /> إرفاق وصل الدفع
                (اختياري للإثبات)
              </h3>
              <label className="mb-4 block cursor-pointer w-full max-w-sm mx-auto p-4 bg-dark-900/60 rounded-xl border border-white/5 hover:border-red-500/30 hover:bg-white/5 transition-all outline-none">
                <div className="text-sm text-gray-400 flex flex-col items-center">
                  {receiptImage ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                      <span className="text-white font-medium">
                        {receiptImage.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-8 h-8 text-gray-600 mb-2" />
                      <span className="font-semibold mb-1">
                        انقر لاختيار صورة الوصل
                      </span>
                      <span className="text-xs">JPG, PNG</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setReceiptImage(e.target.files ? e.target.files[0] : null)
                  }
                />
              </label>
              <button
                type="submit"
                disabled={!receiptImage || amountDue === 0}
                className="btn-primary w-full max-w-xs mx-auto py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال للمراجعة
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
