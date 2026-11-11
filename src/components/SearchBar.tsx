import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SearchFilters } from '../utils/search';
import { Country, Epoch, SiteType, Activity, VerificationStatus } from '../types';
import { EPOCHS_ORDER } from '../data/sites';
import {
  Search,
  X,
  SlidersHorizontal,
  History,
  Sparkles,
  RotateCcw,
  Star,
  Check
} from 'lucide-react';

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  filters: SearchFilters;
  onFiltersChange: (f: SearchFilters) => void;
  onResetFilters: () => void;
  totalSitesCount: number;
  filteredSitesCount: number;
  recentSearches: string[];
  onSelectRecentSearch: (s: string) => void;
  onClearHistory: () => void;
}

const COUNTRIES: Country[] = ['Узбекистан', 'Казахстан', 'Кыргызстан', 'Таджикистан', 'Туркменистан'];

const SITE_TYPES: SiteType[] = [
  'Пещера',
  'Грот / Навес',
  'Открытая стоянка',
  'Поселение / Городище',
  'Могильник / Некрополь',
  'Наскальные рисунки (петроглифы)',
  'Кремнёвая мастерская / Карьер'
];

const ACTIVITIES: Activity[] = [
  'Охота',
  'Собирательство',
  'Рыболовство',
  'Скотоводство',
  'Земледелие',
  'Кремнёвая индустрия',
  'Керамика',
  'Металлургия',
  'Погребальные практики',
  'Культ и наскальное искусство',
  'Обмен и торговля'
];

const POPULAR_SUGGESTIONS = [
  'Тешик-Таш',
  'неандерталец',
  'Обирахмат',
  'петроглифы',
  'Кельтеминарская культура',
  'БМАК',
  'Саразм',
  'Ботай',
  'пещеры палеолита',
  'стоянки с земледелием'
];

