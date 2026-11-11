import { useState, useEffect } from 'react';
import { Site } from '../types';
import { EPOCH_COLORS, ACTIVITY_ICONS } from '../data/sites';
import {
  X,
  Star,
  BookOpen,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Printer,
  Share2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Save,
  Trash2
} from 'lucide-react';

interface Props {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (siteId: string) => void;
  userNote: string;
  onSaveNote: (siteId: string, note: string) => void;
  onSelectAnotherSite?: (id: string) => void;
}

export function SiteDrawer({
  site,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  userNote,
  onSaveNote
}: Props) {
  const [noteContent, setNoteContent] = useState(userNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteSavedMessage, setNoteSavedMessage] = useState(false);

  useEffect(() => {
    setNoteContent(userNote || '');
    setIsEditingNote(false);
  }, [site?.id, userNote]);

  if (!isOpen || !site) return null;

  const epochStyle = EPOCH_COLORS[site.epoch] || { dot: '#B8962E', text: 'text-stone-800', bg: 'bg-stone-100' };

  const handleSave = () => {
    onSaveNote(site.id, noteContent);
    setIsEditingNote(false);
    setNoteSavedMessage(true);
    setTimeout(() => setNoteSavedMessage(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity modal-backdrop"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] text-[#22201B] border-l border-[#E8E3D9] shadow-xl flex flex-col h-full z-10 printable-area">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E3D9] bg-white flex items-start justify-between gap-3">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: epochStyle.dot }}
              />
              <span className="text-xs uppercase tracking-wider text-[#5C574E] font-medium">
                {site.epoch}
              </span>
              <span className="text-xs text-[#8C877D]">•</span>
              <span className="text-xs font-mono text-[#5C574E]">
                {site.country}
              </span>
              {/* Reliability badge */}
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ml-auto border ${
                  site.verificationStatus === 'Подтверждено'
                    ? 'bg-[#F4F8F4] text-[#2D5A27] border-[#D0E2CF]'
                    : 'bg-[#FAF5EB] text-[#7A5A1A] border-[#E8DEC8]'
                }`}
              >
                {site.verificationStatus === 'Подтверждено' ? (
                  <CheckCircle className="w-3 h-3 text-[#2D5A27]" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-[#7A5A1A]" />
                )}
                {site.verificationStatus}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#22201B] leading-tight">
              {site.name}
            </h2>

            {site.altNames && site.altNames.length > 0 && (
              <div className="text-xs text-[#8C877D] mt-1 italic">
                В источниках: {site.altNames.join(' • ')}
              </div>
            )}
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1.5 no-print">
            <button
              onClick={() => onToggleFavorite(site.id)}
              className={`p-1.5 rounded border transition-colors ${
                isFavorite
                  ? 'bg-[#FDF6E2] border-[#E8DEC8] text-[#9A7514]'
                  : 'bg-white hover:bg-[#FAF8F5] border-[#E8E3D9] text-[#736E64]'
              }`}
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-[#9A7514]' : ''}`} />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded border border-[#E8E3D9] bg-white hover:bg-[#FAF8F5] text-[#736E64] transition-colors"
              title="Печать археологической карточки"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded border border-[#E8E3D9] bg-white hover:bg-[#FAF8F5] text-[#736E64] transition-colors"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Geographical & Chronological Passport Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded border border-[#E8E3D9]">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#8C877D] font-medium flex items-center gap-1 mb-0.5">
                <MapPin className="w-3 h-3 text-[#736E64]" />
                Локализация:
              </div>
              <div className="text-xs font-medium text-[#22201B]">
                {site.region}
              </div>
              <div className="text-[11px] font-mono text-[#8C877D] mt-0.5">
                {site.coordinates.lat.toFixed(3)}° N, {site.coordinates.lng.toFixed(3)}° E
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#8C877D] font-medium flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-[#736E64]" />
                Датировка и культура:
              </div>
              <div className="text-xs font-mono font-medium text-[#22201B]">
                {site.dating.displayLabel}
              </div>
              <div className="text-[11px] text-[#5C574E] mt-0.5">
                {site.culture}
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-[#EFEBE2] flex items-center justify-between text-xs">
              <span className="text-[#8C877D]">Тип памятника:</span>
              <span className="font-medium text-[#22201B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E3D9]">
                {site.siteType}
              </span>
            </div>
          </div>

          {/* Verification Notes warning if applicable */}
          {site.verificationNotes && (
            <div className="p-3 bg-[#FAF5EB] border border-[#E8DEC8] rounded text-xs text-[#7A5A1A] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#9A7514] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-medium">Статус данных: </span>
                {site.verificationNotes}
              </div>
            </div>
          )}

          {/* Activities Badges */}
          <div>
            <h4 className="font-serif font-medium text-xs text-[#5C574E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#736E64]" />
              Хозяйственная и духовная деятельность
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {site.activities.map(act => (
                <div
                  key={act}
                  className="px-2.5 py-1 bg-white rounded border border-[#E8E3D9] text-xs text-[#22201B] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A502C]" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="font-serif font-medium text-xs text-[#5C574E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#736E64]" />
              Основные археологические находки
            </h4>
            <div className="p-3 bg-white rounded border border-[#E8E3D9] text-xs leading-relaxed text-[#22201B]">
              {site.keyFindings}
            </div>
          </div>

          {/* Research History */}
          <div>
            <h4 className="font-serif font-medium text-xs text-[#5C574E] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#736E64]" />
              История изучения и исследователи
            </h4>
            <div className="p-3 bg-white rounded border border-[#E8E3D9] text-xs leading-relaxed text-[#5C574E]">
              {site.researchHistory}
            </div>
          </div>

          {/* Scientific Significance */}
          <div>
            <h4 className="font-serif font-medium text-xs text-[#5C574E] uppercase tracking-wider mb-1.5">
              Значение для исторической науки
            </h4>
            <div className="p-3 bg-[#F4F1EA] rounded border-l-2 border-[#4A502C] text-xs leading-relaxed text-[#22201B]">
              «{site.scientificSignificance}»
            </div>
          </div>

          {/* Literature / Sources */}
          {site.sources && site.sources.length > 0 && (
            <div>
              <h4 className="font-serif font-medium text-xs text-[#8C877D] uppercase tracking-wider mb-1">
                Библиография и источники
              </h4>
              <ul className="space-y-0.5 text-[11px] text-[#736E64] pl-4 list-disc">
                {site.sources.map((src, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {src}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User Notes Section (Persistent in IndexedDB) */}
          <div className="pt-3 border-t border-[#E8E3D9] no-print">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-medium text-xs text-[#5C574E] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#736E64]" />
                Полевая заметка
              </h4>
              {noteSavedMessage && (
                <span className="text-[11px] text-[#2D5A27] font-medium">
                  Сохранено в базе
                </span>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                value={noteContent}
                onChange={(e) => {
                  setNoteContent(e.target.value);
                  setIsEditingNote(true);
                }}
                rows={3}
                placeholder="Добавьте свои комментарии, гипотезы или конспект по данной стоянке..."
                className="w-full text-xs p-2.5 rounded border border-[#E8E3D9] bg-white text-[#22201B] focus:outline-none focus:border-[#4A502C] leading-relaxed resize-none"
              />
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] text-[#8C877D]">
                  Сохраняется локально в IndexedDB
                </span>
                <div className="flex gap-2">
                  {noteContent && (
                    <button
                      onClick={() => {
                        setNoteContent('');
                        onSaveNote(site.id, '');
                      }}
                      className="px-2 py-1 text-xs text-[#8C877D] hover:text-[#22201B] rounded transition-colors"
                    >
                      Очистить
                    </button>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={!isEditingNote}
                    className={`px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                      isEditingNote
                        ? 'bg-[#4A502C] text-white hover:bg-[#3D4224]'
                        : 'bg-[#EAE6DF] text-[#8C877D] cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-3 h-3" />
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
