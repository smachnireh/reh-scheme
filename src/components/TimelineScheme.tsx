import { useState, useMemo, useRef, WheelEvent } from 'react';
import { Site } from '../types';
import { EPOCHS_ORDER, EPOCH_COLORS } from '../data/sites';
import {
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Props {
  sites: Site[];
  filteredSites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
}

interface CultureHorizon {
  name: string;
  epoch: string;
  fromBP: number;
  toBP: number;
  label: string;
  region: string;
}

const CULTURES: CultureHorizon[] = [
  { name: 'Ашельская традиция', epoch: 'Нижний палеолит', fromBP: 750000, toBP: 150000, label: 'ок. 750–150 тыс. л. н.', region: 'Каратау, Селунгур, Кульбулак' },
  { name: 'Мустьерская культура', epoch: 'Средний палеолит', fromBP: 100000, toBP: 40000, label: 'ок. 100–40 тыс. л. н.', region: 'Тешик-Таш, Обирахмат, Ангилак' },
  { name: 'Верхнепалеолитическая традиция', epoch: 'Верхний палеолит', fromBP: 45000, toBP: 14000, label: 'ок. 45–14 тыс. л. н.', region: 'Ушбулак, Самаркандская стоянка' },
  { name: 'Горный мезолит', epoch: 'Мезолит', fromBP: 12000, toBP: 8000, label: 'ок. 12–8 тыс. л. н.', region: 'Мачай, Тут-Каул, Зараутсай' },
  { name: 'Джейтунская культура', epoch: 'Неолит', fromBP: 8000, toBP: 7000, label: 'ок. 8000–7000 л. н. (VI тыс. до н. э.)', region: 'Предгорья Копетдага' },
  { name: 'Кельтеминарская культура', epoch: 'Неолит', fromBP: 6500, toBP: 4800, label: 'ок. 6500–4800 л. н. (IV–III тыс. до н. э.)', region: 'Хорезм, Приаралье, Кызылкум' },
  { name: 'Ботайская культура', epoch: 'Энеолит', fromBP: 5700, toBP: 5100, label: 'ок. 5700–5100 л. н. (3700–3100 до н. э.)', region: 'Северный Казахстан' },
  { name: 'Саразмский proto-урбанизм', epoch: 'Энеолит', fromBP: 5500, toBP: 4000, label: 'ок. 5500–4000 л. н. (IV–III тыс. до н. э.)', region: 'Долина Зеравшана' },
  { name: 'Бактрийско-Маргианский комплекс (БМАК)', epoch: 'Бронзовый век', fromBP: 4300, toBP: 3200, label: 'ок. 4300–3200 л. н. (XXIII–XII вв. до н. э.)', region: 'Маргиана, Бактрия, Сапаллитепа' },
  { name: 'Андроновская общность', epoch: 'Бронзовый век', fromBP: 3800, toBP: 3000, label: 'ок. 3800–3000 л. н. (XVIII–X вв. до н. э.)', region: 'Степные районы, Танбалы' },
  { name: 'Чустская культура', epoch: 'Ранний железный век', fromBP: 3200, toBP: 2600, label: 'ок. 3200–2600 л. н. (XII–VI вв. до н. э.)', region: 'Ферганская долина' },
  { name: 'Культура Яз I — сако-массагеты', epoch: 'Ранний железный век', fromBP: 3000, toBP: 2200, label: 'ок. 3000–2200 л. н. (X–II вв. до н. э.)', region: 'Бактрия, Согд, Хорезм' },
];

// Time segments definitions (Years Before Present)
// We provide partitioned columns so all epochs get generous readable horizontal space
const TIME_COLUMNS = [
  { id: 'Нижний палеолит', label: 'Нижний палеолит', sub: '800k — 100k л. н.', minBP: 100000, maxBP: 800000, flex: 1.4 },
  { id: 'Средний палеолит', label: 'Средний палеолит (Мустье)', sub: '100k — 40k л. н.', minBP: 40000, maxBP: 100000, flex: 1.5 },
  { id: 'Верхний палеолит', label: 'Верхний палеолит', sub: '40k — 12k л. н.', minBP: 12000, maxBP: 40000, flex: 1.4 },
  { id: 'Мезолит', label: 'Мезолит', sub: '12k — 8k л. н.', minBP: 8000, maxBP: 12000, flex: 1.2 },
  { id: 'Неолит', label: 'Неолит', sub: '8k — 5.5k л. н. (VI–IV тыс. до н.э.)', minBP: 5500, maxBP: 8000, flex: 1.3 },
  { id: 'Энеолит', label: 'Энеолит', sub: '5.5k — 4.2k л. н. (IV–III тыс. до н.э.)', minBP: 4200, maxBP: 5500, flex: 1.2 },
  { id: 'Бронзовый век', label: 'Бронзовый век', sub: '4.2k — 3k л. н. (XXII–X вв. до н.э.)', minBP: 3000, maxBP: 4200, flex: 1.6 },
  { id: 'Ранний железный век', label: 'Ранний железный век', sub: '3k — 2k л. н. (X–II вв. до н.э.)', minBP: 2000, maxBP: 3000, flex: 1.4 },
];

export function TimelineScheme({
  sites,
  filteredSites,
  selectedSiteId,
  onSelectSite
}: Props) {
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const filteredIdsSet = useMemo(() => new Set(filteredSites.map(s => s.id)), [filteredSites]);

  // Group sites by epoch column
  const sitesByEpoch = useMemo(() => {
    const map: Record<string, Site[]> = {};
    for (const col of TIME_COLUMNS) {
      map[col.id] = [];
    }
    for (const site of sites) {
      if (map[site.epoch]) {
        map[site.epoch].push(site);
      } else {
        // Fallback matching
        const match = TIME_COLUMNS.find(c => c.id === site.epoch);
        if (match) map[match.id].push(site);
      }
    }
    // Sort within epoch by antiquity (older first)
    for (const epochKey in map) {
      map[epochKey].sort((a, b) => b.dating.fromYearsBP - a.dating.fromYearsBP);
    }
    return map;
  }, [sites]);

  // Handle wheel horizontal scroll / zoom with modifier
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom(prev => Math.min(2.5, Math.max(0.8, prev + delta)));
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollBy = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white border border-[#E8E3D9] rounded p-3.5 flex flex-col h-[calc(100vh-210px)] min-h-[620px] shadow-2xs">
      {/* Top Header & Timeline Controls */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#EFEBE2] mb-3 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#736E64]" />
          <div>
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Хронологическая шкала
            </h3>
            <p className="text-[11px] text-[#736E64]">
              От раннего палеолита (~800 000 л. н.) до раннего железа (~2 000 л. н.)
            </p>
          </div>
        </div>

        {/* Zoom & Scroll controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F9F7F3] px-2 py-0.5 rounded border border-[#E2DDD3] text-xs">
            <span className="text-[#736E64] font-mono text-[11px] mr-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
              className="p-1 hover:bg-[#EFEBE2] rounded transition-colors text-[#423E36]"
              title="Увеличить масштаб"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.8, prev - 0.2))}
              className="p-1 hover:bg-[#EFEBE2] rounded transition-colors text-[#423E36]"
              title="Уменьшить масштаб"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-[#EFEBE2] rounded transition-colors text-[#423E36]"
              title="100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => scrollBy(-350)}
              className="p-1 bg-[#F9F7F3] hover:bg-[#EFEBE2] border border-[#E2DDD3] rounded text-[#423E36] transition-colors"
              title="Прокрутить назад во времени"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy(350)}
              className="p-1 bg-[#F9F7F3] hover:bg-[#EFEBE2] border border-[#E2DDD3] rounded text-[#423E36] transition-colors"
              title="Прокрутить вперед"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Timeline Arena */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex-1 overflow-x-auto overflow-y-auto pb-2 pt-0.5 select-none"
      >
        <div
          className="flex min-w-full gap-3 h-full"
          style={{ width: `${Math.max(100, zoom * 120)}%` }}
        >
          {TIME_COLUMNS.map((column) => {
            const epochSites = sitesByEpoch[column.id] || [];
            const epochColor = EPOCH_COLORS[column.id] || { dot: '#736E64' };
            const relatedCultures = CULTURES.filter(c => c.epoch === column.id);

            return (
              <div
                key={column.id}
                className="flex flex-col border border-[#E2DDD3] rounded bg-[#FAF8F5]/60 flex-1 min-w-[260px] overflow-hidden"
              >
                {/* Epoch Header Strip */}
                <div
                  className="p-2.5 border-b border-[#E8E3D9] text-left bg-white"
                  style={{ borderTop: `2px solid ${epochColor.dot}` }}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-serif font-medium text-sm text-[#22201B]">
                      {column.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#5C574E]">
                      {epochSites.length}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#736E64]">
                    {column.sub}
                  </div>
                </div>

                {/* Culture Horizons in this epoch */}
                {relatedCultures.length > 0 && (
                  <div className="px-2 py-1.5 bg-white/70 border-b border-[#EFEBE2] space-y-1">
                    <div className="text-[9px] uppercase tracking-wider text-[#8C877D] font-medium">
                      Культурные горизонты
                    </div>
                    {relatedCultures.map((cult, ci) => (
                      <div
                        key={ci}
                        className="text-[10px] bg-white rounded px-1.5 py-0.5 border border-[#E8E3D9] text-[#22201B]"
                      >
                        <div className="font-medium text-[#423E36] truncate" title={cult.name}>
                          {cult.name}
                        </div>
                        <div className="text-[#8C877D] text-[9px] flex items-center justify-between">
                          <span>{cult.label}</span>
                          <span className="truncate max-w-[110px]">{cult.region}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sites List placed on this epoch */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {epochSites.length === 0 ? (
                    <div className="text-center py-6 text-xs text-neutral-400 italic">
                      Нет стоянок
                    </div>
                  ) : (
                    epochSites.map(site => {
                      const isSelected = selectedSiteId === site.id;
                      const isMatch = filteredIdsSet.has(site.id);

                      return (
                        <div
                          key={site.id}
                          onClick={() => onSelectSite(site.id)}
                          className={`p-2 rounded border text-left cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#4A502C] text-white border-[#4A502C]'
                              : isMatch
                              ? 'bg-white hover:bg-[#F9F7F3] border-[#E2DDD3] text-[#22201B]'
                              : 'bg-white/40 border-stone-200 text-neutral-400 opacity-40 hover:opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <span className="font-serif font-medium text-xs tracking-wide">
                              {site.name}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-mono shrink-0 ${
                                isSelected ? 'bg-black/20 text-white' : 'bg-[#F4F1EA] text-[#5C574E]'
                              }`}
                            >
                              {site.country.slice(0, 3)}
                            </span>
                          </div>

                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-stone-200' : 'text-[#736E64]'
                            }`}
                          >
                            {site.culture}
                          </div>

                          <div
                            className={`text-[9px] font-mono mb-1 flex items-center gap-1 ${
                              isSelected ? 'text-stone-200' : 'text-[#8C877D]'
                            }`}
                          >
                            <Calendar className="w-2.5 h-2.5 shrink-0 opacity-70" />
                            <span className="truncate">{site.dating.displayLabel}</span>
                          </div>

                          <div className="text-[10px] line-clamp-2 leading-snug opacity-85">
                            {site.keyFindings}
                          </div>

                          {/* Quick activities chips */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {site.activities.slice(0, 3).map((act, ai) => (
                              <span
                                key={ai}
                                className={`text-[8.5px] px-1 py-0.2 rounded border ${
                                  isSelected
                                    ? 'bg-white/10 border-white/20 text-stone-100'
                                    : 'bg-[#FAF8F5] border-[#E8E3D9] text-[#5C574E]'
                                }`}
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