export function SearchBar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  onResetFilters,
  totalSitesCount,
  filteredSitesCount,
  recentSearches,
  onSelectRecentSearch,
  onClearHistory
}: Props) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Active filter count calculation
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => {
    if (k === 'onlyFavorites') return !!v;
    return v !== undefined && v !== '';
  }).length;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsHistoryOpen(false);
    }
  };

  return (
    <div className="relative z-30 mb-4 search-container">
      {/* Main Search Input Box */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 bg-white border border-[#E2DDD3] rounded focus-within:border-[#736E64] transition-colors">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#8C877D]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setIsHistoryOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по памятникам, культурам, синонимам («неандерталец», «земледелие», «петроглифы»)..."
            className="w-full pl-9 pr-24 py-2 text-xs sm:text-sm bg-transparent placeholder-[#9C978D] text-[#22201B] focus:outline-none"
          />

          {/* Right actions inside search bar */}
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => {
                  onQueryChange('');
                  inputRef.current?.focus();
                }}
                className="p-1 hover:bg-[#F4F1EA] rounded text-neutral-400 hover:text-neutral-700 transition-colors"
                title="Очистить запрос"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Filter toggle button */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-colors ${
                isFilterPanelOpen || activeFiltersCount > 0
                  ? 'bg-[#4A502C] text-white border-[#4A502C]'
                  : 'bg-[#F9F7F3] text-[#423E36] hover:bg-[#EFEBE2] border-[#E2DDD3]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Фильтры</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#4A502C] text-[10px] font-mono flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Autocomplete suggestions chips & counter */}
      <div className="flex items-center justify-between gap-2 mt-2 px-0.5 text-xs overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] text-[#8C877D] shrink-0">Частые:</span>
          {POPULAR_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => onQueryChange(sug)}
              className="px-2 py-0.5 rounded text-[11px] text-[#5C574E] bg-white hover:bg-[#EFEBE2] border border-[#E8E3D9] whitespace-nowrap transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Counter of matches */}
        <div className="text-[11px] font-mono text-[#8C877D] shrink-0 ml-auto pl-2">
          {filteredSitesCount} из {totalSitesCount}
        </div>
      </div>

      {/* History dropdown if user clicks into search */}
      {isHistoryOpen && recentSearches.length > 0 && !query && (
        <div className="absolute top-11 left-0 right-0 sm:right-auto sm:w-96 bg-white border border-[#E2DDD3] rounded shadow-md p-2 mt-1 z-40 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#EFEBE2] mb-1.5 text-neutral-500">
            <span className="flex items-center gap-1 text-[11px] font-medium text-[#423E36]">
              <History className="w-3.5 h-3.5 text-[#8C877D]" />
              История поисковых запросов
            </span>
            <button
              onClick={onClearHistory}
              className="text-[10px] text-[#8C877D] hover:underline"
            >
              Очистить
            </button>
          </div>
          <div className="space-y-0.5">
            {recentSearches.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectRecentSearch(item);
                  setIsHistoryOpen(false);
                }}
                className="w-full text-left px-2 py-1 rounded hover:bg-[#F9F7F3] flex items-center justify-between text-[#22201B] transition-colors"
              >
                <span>{item}</span>
                <span className="text-[10px] text-neutral-400">повторить</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* EXPANDABLE FILTER DRAWER / PANEL */}
      {isFilterPanelOpen && (
        <div className="mt-2 p-3.5 bg-white border border-[#E2DDD3] rounded shadow-2xs text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFEBE2]">
            <span className="font-serif font-medium text-sm text-[#22201B]">
              Фильтрация памятников
            </span>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
                  className="flex items-center gap-1 text-[11px] text-[#736E64] hover:text-[#22201B] underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Сбросить ({activeFiltersCount})
                </button>
              )}
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-1 hover:bg-[#F4F1EA] rounded text-neutral-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Country */}
            <div>
              <label className="block text-[11px] text-[#736E64] font-medium mb-1">
                Страна:
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => onFiltersChange({ ...filters, country: e.target.value || undefined })}
                className="w-full p-1.5 bg-white rounded border border-[#E2DDD3] text-[#22201B] focus:outline-none focus:border-[#736E64]"
              >
                <option value="">Все страны</option>
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Epoch */}
            <div>
              <label className="block text-[11px] text-[#736E64] font-medium mb-1">
                Эпоха:
              </label>
              <select
                value={filters.epoch || ''}
                onChange={(e) => onFiltersChange({ ...filters, epoch: e.target.value || undefined })}
                className="w-full p-1.5 bg-white rounded border border-[#E2DDD3] text-[#22201B] focus:outline-none focus:border-[#736E64]"
              >
                <option value="">Все эпохи</option>
                {EPOCHS_ORDER.map(ep => (
                  <option key={ep} value={ep}>{ep}</option>
                ))}
              </select>
            </div>

            {/* Site Type */}
            <div>
              <label className="block text-[11px] text-[#736E64] font-medium mb-1">
                Тип памятника:
              </label>
              <select
                value={filters.siteType || ''}
                onChange={(e) => onFiltersChange({ ...filters, siteType: e.target.value || undefined })}
                className="w-full p-1.5 bg-white rounded border border-[#E2DDD3] text-[#22201B] focus:outline-none focus:border-[#736E64]"
              >
                <option value="">Любой тип</option>
                {SITE_TYPES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Activity */}
            <div>
              <label className="block text-[11px] text-[#736E64] font-medium mb-1">
                Деятельность:
              </label>
              <select
                value={filters.activity || ''}
                onChange={(e) => onFiltersChange({ ...filters, activity: e.target.value || undefined })}
                className="w-full p-1.5 bg-white rounded border border-[#E2DDD3] text-[#22201B] focus:outline-none focus:border-[#736E64]"
              >
                <option value="">Любая деятельность</option>
                {ACTIVITIES.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Secondary Filter Row: Verification status & Favorites toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EFEBE2]">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#423E36]">
                <input
                  type="checkbox"
                  checked={!!filters.onlyFavorites}
                  onChange={(e) => onFiltersChange({ ...filters, onlyFavorites: e.target.checked })}
                  className="rounded text-[#4A502C] focus:ring-0 accent-[#4A502C]"
                />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Только избранные</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[#423E36]">
                <input
                  type="checkbox"
                  checked={filters.verificationStatus === 'Подтверждено'}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    verificationStatus: e.target.checked ? 'Подтверждено' : undefined
                  })}
                  className="rounded text-[#4A502C] focus:ring-0 accent-[#4A502C]"
                />
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Только подтверждённые</span>
              </label>
            </div>

            <button
              onClick={() => setIsFilterPanelOpen(false)}
              className="px-3 py-1 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded transition-colors text-xs ml-auto"
            >
              Применить ({filteredSitesCount})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
