import { useState, useMemo } from 'react';
import { GLOSSARY_TERMS } from '../data/glossary';
import { BookOpen, Search, X, ExternalLink, Bookmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInspectSite: (siteId: string) => void;
}

export function GlossaryModal({ isOpen, onClose, onInspectSite }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Все');

  const categories = ['Все', 'Эпоха', 'Индустрия / Технология', 'Культура', 'Термин'];

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter(item => {
      const matchCat = activeCategory === 'Все' || item.category === activeCategory;
      const matchSearch =
        !searchTerm.trim() ||
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchTerm, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs modal-backdrop" onClick={onClose} />

      <div className="relative bg-white text-[#22201B] border border-[#E8E3D9] rounded shadow-xl max-w-2xl w-full max-h-[85vh] z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-[#E8E3D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4A502C]" />
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Глоссарий археологических терминов и культур
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#FAF8F5] rounded text-[#8C877D] hover:text-[#22201B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E8E3D9] space-y-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C877D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Поиск по терминам и определениям..."
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-0.5 rounded text-[11px] transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#4A502C] text-white font-medium'
                    : 'bg-white hover:bg-[#FAF8F5] text-[#5C574E] border border-[#E8E3D9]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8C877D] italic">
              Терминов по запросу не найдено
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded border border-[#E8E3D9] space-y-1"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-medium text-sm text-[#22201B]">
                    {item.term}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4F1EA] text-[#5C574E] shrink-0 border border-[#E2DDD3]">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-[#5C574E] leading-relaxed">
                  {item.definition}
                </p>
                {item.exampleSiteId && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => {
                        onInspectSite(item.exampleSiteId!);
                        onClose();
                      }}
                      className="text-[11px] text-[#4A502C] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Смотреть эталонный памятник</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
