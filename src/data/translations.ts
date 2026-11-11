import { Language } from '../types';

export const TRANSLATIONS: Record<Language, {
  appTitle: string;
  appSubtitle: string;
  tabTerritory: string;
  tabTimeline: string;
  tabActivity: string;
  searchPlaceholder: string;
  btnQuiz: string;
  btnGlossary: string;
  btnAddSite: string;
  btnAbout: string;
  btnExport: string;
  btnPrint: string;
  foundCount: string;
  filters: string;
  reset: string;
  allCountries: string;
  allEpochs: string;
  allTypes: string;
  allActivities: string;
  reliabilityConfirmed: string;
  reliabilityCheck: string;
  notesTitle: string;
  favoritesOnly: string;
}> = {
  ru: {
    appTitle: 'Стоянки Средней Азии и Узбекистана: интерактивные схемы',
    appSubtitle: 'Интерактивный научный атлас древнейшей истории региона',
    tabTerritory: 'По территориям и SVG-карта',
    tabTimeline: 'По времени (шкала)',
    tabActivity: 'По деятельности (матрица)',
    searchPlaceholder: 'Умный поиск: памятник, опечатки («Тешик Таш» = «Teshik»), термин («неандерталец», «земледелие»)...',
    btnQuiz: 'Викторина',
    btnGlossary: 'Глоссарий',
    btnAddSite: '+ Добавить стоянку',
    btnAbout: 'О проекте и экспорт',
    btnExport: 'Экспорт',
    btnPrint: 'Печать',
    foundCount: 'Найдено',
    filters: 'Фильтры',
    reset: 'Сбросить',
    allCountries: 'Все страны',
    allEpochs: 'Все эпохи',
    allTypes: 'Все типы',
    allActivities: 'Все виды деятельности',
    reliabilityConfirmed: 'Подтверждено',
    reliabilityCheck: 'Требует проверки',
    notesTitle: 'Моя заметка',
    favoritesOnly: 'Только избранные',
  },
  uz: {
    appTitle: 'O\'rta Osiyo va O\'zbekiston qadimgi manzilgohlari',
    appSubtitle: 'Mintaqaning eng qadimgi tarixiga oid interaktiv ilmiy atlas',
    tabTerritory: 'Hududlar va SVG xarita',
    tabTimeline: 'Vaqt shkalasi bo\'yicha',
    tabActivity: 'Faoliyat turlari (matritsa)',
    searchPlaceholder: 'Aqlli qidiruv: manzilgoh nomi, atama («neandertal», «dehqonchilik», «petrogliflar»)...',
    btnQuiz: 'Viktorina',
    btnGlossary: 'Lug\'at',
    btnAddSite: '+ Manzilgoh qo\'shish',
    btnAbout: 'Loyiha haqida',
    btnExport: 'Eksport',
    btnPrint: 'Chop etish',
    foundCount: 'Topildi',
    filters: 'Filtrlar',
    reset: 'Tozalash',
    allCountries: 'Barcha davlatlar',
    allEpochs: 'Barcha davrlar',
    allTypes: 'Barcha turlar',
    allActivities: 'Barcha faoliyat turlari',
    reliabilityConfirmed: 'Tasdiqlangan',
    reliabilityCheck: 'Tekshirish talab etiladi',
    notesTitle: 'Mening eslatmam',
    favoritesOnly: 'Faqat tanlanganlar',
  },
  en: {
    appTitle: 'Ancient Sites of Central Asia & Uzbekistan',
    appSubtitle: 'Interactive Academic Atlas of Regional Prehistory & Archaeology',
    tabTerritory: 'By Territory & SVG Map',
    tabTimeline: 'Chronological Timeline',
    tabActivity: 'By Activity & Economy Matrix',
    searchPlaceholder: 'Smart search: site name, typos ("Teshik-Tash"), keywords ("Neanderthal", "agriculture")...',
    btnQuiz: 'Quiz',
    btnGlossary: 'Glossary',
    btnAddSite: '+ Add Site',
    btnAbout: 'About & Export',
    btnExport: 'Export',
    btnPrint: 'Print',
    foundCount: 'Found',
    filters: 'Filters',
    reset: 'Reset',
    allCountries: 'All Countries',
    allEpochs: 'All Epochs',
    allTypes: 'All Types',
    allActivities: 'All Activities',
    reliabilityConfirmed: 'Confirmed',
    reliabilityCheck: 'Needs Verification',
    notesTitle: 'My Note',
    favoritesOnly: 'Favorites only',
  }
};
