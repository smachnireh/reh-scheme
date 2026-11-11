import { useState } from 'react';
import { Site, Country, Epoch, SiteType, Activity, VerificationStatus } from '../types';
import { EPOCHS_ORDER } from '../data/sites';
import { X, Plus, AlertCircle, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddSite: (site: Site) => void;
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

const ALL_ACTIVITIES: Activity[] = [
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

export function AddSiteModal({ isOpen, onClose, onAddSite }: Props) {
  const [name, setName] = useState('');
  const [altNames, setAltNames] = useState('');
  const [country, setCountry] = useState<Country>('Узбекистан');
  const [region, setRegion] = useState('');
  const [lat, setLat] = useState('39.5');
  const [lng, setLng] = useState('66.9');
  const [epoch, setEpoch] = useState<Epoch>('Средний палеолит');
  const [culture, setCulture] = useState('');
  const [datingLabel, setDatingLabel] = useState('ок. 50 000 — 40 000 лет назад');
  const [fromBP, setFromBP] = useState('50000');
  const [toBP, setToBP] = useState('40000');
  const [siteType, setSiteType] = useState<SiteType>('Грот / Навес');
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>(['Охота', 'Кремнёвая индустрия']);
  const [keyFindings, setKeyFindings] = useState('');
  const [researchHistory, setResearchHistory] = useState('');
  const [significance, setSignificance] = useState('');
  const [sources, setSources] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('Требует проверки');
  const [verificationNotes, setVerificationNotes] = useState('Добавлено пользователем через форму');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleActivity = (act: Activity) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter(a => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Укажите название стоянки');
      return;
    }
    if (!region.trim()) {
      setError('Укажите регион или область');
      return;
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Введите корректные числовые координаты (широта и долгота)');
      return;
    }

    const newSite: Site = {
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-zа-я0-9]/gi, '')}`,
      name: name.trim(),
      altNames: altNames.split(',').map(s => s.trim()).filter(Boolean),
      country,
      region: region.trim(),
      coordinates: { lat: parsedLat, lng: parsedLng },
      epoch,
      culture: culture.trim() || 'Локальный комплекс',
      dating: {
        fromYearsBP: parseInt(fromBP) || 10000,
        toYearsBP: parseInt(toBP) || 5000,
        displayLabel: datingLabel.trim() || 'Датировка уточняется',
        approximate: true
      },
      siteType,
      activities: selectedActivities.length > 0 ? selectedActivities : ['Охота'],
      keyFindings: keyFindings.trim() || 'Описание находок в процессе уточнения',
      researchHistory: researchHistory.trim() || 'Информация исследователей уточняется',
      scientificSignificance: significance.trim() || 'Региональный археологический памятник',
      sources: sources.split('\n').map(s => s.trim()).filter(Boolean),
      verificationStatus,
      verificationNotes: verificationNotes.trim(),
      isCustom: true
    };

    onAddSite(newSite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs modal-backdrop" onClick={onClose} />
      
      <div className="relative bg-white text-[#22201B] border border-[#E8E3D9] rounded shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-[#E8E3D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#4A502C]" />
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Внесение новой стоянки в базу данных
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#FAF8F5] rounded text-[#8C877D] hover:text-[#22201B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Название памятника *:
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="напр., Ангилак, Ходжакент"
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Варианты названия (через запятую):
              </label>
              <input
                type="text"
                value={altNames}
                onChange={e => setAltNames(e.target.value)}
                placeholder="напр., Angilak, Ongiloq"
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Страна *:
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value as Country)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Регион / урочище *:
              </label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="напр., Сурхандарьинская обл., Байсунтау"
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Широта (Lat, 35-55° N):
              </label>
              <input
                type="text"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Долгота (Lng, 52-85° E):
              </label>
              <input
                type="text"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Эпоха *:
              </label>
              <select
                value={epoch}
                onChange={e => setEpoch(e.target.value as Epoch)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              >
                {EPOCHS_ORDER.map(ep => <option key={ep} value={ep}>{ep}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Культура / Горизонт:
              </label>
              <input
                type="text"
                value={culture}
                onChange={e => setCulture(e.target.value)}
                placeholder="напр., Мустьерская, Кельтеминарская"
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Отображаемая датировка:
              </label>
              <input
                type="text"
                value={datingLabel}
                onChange={e => setDatingLabel(e.target.value)}
                placeholder="ок. 70 000 — 40 000 лет назад"
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Тип памятника:
              </label>
              <select
                value={siteType}
                onChange={e => setSiteType(e.target.value as SiteType)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              >
                {SITE_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>

          {/* Activities Selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1.5">
              Хозяйственная и духовная деятельность:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ACTIVITIES.map(act => {
                const isSelected = selectedActivities.includes(act);
                return (
                  <button
                    key={act}
                    type="button"
                    onClick={() => toggleActivity(act)}
                    className={`px-2.5 py-0.5 rounded border text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#4A502C] text-white border-[#3D4224]'
                        : 'bg-white hover:bg-[#FAF8F5] text-[#22201B] border-[#E8E3D9]'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{act}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Findings */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
              Основные находки:
            </label>
            <textarea
              rows={2}
              value={keyFindings}
              onChange={e => setKeyFindings(e.target.value)}
              placeholder="Кремнёвые орудия, кости фауны, керамика, захоронения..."
              className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none resize-none"
            />
          </div>

          {/* Research & Significance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Кто и когда исследовал:
              </label>
              <textarea
                rows={2}
                value={researchHistory}
                onChange={e => setResearchHistory(e.target.value)}
                placeholder="Имя археолога, годы экспедиции..."
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Значение для науки:
              </label>
              <textarea
                rows={2}
                value={significance}
                onChange={e => setSignificance(e.target.value)}
                placeholder="Почему данный памятник важен..."
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Verification Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#EFEBE2]">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Уровень достоверности:
              </label>
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              >
                <option value="Подтверждено">Подтверждено</option>
                <option value="Требует проверки">Требует проверки</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#8C877D] font-medium mb-1">
                Примечание по достоверности:
              </label>
              <input
                type="text"
                value={verificationNotes}
                onChange={e => setVerificationNotes(e.target.value)}
                className="w-full p-2 bg-white rounded border border-[#E8E3D9] focus:border-[#4A502C] focus:outline-none"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E3D9]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded text-xs text-[#5C574E] hover:text-[#22201B] hover:bg-[#FAF8F5] border border-[#E8E3D9] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Сохранить стоянку в базе
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
