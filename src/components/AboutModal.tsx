import { useState, useRef, ChangeEvent } from 'react';
import { Site } from '../types';
import { exportUserDataAsJSON, importUserDataFromJSON } from '../storage/db';
import { generateStandaloneHTML } from '../utils/exporter';
import {
  Info,
  X,
  Download,
  Upload,
  FileCode,
  Globe,
  Database,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Github,
  BookOpen
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allSites: Site[];
  onDataImported: () => void;
}

export function AboutModal({ isOpen, onClose, allSites, onDataImported }: Props) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const json = await exportUserDataAsJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archaeology_central_asia_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadStandaloneHTML = () => {
    const html = generateStandaloneHTML(allSites);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      const res = await importUserDataFromJSON(content);
      if (res.success) {
        setImportStatus(`Успешно импортировано! Добавлено ${res.count} пользовательских стоянок.`);
        onDataImported();
      } else {
        setImportStatus(`Ошибка импорта: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/45 backdrop-blur-2xs modal-backdrop" onClick={onClose} />

      <div className="relative bg-white text-[#22201B] border border-[#E8E3D9] rounded shadow-xl max-w-2xl w-full max-h-[90vh] z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-[#E8E3D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#4A502C]" />
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              О проекте, данных и автономной работе
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#FAF8F5] rounded text-[#8C877D] hover:text-[#22201B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Academic Disclaimer */}
          <div className="p-3 bg-[#FAF5EB] border border-[#E8DEC8] rounded text-[#7A5A1A] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#9A7514] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-medium">Академическое предупреждение: </span>
              Материалы данного веб-атласа подготовлены в учебно-просветительских целях. Приведённые датировки (особенно раннего палеолита), координаты и культурная принадлежность отражают современный консенсус либо доминирующие гипотезы, однако по ряду памятников (Селунгур, Бозсу) в академической среде продолжаются научные дискуссии. Для профессиональных исследований обращайтесь к первоисточникам и академическим публикациям Института археологических исследований АН Узбекистана (г. Самарканд).
            </div>
          </div>

          {/* Offline & Architecture */}
          <div className="bg-[#FAF8F5] p-3.5 rounded border border-[#E8E3D9] space-y-1.5">
            <h4 className="font-serif font-medium text-sm text-[#22201B] flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#4A502C]" />
              Клиентская архитектура без серверов
            </h4>
            <p className="text-[#5C574E] leading-relaxed">
              Приложение спроектировано для автономной работы:
            </p>
            <ul className="space-y-1 list-disc pl-5 text-[#5C574E] leading-relaxed">
              <li><strong>База стоянок:</strong> встроенный в код валидированный массив данных.</li>
              <li><strong>Векторная карта:</strong> выполнена на чистом SVG без внешних тайловых серверов, благодаря чему работает в полевых экспедициях без подключения к сети.</li>
              <li><strong>Пользовательские данные:</strong> заметки, статус избранного и внесённые вами стоянки сохраняются на вашем устройстве в <strong>IndexedDB</strong>.</li>
            </ul>
          </div>

          {/* Import / Export & Single-File HTML Download */}
          <div className="p-3.5 bg-white rounded border border-[#E8E3D9] space-y-2.5">
            <h4 className="font-serif font-medium text-sm text-[#22201B] flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5 text-[#4A502C]" />
              Резервное копирование и экспорт в 1 клик
            </h4>

            {importStatus && (
              <div className="p-2 bg-[#F4F8F4] border border-[#D0E2CF] text-[#2D5A27] rounded text-xs">
                {importStatus}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadStandaloneHTML}
                className="px-3 py-1.5 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Скачать полностью самодостаточный index.html файл"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать автономный index.html</span>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={isExporting}
                className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] text-[#22201B] rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#736E64]" />
                <span>Экспорт данных в JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E3D9] text-[#22201B] rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#736E64]" />
                <span>Импорт из JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2.5 pt-2 border-t border-[#E8E3D9] text-xs">
            <h4 className="font-serif font-medium text-xs text-[#5C574E] uppercase tracking-wider">
              Краткое руководство пользователя
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[#22201B]">
              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E8E3D9]">
                <div className="font-medium text-[#22201B] mb-1">
                  1. Как открыть файл без сервера:
                </div>
                <div className="text-[11px] text-[#5C574E] leading-relaxed">
                  Дважды кликните по сохранённому файлу <code>index.html</code>. Он мгновенно откроется в Chrome, Safari, Firefox или Яндекс.Браузере без интернета и без командной строки.
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E8E3D9]">
                <div className="font-medium text-[#22201B] mb-1">
                  2. Добавление новой стоянки:
                </div>
                <div className="text-[11px] text-[#5C574E] leading-relaxed">
                  Нажмите <strong>«+ Добавить стоянку»</strong> в верхней панели. Заполните поля паспорта памятника — он сразу появится в дереве, на SVG-карте, на шкале времени и в матрице.
                </div>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded border border-[#E8E3D9] sm:col-span-2">
                <div className="font-medium text-[#22201B] mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-[#4A502C]" />
                  <span>3. Публикация на GitHub Pages (для смартфонов):</span>
                </div>
                <ol className="text-[11px] text-[#5C574E] list-decimal pl-4 space-y-0.5 leading-relaxed">
                  <li>Зайдите на <a href="https://github.com" target="_blank" rel="noreferrer" className="underline text-[#4A502C]">github.com</a> и создайте новый публичный репозиторий (напр. <code>central-asia-sites</code>).</li>
                  <li>Загрузите скачанный файл <code>index.html</code> в корень репозитория.</li>
                  <li>В репозитории перейдите в <strong>Settings → Pages</strong>, в блоке <em>Branch</em> выберите <code>main</code> (папка <code>/root</code>) и нажмите <strong>Save</strong>.</li>
                  <li>Через минуту сайт доступен по постоянной ссылке и адаптирован для любых мобильных экранов.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E8E3D9] bg-[#FAF8F5] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-[#4A502C] hover:bg-[#3D4224] text-white rounded text-xs font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
