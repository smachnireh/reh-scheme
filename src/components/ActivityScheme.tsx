import { useState, useMemo } from 'react';
import { Site, Activity } from '../types';
import { EPOCH_COLORS } from '../data/sites';
import {
  Grid3X3,
  Flame,
  CheckCircle2,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  sites: Site[];
  filteredSites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
}

const ACTIVITIES_CONFIG: {
  id: Activity;
  title: string;
  category: 'Хозяйство и добыча' | 'Ремесло и технологии' | 'Духовная культура и социум';
  desc: string;
}[] = [
  { id: 'Охота', title: 'Охота', category: 'Хозяйство и добыча', desc: 'Кости диких животных (козёл, сайга, олень, мамонт), наконечники стрел, дротиков, копья' },
  { id: 'Собирательство', title: 'Собирательство', category: 'Хозяйство и добыча', desc: 'Семена дикорастущих злаков, орехи, моллюски, скребки и тёрочники' },
  { id: 'Рыболовство', title: 'Рыболовство', category: 'Хозяйство и добыча', desc: 'Костяные гарпуны, каменные грузила для сетей, чешуя и кости сомов, сазанов' },
  { id: 'Скотоводство', title: 'Скотоводство', category: 'Хозяйство и добыча', desc: 'Остеология домашних овец, коз, быков, одомашнивание лошади, псалии, загонное содержание' },
  { id: 'Земледелие', title: 'Земледелие', category: 'Хозяйство и добыча', desc: 'Зёрна пшеницы, ячменя, каменные и бронзовые серпы, зернотёрки, ирригационные каналы' },
  { id: 'Кремнёвая индустрия', title: 'Кремнёвая индустрия', category: 'Ремесло и технологии', desc: 'Нуклеусы, отбойники, леваллуазские сколы, микролиты, карьеры добычи сырья' },
  { id: 'Керамика', title: 'Керамика', category: 'Ремесло и технологии', desc: 'Лепная и круговая посуда, штампованный орнамент, гончарные печи и горны' },
  { id: 'Металлургия', title: 'Металлургия', category: 'Ремесло и технологии', desc: 'Выплавка меди, бронзы, свинца, литейные формы, шлаки, тигли, топоры, ножи, украшения' },
  { id: 'Погребальные практики', title: 'Погребальные практики', category: 'Духовная культура и социум', desc: 'Ингумация, трупоположение, кенотафы, склепы, катакомбы, погребальный инвентарь' },
  { id: 'Культ и наскальное искусство', title: 'Культ и наскальное искусство', category: 'Духовная культура и социум', desc: 'Петроглифы, росписи охрой, храмы огня, алтари, солярные символы, вотивные дары' },
  { id: 'Обмен и торговля', title: 'Обмен и торговля', category: 'Духовная культура и социум', desc: 'Импорт лазурита из Бадахшана, бирюзы из Кызылкума, раковин с Каспия и Индийского океана' }
];

