import axios from 'axios';

// البيانات التي استخرجناها
const NDUS = "ضع_كود_ndus_الذي_نسخته_يدوياً_هنا";
const JS_TOKEN = "DA19E059D54BAE99FB23DB9544624C09EDED6C941B18A3A80A8DBB9F5F3DF93FEB906A2FB285CF498E409E933124DD1F854BE5938AA7610892E4E6225BE0FF3C";

/**
 * دالة لإنشاء مجلد داخل تيرابوكس تلقائياً عبر وسيط الخادم لتفادي CORS
 */
async function createTeraBoxFolder(path: string) {
  try {
    const response = await axios.post("/api/terabox/setup", {
      path: path,
      jsToken: JS_TOKEN,
      ndus: NDUS
    });
    return response.data; // سيعيد بيانات المجلد ومنها الـ fs_id الخاص به
  } catch (error) {
    console.error(`فشل إنشاء المجلد ${path}:`, error);
    return null;
  }
}

/**
 * الدالة العملاقة: تنشئ شجرة الدورة كاملة بلمحة بصر
 */
export interface CourseConfig {
  level: 'BAC' | 'BEM'; // الطور التعليمي
  subject: string;      // المادة (مثلاً: رياضيات، فيزياء)
  courseName: string;   // اسم الدورة (مثلاً: الأعداد المركبة)
}

export async function setupNewCourseAutomated(config: CourseConfig) {
  const levelFolder = config.level === 'BAC' ? '/البكالوريا' : '/شهادة_التعليم_المتوسط';
  const baseCoursePath = `${levelFolder}/${config.subject}/${config.courseName}`;

  console.log(`جاري تجهيز مساحة التخزين للدورة: ${config.courseName}...`);

  // 1. إنشاء المجلدات الفرعية الثلاثة داخل مسار الدورة تلقائياً
  const foldersToCreate = [
    `${baseCoursePath}/الملفات والمراجع`,
    `${baseCoursePath}/الدروس المسجلة`,
    `${baseCoursePath}/التمارين والتطبيقات`
  ];

  const createdFoldersData: any[] = [];

  for (const path of foldersToCreate) {
    const result = await createTeraBoxFolder(path);
    if (result && result.errno === 0) {
      createdFoldersData.push({
        path: path,
        fs_id: result.fs_id // المعرف الفريد للمجلد داخل تيرابوكس
      });
    }
  }

  // 2. تعيد الدالة مخرجات تحتوي على مسارات المجلدات الجاهزة لاستقبال الرفع
  return {
    success: createdFoldersData.length === 3,
    coursePath: baseCoursePath,
    folders: createdFoldersData 
    // هذه البيانات تخزنها في قاعدة بيانات موقعك (MongoDB / MySQL) مع بيانات الدورة
  };
}
