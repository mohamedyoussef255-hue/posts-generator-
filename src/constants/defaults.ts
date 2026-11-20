import {
  AdminSettings,
  AgeGroup,
  CreativeAngle,
  Dialect,
  PostCategory,
} from '../types/platform';

export const STORAGE_KEYS = {
  QUEUE: 'fb_posts_platform_queue',
  GENERATED: 'fb_posts_platform_generated',
  SETTINGS: 'fb_posts_platform_admin_settings',
  PASSCODE: 'fb_posts_platform_admin_passcode',
} as const;

export const DEFAULT_PASSCODE = '2026';

export const DEFAULT_SETTINGS: AdminSettings = {
  theme: 'dark',
  accentColor: '#059669',
  cardStyle: 'balanced',
  customCardBgLight: '#ffffff',
  customCardBgDark: '#111827',
  radiusStyle: 'medium',

  defaultBatchSize: 10,
  minLinesPerPost: 5,
  defaultDialect: 'عامية مصرية',
  defaultCategory: 'عام',
  defaultAngle: 'متنوع شامل',

  whatsappCountryCode: '+20',
  defaultWhatsappNumber: '',
  autoCopyBeforeShare: true,
  enableWebShareApi: true,

  externalAi: {
    enabled: false,
    endpointUrl: '',
    modelName: '',
    apiToken: '',
    creativity: 0.7,
  },
};

export interface AccentPreset {
  name: string;
  hex: string;
  hover: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { name: 'زمردي', hex: '#059669', hover: '#047857' },
  { name: 'أزرق فيسبوك', hex: '#2563EB', hover: '#1D4ED8' },
  { name: 'فيروزي', hex: '#0D9488', hover: '#0F766E' },
  { name: 'نيلي عميق', hex: '#4F46E5', hover: '#4338CA' },
  { name: 'كهرماني', hex: '#D97706', hover: '#B45309' },
  { name: 'قرمزي', hex: '#E11D48', hover: '#BE123C' },
];

export const DIALECT_OPTIONS: { value: Dialect; label: string }[] = [
  { value: 'عامية مصرية', label: 'عامية مصرية ودية' },
  { value: 'العربية الفصحى المبسطة', label: 'عربية فصحى مبسطة' },
  { value: 'لهجة دارجة / شعبية', label: 'لهجة دارجة / شعبية حماسية' },
  { value: 'رسمية احترافية', label: 'رسمية احترافية (Corporate)' },
];

export interface CategoryGroup {
  label: string;
  domain: 'residential' | 'social' | 'lifestyle' | 'business';
  items: PostCategory[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'المجتمعات السكنية والكمبوندات',
    domain: 'residential',
    items: [
      'المجتمعات السكنية والكمبوندات',
      'إدارة الكمبوندات واتحاد الشاغلين',
      'فعاليات وأنشطة الجيران والسكان',
      'خدمات ومرافق وصيانة الكمبوند',
      'البيئة والاستدامة والمساحات الخضراء',
    ],
  },
  {
    label: 'النشاط الاجتماعي والأسرة والحياة اليومية',
    domain: 'social',
    items: [
      'الفعاليات المحلية والنشاطات التطوعية',
      'النشاط الاجتماعي والتطوعي',
      'العمل الخيري والمبادرات المجتمعية',
      'العلاقات الأسرية والاجتماعية',
      'الأسرة والتربية والأطفال',
      'التربية الإيجابية وشؤون الأبناء',
      'العلاقات الاجتماعية والحياة اليومية',
      'شؤون المرأة والمنزل والديكور',
      'الشباب والأنشطة الطلابية',
      'الصحة النفسية وتوازن الحياة',
      'القصص الملهمة وتجارب الناس',
    ],
  },
  {
    label: 'الاهتمامات العامة والثقافة والترفيه',
    domain: 'lifestyle',
    items: [
      'الصحة واللياقة والتغذية',
      'الرياضة والأنشطة البدنية',
      'السفر والرحلات والسياحة',
      'الثقافة والقراءة والفنون',
      'الطبخ والمطاعم والأكل البيتي',
      'الموضة والأناقة والجمال',
      'السيارات والهوايات والمقتنيات',
      'رعاية الحيوانات الأليفة',
      'المناسبات والأعياد والتهاني',
      'القيم الأخلاقية والتوعية المجتمعية',
      'الاستهلاك الذكي وتنظيم ميزانية الأسرة',
    ],
  },
  {
    label: 'التنمية الذاتية والتعليم والأعمال',
    domain: 'business',
    items: [
      'التنمية الذاتية وتطوير المهارات',
      'إدارة الوقت وتنظيم الحياة اليومية',
      'عام',
      'تعليم وتدريب',
      'تطوير ذات',
      'تسويق ومبيعات',
      'تقنية وأعمال',
      'عقارات',
    ],
  },
];

export const CATEGORY_OPTIONS: PostCategory[] = CATEGORY_GROUPS.flatMap(
  (group) => group.items
);

export const ANGLE_OPTIONS: CreativeAngle[] = [
  'متنوع شامل',
  'تفاعلي ونقاش مجتمعي',
  'إعلان فعالية أو مبادرة',
  'توعوي وإرشادي',
  'قصصي وتجارب',
  'تحفيزي وتحدي',
  'تعليمي ونصائح',
  'حل مشكلة',
  'عرض وميزة تنافسية',
];

export const AUDIENCE_SUGGESTIONS: string[] = [
  'سكان وملاك الكمبوند',
  'الجيران وأعضاء المجتمع السكني',
  'الأسر والعائلات وأولياء الأمور',
  'الشباب والطلبة',
  'المهتمون بالعمل التطوعي والاجتماعي',
  'ربات البيوت والمهتمات بشؤون المنزل',
  'محبو الرياضة والصحة واللياقة',
  'محبو السفر والرحلات والثقافة',
  'عامة الناس ومختلف فئات المجتمع',
  'أصحاب المشاريع ورواد الأعمال',
];

export const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'الكل', label: 'جميع الفئات العمرية' },
  { value: '18-25', label: '18 - 25 سنة' },
  { value: '25-40', label: '25 - 40 سنة' },
  { value: '40+', label: '40+ سنة' },
];

export const COUNTRY_CODE_PRESETS = [
  { code: '+20', label: 'مصر (+20)' },
  { code: '+966', label: 'السعودية (+966)' },
  { code: '+971', label: 'الإمارات (+971)' },
  { code: '+965', label: 'الكويت (+965)' },
  { code: '+974', label: 'قطر (+974)' },
  { code: '+962', label: 'الأردن (+962)' },
  { code: '+212', label: 'المغرب (+212)' },
  { code: '+964', label: 'العراق (+964)' },
];