export function ActivityScheme({
  sites,
  filteredSites,
  selectedSiteId,
  onSelectSite
}: Props) {
  const [viewMode, setViewMode] = useState<'matrix' | 'clusters'>('matrix');
  const [activeActivityFilter, setActiveActivityFilter] = useState<Activity | 'ALL'>('ALL');

  const filteredIdsSet = useMemo(() => new Set(filteredSites.map(s => s.id)), [filteredSites]);

  // Group sites by activities for cluster view
  const activityClusters = useMemo(() => {
    const map: Record<Activity, Site[]> = {
      'Охота': [],
      'Собирательство': [],
      'Рыболовство': [],
      'Скотоводство': [],
      'Земледелие': [],
      'Кремнёвая индустрия': [],
      'Керамика': [],
      'Металлургия': [],
      'Погребальные практики': [],
      'Культ и наскальное искусство': [],
      'Обмен и торговля': []
    };

    for (const site of sites) {
      for (const act of site.activities) {
        if (map[act]) {
          map[act].push(site);
        }
      }
    }
    return map;
  }, [sites]);

  // Filtered list of sites for display
  const displayedSites = useMemo(() => {
    if (activeActivityFilter === 'ALL') {
      return sites;
    }
    return sites.filter(s => s.activities.includes(activeActivityFilter));
  }, [sites, activeActivityFilter]);

  return (
    <div className="bg-white border border-[#E8E3D9] rounded p-3.5 flex flex-col h-[calc(100vh-210px)] min-h-[620px] shadow-2xs">
      {/* Top Header & Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[#EFEBE2] mb-3 gap-3">
        <div className="flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-[#736E64]" />
          <div>
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Деятельность древних обществ
            </h3>
            <p className="text-[11px] text-[#736E64]">
              Связь стоянок и находок с хозяйством, ремеслом и верованиями
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-[#F4F1EA] p-0.5 rounded border border-[#E2DDD3] flex text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white text-[#22201B] font-medium shadow-2xs'
                  : 'text-[#736E64] hover:text-[#22201B]'
              }`}
            >
              Сводная матрица
            </button>
            <button
              onClick={() => setViewMode('clusters')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'clusters'
                  ? 'bg-white text-[#22201B] font-medium shadow-2xs'
                  : 'text-[#736E64] hover:text-[#22201B]'
              }`}
            >
              Кластеры
            </button>
          </div>
        </div>
      </div>

      {/* Activity Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-[#EFEBE2] text-xs">
        <span className="text-[11px] text-[#8C877D] font-medium mr-1 flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" />
          Фильтр:
        </span>
        <button
          onClick={() => setActiveActivityFilter('ALL')}
          className={`px-2.5 py-0.5 rounded text-xs whitespace-nowrap transition-colors ${
            activeActivityFilter === 'ALL'
              ? 'bg-[#4A502C] text-white font-medium'
              : 'bg-white hover:bg-[#F4F1EA] text-[#423E36] border border-[#E2DDD3]'
          }`}
        >
          Все ({sites.length})
        </button>
        {ACTIVITIES_CONFIG.map(act => {
          const count = activityClusters[act.id]?.length || 0;
          const isActive = activeActivityFilter === act.id;
          return (
            <button
              key={act.id}
              onClick={() => setActiveActivityFilter(act.id)}
              className={`px-2.5 py-0.5 rounded text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-[#4A502C] text-white font-medium'
                  : 'bg-white hover:bg-[#F4F1EA] text-[#423E36] border border-[#E2DDD3]'
              }`}
            >
              <span>{act.title}</span>
              <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-white/20 text-white' : 'text-[#8C877D]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' ? (
        <div className="flex-1 overflow-x-auto overflow-y-auto border border-[#E8E3D9] rounded bg-white">
          <table className="w-full text-left border-collapse min-w-[960px]">
            {/* Table Header */}
            <thead className="sticky top-0 bg-[#FAF8F5] z-10 border-b border-[#E2DDD3] text-xs text-[#22201B]">
              <tr>
                <th className="p-2.5 font-serif font-medium text-xs w-60 border-r border-[#EFEBE2] bg-[#FAF8F5]">
                  Памятник / Регион
                </th>
                <th className="p-2 font-serif font-medium w-28 border-r border-[#EFEBE2]">
                  Эпоха
                </th>
                {ACTIVITIES_CONFIG.map(act => (
                  <th
                    key={act.id}
                    className="p-1.5 text-center border-r border-[#EFEBE2] font-normal text-[10px] max-w-[80px] leading-tight text-[#5C574E]"
                    title={act.desc}
                  >
                    <div className="truncate">{act.title}</div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-[#F2EEE6] text-xs">
              {displayedSites.map(site => {
                const isSelected = selectedSiteId === site.id;
                const isMatch = filteredIdsSet.has(site.id);
                const epochColor = EPOCH_COLORS[site.epoch] || { dot: '#888' };

                return (
                  <tr
                    key={site.id}
                    onClick={() => onSelectSite(site.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#F2EEE6]'
                        : isMatch
                        ? 'hover:bg-[#FAF8F5]'
                        : 'opacity-35 hover:opacity-70'
                    }`}
                  >
                    {/* Site Info Column */}
                    <td className={`p-2.5 border-r border-[#EFEBE2] ${isSelected ? 'font-medium' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: epochColor.dot }}
                        />
                        <span className="font-serif font-medium text-xs text-[#22201B]">
                          {site.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-[#4A502C] bg-[#4A502C]/10 px-1.5 py-0.2 rounded">
                            выбрано
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8C877D] truncate mt-0.5" title={site.region}>
                        {site.region}
                      </div>
                    </td>

                    {/* Epoch Column */}
                    <td className="p-2 border-r border-[#EFEBE2] text-[11px] text-[#5C574E]">
                      {site.epoch}
                    </td>

                    {/* Activities Columns */}
                    {ACTIVITIES_CONFIG.map(act => {
                      const hasActivity = site.activities.includes(act.id);
                      return (
                        <td
                          key={act.id}
                          className={`p-2 text-center border-r border-[#EFEBE2] ${
                            hasActivity ? 'bg-[#FAF8F5]' : ''
                          }`}
                        >
                          {hasActivity ? (
                            <div className="flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-[#4A502C] inline-block" />
                            </div>
                          ) : (
                            <span className="text-[10px] text-neutral-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* CLUSTERS VIEW */
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {ACTIVITIES_CONFIG.filter(
            a => activeActivityFilter === 'ALL' || activeActivityFilter === a.id
          ).map(act => {
            const clusterSites = activityClusters[act.id] || [];
            const filteredClusterCount = clusterSites.filter(s => filteredIdsSet.has(s.id)).length;

            return (
              <div
                key={act.id}
                className="bg-white border border-[#E8E3D9] rounded p-3 shadow-2xs flex flex-col"
              >
                {/* Cluster Header */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#EFEBE2] mb-2.5">
                  <div>
                    <h4 className="font-serif font-medium text-[#22201B] text-sm">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-[#8C877D] uppercase tracking-wider">
                      {act.category}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#F4F1EA] text-[#5C574E] border border-[#E2DDD3]">
                    {filteredClusterCount} / {clusterSites.length}
                  </span>
                </div>

                <div className="text-[11px] text-[#5C574E] mb-2.5 bg-[#FAF8F5] p-2 rounded border border-[#EFEBE2] leading-relaxed">
                  <div className="flex items-center gap-1 font-medium text-[#22201B] mb-0.5">
                    <Info className="w-3 h-3 text-[#736E64]" />
                    <span>Признаки и находки:</span>
                  </div>
                  {act.desc}
                </div>

                {/* Associated Sites */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-52 pr-1">
                  {clusterSites.map(site => {
                    const isSelected = selectedSiteId === site.id;
                    const isMatch = filteredIdsSet.has(site.id);
                    const epochColor = EPOCH_COLORS[site.epoch] || { dot: '#888' };

                    return (
                      <button
                        key={site.id}
                        onClick={() => onSelectSite(site.id)}
                        className={`w-full text-left p-1.5 rounded border text-xs transition-colors flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-[#4A502C] text-white border-[#3D4224]'
                            : isMatch
                            ? 'bg-white hover:bg-[#FAF8F5] border-[#E8E3D9] text-[#22201B]'
                            : 'opacity-40 hover:opacity-75 bg-[#FAF8F5] border-[#EFEBE2] text-[#8C877D]'
                        }`}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 font-medium">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: isSelected ? '#FFFFFF' : epochColor.dot }}
                            />
                            <span className="truncate">{site.name}</span>
                          </div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#8C877D]'}`}>
                            {site.epoch} • {site.country}
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-white/70' : 'text-[#8C877D]'}`}>
                          {site.dating.displayLabel.split('(')[0].trim().slice(0, 10)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
