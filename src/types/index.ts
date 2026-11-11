export type Country = 'Узбекистан' | 'Казахстан' | 'Кыргызстан' | 'Таджикистан' | 'Туркменистан';

export type Epoch =
  | 'Нижний палеолит'
  | 'Средний палеолит'
  | 'Верхний палеолит'
  | 'Мезолит'
  | 'Неолит'
  | 'Энеолит'
  | 'Бронзовый век'
  | 'Ранний железный век';

export type SiteType =
  | 'Пещера'
  | 'Грот / Навес'
  | 'Открытая стоянка'
  | 'Поселение / Городище'
  | 'Могильник / Некрополь'
  | 'Наскальные рисунки (петроглифы)'
  | 'Кремнёвая мастерская / Карьер';

export type Activity =
  | 'Охота'
  | 'Собирательство'
  | 'Рыболовство'
  | 'Скотоводство'
  | 'Земледелие'
  | 'Кремнёвая индустрия'
  | 'Керамика'
  | 'Металлургия'
  | 'Погребальные практики'
  | 'Культ и наскальное искусство'
  | 'Обмен и торговля';

export type VerificationStatus = 'Подтверждено' | 'Требует проверки';

export interface Site {
  id: string;
  name: string;
  altNames: string[];
  country: Country;
  region: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  epoch: Epoch;
  culture: string;
  dating: {
    fromYearsBP: number; // Years Before Present (positive number, e.g. 70000)
    toYearsBP: number;   // e.g. 40000
    displayLabel: string; // e.g. "ок. 70 000 — 40 000 лет назад"
    approximate: boolean;
  };
  siteType: SiteType;
  activities: Activity[];
  keyFindings: string;
  researchHistory: string;
  scientificSignificance: string;
  sources: string[];
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  isCustom?: boolean;
}

export interface UserNote {
  siteId: string;
  content: string;
  updatedAt: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  siteIdHint?: string;
}

export interface GlossaryTerm {
  term: string;
  category: 'Эпоха' | 'Индустрия / Технология' | 'Культура' | 'Термин';
  definition: string;
  exampleSiteId?: string;
}

export type Language = 'ru' | 'uz' | 'en';
