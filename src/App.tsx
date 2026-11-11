import { useState, useMemo } from 'react';
import { Site } from './types';
import { INITIAL_SITES } from './data/sites';
import { searchSites, SearchFilters } from './utils/search';
import { TerritoryScheme } from './components/TerritoryScheme';
import { TimelineScheme } from './components/TimelineScheme';
import { ActivityScheme } from './components/ActivityScheme';
import { SiteCardsView } from './components/SiteCardsView';
import { SiteDrawer } from './components/SiteDrawer';
import { SearchBar } from './components/SearchBar';
import {
  Compass,
  Clock,
  Grid3X3,
  LayoutGrid,
  Printer
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cards' | 'territory' | 'timeline' | 'activity'>('cards');

  // Archaeological Sites (Base 32 real verified sites)
  const allSites: Site[] = INITIAL_SITES;
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('arch_favs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('arch_notes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  // Active Selected Site (opens detailed site drawer)
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Execute intelligent search & filtering
  const searchResults = useMemo(() => {
    return searchSites(allSites, searchQuery, filters, favorites);
  }, [allSites, searchQuery, filters, favorites]);

  const filteredSites = useMemo(() => {
    return searchResults.map(r => r.site);
  }, [searchResults]);

  // Current selected site object
  const selectedSite = useMemo(() => {
    if (!selectedSiteId) return null;
    return allSites.find(s => s.id === selectedSiteId) || null;
  }, [allSites, selectedSiteId]);

  // Handle selecting a site from cards or schemes
  const handleSelectSite = (id: string) => {
    setSelectedSiteId(id);
    setIsDrawerOpen(true);
  };

  // Toggle Favorite
  const handleToggleFavorite = (siteId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId];
      try {
        localStorage.setItem('arch_favs', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Save Note
  const handleSaveNote = (siteId: string, content: string) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (content.trim()) updated[siteId] = content;
      else delete updated[siteId];
      try {
        localStorage.setItem('arch_notes', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3] text-[#22201B] flex flex-col font-sans selection:bg-[#4A502C]/15 selection:text-[#22201B]">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E8E3D9] px-4 sm:px-6 py-4 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#22201B] tracking-wide">
              Стоянки Средней Азии и Узбекистана
            </h1>
            <p className="text-xs text-[#736E64] mt-0.5">
              Интерактивный научный атлас древнейших стоянок: палеолит, мезолит, неолит, энеолит, бронза, раннее железо
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 bg-white hover:bg-[#FAF8F5] text-[#736E64] hover:text-[#22201B] border border-[#E8E3D9] rounded transition-colors hidden sm:flex items-center gap-1.5 text-xs"
            title="Распечатать карточки в PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        {/* Smart Search Bar */}
        <div className="mb-3">
          <SearchBar
            query={searchQuery}
            onQueryChange={setSearchQuery}
            filters={filters}
            onFiltersChange={setFilters}
            onResetFilters={handleResetFilters}
            totalSitesCount={allSites.length}
            filteredSitesCount={filteredSites.length}
            recentSearches={[]}
            onSelectRecentSearch={(q) => setSearchQuery(q)}
            onClearHistory={() => {}}
          />
        </div>

        {/* Core Navigation Tabs (just below search) */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-[#E8E3D9] mb-5 no-print overflow-x-auto">
          {/* Tab 1: Cards View (Название большим шрифтом, регион, деятельность, особенность) */}
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 pb-2.5 text-sm sm:text-base font-serif tracking-wide transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'cards'
                ? 'border-[#4A502C] text-[#22201B] font-semibold'
                : 'border-transparent text-[#736E64] hover:text-[#22201B]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Карточки стоянок ({filteredSites.length})</span>
          </button>

          {/* Tab 2: By Territory & SVG Map */}
          <button
            onClick={() => setActiveTab('territory')}
            className={`flex items-center gap-2 pb-2.5 text-sm sm:text-base font-serif tracking-wide transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'territory'
                ? 'border-[#4A502C] text-[#22201B] font-semibold'
                : 'border-transparent text-[#736E64] hover:text-[#22201B]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>По территориям</span>
          </button>

          {/* Tab 3: By Time (Chronological Timeline) */}
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 pb-2.5 text-sm sm:text-base font-serif tracking-wide transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'timeline'
                ? 'border-[#4A502C] text-[#22201B] font-semibold'
                : 'border-transparent text-[#736E64] hover:text-[#22201B]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>По времени</span>
          </button>

          {/* Tab 4: By Activity & Economy Matrix */}
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 pb-2.5 text-sm sm:text-base font-serif tracking-wide transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'activity'
                ? 'border-[#4A502C] text-[#22201B] font-semibold'
                : 'border-transparent text-[#736E64] hover:text-[#22201B]'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>По деятельности</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1">
          {activeTab === 'cards' && (
            <SiteCardsView
              sites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {activeTab === 'territory' && (
            <TerritoryScheme
              sites={allSites}
              filteredSites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineScheme
              sites={allSites}
              filteredSites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityScheme
              sites={allSites}
              filteredSites={filteredSites}
              selectedSiteId={selectedSiteId}
              onSelectSite={handleSelectSite}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E3D9] py-3.5 px-4 sm:px-6 text-xs text-[#736E64] no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="font-serif font-medium text-[#22201B]">
              Стоянки Средней Азии и Узбекистана
            </span>
            <span>•</span>
            <span>Автономный научный реестр</span>
            <span>•</span>
            <span>Чистый фронтенд</span>
          </div>

          <div className="text-[11px] text-[#8C877D] font-mono">
            {allSites.length} подтверждённых памятников • {favorites.length} в избранном
          </div>
        </div>
      </footer>

      {/* Slide-over Detailed Site Card Drawer (Полное описание стоянки) */}
      <SiteDrawer
        site={selectedSite}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isFavorite={selectedSite ? favorites.includes(selectedSite.id) : false}
        onToggleFavorite={handleToggleFavorite}
        userNote={selectedSite ? notes[selectedSite.id] || '' : ''}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
}
