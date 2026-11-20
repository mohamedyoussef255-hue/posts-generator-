export type ThemeMode = 'dark' | 'light';

export type CardStyle = 'balanced' | 'elevated' | 'subtle' | 'custom';

export type RadiusStyle = 'sharp' | 'medium' | 'rounded';

export type Dialect =
  | 'عامية مصرية'
  | 'العربية الفصحى المبسطة'
  | 'لهجة دارجة / شعبية'
  | 'رسمية احترافية';

export type PostCategory =
  // المجتمعات السكنية والكمبوندات
  | 'المجتمعات السكنية والكمبوندات'
  | 'إدارة الكمبوندات واتحاد الشاغلين'
  | 'فعاليات وأنشطة الجيران والسكان'
  | 'خدمات ومرافق وصيانة الكمبوند'
  | 'البيئة والاستدامة والمساحات الخضراء'
  // النشاط الاجتماعي والأسرة والحياة اليومية
  | 'النشاط الاجتماعي والتطوعي'
  | 'الفعاليات المحلية والنشاطات التطوعية'
  | 'العمل الخيري والمبادرات المجتمعية'
  | 'العلاقات الأسرية والاجتماعية'
  | 'الأسرة والتربية والأطفال'
  | 'التربية الإيجابية وشؤون الأبناء'
  | 'العلاقات الاجتماعية والحياة اليومية'
  | 'شؤون المرأة والمنزل والديكور'
  | 'الشباب والأنشطة الطلابية'
  | 'الصحة النفسية وتوازن الحياة'
  | 'القصص الملهمة وتجارب الناس'
  // الاهتمامات العامة والثقافة والترفيه
  | 'الصحة واللياقة والتغذية'
  | 'الرياضة والأنشطة البدنية'
  | 'السفر والرحلات والسياحة'
  | 'الثقافة والقراءة والفنون'
  | 'الطبخ والمطاعم والأكل البيتي'
  | 'الموضة والأناقة والجمال'
  | 'السيارات والهوايات والمقتنيات'
  | 'رعاية الحيوانات الأليفة'
  | 'المناسبات والأعياد والتهاني'
  | 'القيم الأخلاقية والتوعية المجتمعية'
  | 'الاستهلاك الذكي وتنظيم ميزانية الأسرة'
  // التنمية الذاتية والتعليم والأعمال
  | 'التنمية الذاتية وتطوير المهارات'
  | 'إدارة الوقت وتنظيم الحياة اليومية'
  | 'عام'
  | 'تعليم وتدريب'
  | 'تطوير ذات'
  | 'تسويق ومبيعات'
  | 'تقنية وأعمال'
  | 'عقارات'
  | 'مطاعم وخدمات'
  | 'صحة ولياقة';

export type CreativeAngle =
  | 'متنوع شامل'
  | 'تفاعلي ونقاش مجتمعي'
  | 'إعلان فعالية أو مبادرة'
  | 'توعوي وإرشادي'
  | 'قصصي وتجارب'
  | 'تحفيزي وتحدي'
  | 'تعليمي ونصائح'
  | 'حل مشكلة'
  | 'عرض وميزة تنافسية';

export type AgeGroup = 'الكل' | '18-25' | '25-40' | '40+';

export interface ExternalAiConfig {
  enabled: boolean;
  endpointUrl: string;
  modelName: string;
  apiToken: string;
  creativity: number;
}

export interface AdminSettings {
  theme: ThemeMode;
  accentColor: string;
  cardStyle: CardStyle;
  customCardBgLight: string;
  customCardBgDark: string;
  radiusStyle: RadiusStyle;

  defaultBatchSize: number;
  minLinesPerPost: number;
  defaultDialect: Dialect;
  defaultCategory: PostCategory;
  defaultAngle: CreativeAngle;

  whatsappCountryCode: string;
  defaultWhatsappNumber: string;
  autoCopyBeforeShare: boolean;
  enableWebShareApi: boolean;

  externalAi: ExternalAiConfig;
}

export interface GeneratedPost {
  id: number;
  text: string;
  dialect: Dialect;
  category: PostCategory;
  angleLabel: string;
  image: string | null;
  phoneNumber: string;
  isEditing: boolean;
  status: string;
}

export interface ScheduledPost {
  id: number;
  topic: string;
  content: string;
  imageStatus: string;
  dialect: string;
  category: string;
  time: string;
  status: 'مجدول' | 'تم النشر';
}

export interface BackupPayload {
  version: number;
  exportedAt: string;
  settings: AdminSettings;
  passcode?: string;
  scheduledQueue: ScheduledPost[];
  generatedPosts: GeneratedPost[];
}
