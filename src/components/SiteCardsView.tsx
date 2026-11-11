import { Site } from '../types';
import { EPOCH_COLORS } from '../data/sites';
import { MapPin, Calendar, Layers, Sparkles, Star, ArrowUpRight } from 'lucide-react';

interface Props {
  sites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export function SiteCardsView({
  sites,
  selectedSiteId,
  onSelectSite,
  favorites,
  onToggleFavorite
}: Props) {
  if (sites.length === 0) {
    return (
      <div className="bg-white border border-[#E8E3D9] rounded p-8 text-center text-[#736E64]">
        <p className="font-serif text-lg text-[#22201B] mb-1">Стоянок по вашему запросу не найдено</p>
        <p className="text-xs">Попробуйте изменить поисковый запрос или сбросить фильтры</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#736E64] px-1">
        <span>Показано памятников: <strong className="text-[#22201B] font-mono">{sites.length}</strong></span>
        <span className="text-[11px]">Нажмите на карточку для просмотра полного академического описания</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sites.map(site => {
          const isSelected = selectedSiteId === site.id;
          const isFav = favorites.includes(site.id);
          const epochColor = EPOCH_COLORS[site.epoch] || { dot: '#888', text: '#22201B' };

          return (
            <article
              key={site.id}
              onClick={() => onSelectSite(site.id)}
              className={`group bg-white rounded border cursor-pointer transition-all duration-150 flex flex-col justify-between p-4 sm:p-5 text-left relative ${
                isSelected
                  ? 'border-[#4A502C] ring-1 ring-[#4A502C] shadow-sm'
                  : 'border-[#E8E3D9] hover:border-[#B5AEA0] hover:shadow-xs'
              }`}
            >
              {/* Card Top: Name & Favorite */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: epochColor.dot }}
                      />
                      <span className="text-[11px] font-mono text-[#5C574E] uppercase tracking-wider">
                        {site.epoch}
                      </span>
                    </div>

                    {/* Site Name (Большим шрифтом) */}
                    <h3 className="text-2xl sm:text-[26px] font-serif font-medium text-[#22201B] leading-tight group-hover:text-[#4A502C] transition-colors">
                      {site.name}
                    </h3>

                    {site.altNames && site.altNames.length > 0 && (
                      <p className="text-[11px] text-[#8C877D] italic mt-0.5">
                        {site.altNames.join(' • ')}
                      </p>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(site.id);
                    }}
                    className={`p-1.5 rounded border transition-colors ${
                      isFav
                        ? 'bg-[#FDF6E2] border-[#E8DEC8] text-[#9A7514]'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E8E3D9] text-[#8C877D]'
                    }`}
                    title={isFav ? 'В избранном' : 'Добавить в избранное'}
                  >
                    <Star className={`w-4 h-4 ${isFav ? 'fill-[#9A7514]' : ''}`} />
                  </button>
                </div>

                {/* Region & Localization (Ниже регион) */}
                <div className="flex items-center gap-1.5 text-xs text-[#5C574E] mb-3 pb-2.5 border-b border-[#F2EEE6]">
                  <MapPin className="w-3.5 h-3.5 text-[#8C877D] shrink-0" />
                  <span className="font-medium text-[#22201B]">{site.region}</span>
                  <span className="text-[#8C877D]">•</span>
                  <span>{site.country}</span>
                </div>

                {/* Activities (Деятельность) */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#8C877D] font-medium flex items-center gap-1 mb-1.5">
                    <Layers className="w-3 h-3 text-[#736E64]" />
                    Деятельность:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {site.activities.map(act => (
                      <span
                        key={act}
                        className="px-2 py-0.5 rounded bg-[#F4F1EA] text-[#423E36] text-[11px] border border-[#E2DDD3]"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Feature & Scientific Significance (Их особенность) */}
                <div className="bg-[#FAF8F5] rounded p-3 border border-[#EFEBE2] mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-[#4A502C] font-medium flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3 text-[#4A502C]" />
                    Особенность памятника:
                  </div>
                  <p className="text-xs text-[#22201B] leading-relaxed line-clamp-3">
                    {site.scientificSignificance}
                  </p>
                </div>

                {/* Key Findings Preview */}
                <div className="text-[11px] text-[#5C574E] leading-relaxed mb-3">
                  <span className="font-medium text-[#22201B]">Находки: </span>
                  <span className="line-clamp-2">{site.keyFindings}</span>
                </div>
              </div>

              {/* Card Footer: Dating & Action Button */}
              <div className="pt-2.5 border-t border-[#F2EEE6] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[#736E64] font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-[#8C877D]" />
                  <span>{site.dating.displayLabel.split('(')[0].trim()}</span>
                </div>

                <span className="text-[11px] font-medium text-[#4A502C] group-hover:underline flex items-center gap-0.5">
                  <span>Описание</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
