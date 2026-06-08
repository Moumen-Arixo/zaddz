import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Target, Zap, Send, Bot, BrainCircuit, LineChart } from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-24 relative z-10">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center mt-12 gap-6 min-h-[40vh]">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-gradient leading-tight"
        >
          أدرس بذكاء وتفوق<br />في امتحاناتك المصيرية
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl"
        >
          منصة Zad DZ التعليمية، رفيقك الأمثل للتحضير لشهادتي التعليم المتوسط BEM والبكالوريا BAC مع نخبة من أساتذة الجزائر.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-4"
        >
          <Link to="/register/student" className="btn-primary text-lg">
            سجل الآن كتلميذ 🎓
          </Link>
          <Link to="/register/teacher" className="btn-accent text-lg">
            انضم كأستاذ 👨‍🏫
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<BookOpen className="w-8 h-8 text-primary-400" />}
          title="محتوى منظم"
          description="دورات ودروس مرتبة بعناية لتسهيل المراجعة والفهم."
        />
        <FeatureCard 
          icon={<Target className="w-8 h-8 text-accent-400" />}
          title="أساتذة موثوقون"
          description="نظام تصويت ديمقراطي يضمن لك أفضل الأطر التعليمية."
        />
        <FeatureCard 
          icon={<Zap className="w-8 h-8 text-teal-400" />}
          title="أدوات ذكية"
          description="مؤقت بومودورو، إدارة مجلدات، وإحصائيات تفصيلية لنشاطك."
        />
      </section>

      {/* Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-r-4 border-r-primary-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
           <h3 className="text-2xl font-bold mb-3">للـتـلاميـذ</h3>
           <p className="text-gray-400 mb-6">ابحث عن دوراتك، نظم وقتك، وتفوق في دراستك بأسعار مدروسة ودفع آمن عبر بريد الجزائر.</p>
           <Link to="/browser" className="text-primary-400 hover:text-primary-300 font-bold flex items-center gap-2">
             تصفح الدورات المتاحة <Zap className="w-4 h-4" />
           </Link>
        </div>
        <div className="glass-card p-8 border-r-4 border-r-accent-500 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
           <h3 className="text-2xl font-bold mb-3">للأســاتـــذة</h3>
           <p className="text-gray-400 mb-6">شارك علمك، ارفع دوراتك، وقم بإدارة تلاميذك ومدخولك الشهري بكل احترافية وشفافية.</p>
           <Link to="/register/teacher" className="text-accent-400 hover:text-accent-300 font-bold flex items-center gap-2">
             ابدأ التدريس الآن <Target className="w-4 h-4" />
           </Link>
        </div>
      </section>

      {/* AI Section with Cards */}
      <section className="flex flex-col items-center max-w-5xl mx-auto w-full mb-12 text-center mt-12">
        <div className="w-20 h-20 bg-gradient-to-tr from-accent-600 to-accent-400 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-10">الذكاء الاصطناعي مدمج بالكامل</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard 
            icon={<Bot className="w-8 h-8 text-primary-400" />}
            title="للتلاميذ"
            description="إجابات فورية على أسئلتك في أي مادة، ومساعدة في فهم النقاط المعقدة في الدروس."
          />
          <FeatureCard 
            icon={<BrainCircuit className="w-8 h-8 text-accent-400" />}
            title="للأساتذة"
            description="تقارير ذكية عن الأسئلة المتكررة من التلاميذ، ومساعدة في صياغة وصف احترافي للدورات."
          />
          <FeatureCard 
            icon={<LineChart className="w-8 h-8 text-teal-400" />}
            title="للإدارة"
            description="تحليل بيانات وأداء المنصة، وتوليد تقارير شاملة عن نشاط المستخدمين لضمان جودة التعليم."
          />
        </div>
      </section>


    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
