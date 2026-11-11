import { Site, Country, Epoch, SiteType, Activity } from '../types';

// Bidirectional transliteration map
const CYR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o\'', ғ: 'g\'', қ: 'q', ҳ: 'h'
};

const LAT_TO_CYR: [RegExp, string][] = [
  [/shch/gi, 'щ'],
  [/kh/gi, 'х'],
  [/zh/gi, 'ж'],
  [/ch/gi, 'ч'],
  [/sh/gi, 'ш'],
  [/yo/gi, 'ё'],
  [/yu/gi, 'ю'],
  [/ya/gi, 'я'],
  [/ts/gi, 'ц'],
  [/a/gi, 'а'], [/b/gi, 'б'], [/c/gi, 'к'], [/d/gi, 'д'], [/e/gi, 'е'],
  [/f/gi, 'ф'], [/g/gi, 'г'], [/h/gi, 'х'], [/i/gi, 'и'], [/j/gi, 'дж'],
  [/k/gi, 'к'], [/l/gi, 'л'], [/m/gi, 'м'], [/n/gi, 'н'], [/o/gi, 'о'],
  [/p/gi, 'п'], [/q/gi, 'к'], [/r/gi, 'р'], [/s/gi, 'с'], [/t/gi, 'т'],
  [/u/gi, 'у'], [/v/gi, 'в'], [/w/gi, 'в'], [/x/gi, 'х'], [/y/gi, 'й'],
  [/z/gi, 'з']
];

export function transliterate(text: string): { latin: string; cyrillic: string } {
  const lower = text.toLowerCase();
  
  // Cyrillic to Latin
  let latin = '';
  for (const char of lower) {
    latin += CYR_TO_LAT[char] ?? char;
  }

  // Latin to Cyrillic
  let cyrillic = lower;
  for (const [pattern, repl] of LAT_TO_CYR) {
    cyrillic = cyrillic.replace(pattern, repl);
  }

  return { latin, cyrillic };
}

// Light Russian Stemmer (removes common inflection suffixes)
export function stemRussian(word: string): string {
  let w = word.toLowerCase().trim();
  if (w.length < 4) return w;

  // common adjective / noun / case endings
  const suffixes = [
    'иями', 'ями', 'ами', 'еми', 'ейшего', 'ейшая', 'ейшее',
    'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ых', 'их',
    'ую', 'юю', 'ая', 'яя', 'ое', 'ее', 'ом', 'ем', 'ам', 'ям',
    'ов', 'ев', 'ей', 'ах', 'ях', 'ые', 'ие',
    'ов', 'ев', 'ин', 'ый', 'ий', 'ой', 'а', 'е', 'и', 'о', 'у', 'ы', 'я', 'ь'
  ];

  for (const s of suffixes) {
    if (w.endsWith(s) && w.length - s.length >= 3) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  return w;
}

// Semantic synonyms dictionary
const SYNONYMS: Record<string, { siteIds?: string[]; relatedKeywords: string[] }> = {
  'неандерталец': {
    siteIds: ['teshik-tash', 'angilak', 'obirakhmat'],
    relatedKeywords: ['мустье', 'мустьерская', 'средний палеолит', 'гоминид', 'ребёнок']
  },
  'петроглифы': {
    siteIds: ['zarautsay', 'sarmyshsay', 'saimaluu-tash', 'tanbaly'],
    relatedKeywords: ['наскальные', 'рисунки', 'писаницы', 'охра', 'гравюры', 'святилище']
  },
  'лошадь': {
    siteIds: ['botai', 'tanbaly'],
    relatedKeywords: ['конь', 'кумыс', 'коневодство', 'одомашнивание', 'псалии']
  },
  'кумыс': {
    siteIds: ['botai'],
    relatedKeywords: ['лошадь', 'кобылье', 'молоко', 'ботайская']
  },
  'храм': {
    siteIds: ['djarkutan', 'gonurdepe', 'altyndepe', 'koy-krylgan-kala'],
    relatedKeywords: ['святилище', 'огонь', 'алтарь', 'зиккурат', 'жрец']
  },
  'рыболовство': {
    siteIds: ['dzhanbas-kala-4', 'tutkaul', 'dam-dam-cheshme'],
    relatedKeywords: ['гарпун', 'рыба', 'сом', 'сазан', 'раковины', 'дельты']
  },
  'бронза': {
    siteIds: ['sapallitepa', 'djarkutan', 'bustan-6', 'altyndepe', 'gonurdepe', 'sarazm'],
    relatedKeywords: ['бронзовый', 'металлургия', 'бмак', 'бактрия', 'маргиана', 'сапалли']
  },
  'земледелие': {
    siteIds: ['jeitun', 'sarazm', 'chust', 'sapallitepa', 'anau', 'namazga-depe'],
    relatedKeywords: ['зерно', 'пшеница', 'ячмень', 'серп', 'зернотёрка', 'сырец', 'ирригация']
  },
  'череп': {
    siteIds: ['teshik-tash', 'obirakhmat', 'angilak', 'sarazm'],
    relatedKeywords: ['скелет', 'погребение', 'гоминид', 'антропология', 'неандерталец']
  },
  'кремень': {
    siteIds: ['uchtut', 'kulbulak', 'obirakhmat', 'teshik-tash', 'machay'],
    relatedKeywords: ['карьер', 'мастерская', 'нуклеус', 'леваллуа', 'микролит', 'отбойник']
  }
};

// Natural language intent extraction
export interface ParsedQuery {
  raw: string;
  cleanedText: string;
  inferredCountry?: Country;
  inferredEpoch?: Epoch;
  inferredSiteType?: SiteType;
  inferredActivity?: Activity;
}

export function parseNaturalQuery(query: string): ParsedQuery {
  const raw = query.trim();
  const lower = raw.toLowerCase();

  let inferredCountry: Country | undefined;
  if (lower.includes('узбекистан')) inferredCountry = 'Узбекистан';
  else if (lower.includes('казахстан')) inferredCountry = 'Казахстан';
  else if (lower.includes('кыргызстан') || lower.includes('киргиз')) inferredCountry = 'Кыргызстан';
  else if (lower.includes('таджикистан')) inferredCountry = 'Таджикистан';
  else if (lower.includes('туркменистан') || lower.includes('туркмения')) inferredCountry = 'Туркменистан';

  let inferredEpoch: Epoch | undefined;
  if (lower.includes('ранний палеолит') || lower.includes('нижний палеолит') || lower.includes('ашель')) inferredEpoch = 'Нижний палеолит';
  else if (lower.includes('средний палеолит') || lower.includes('мустье')) inferredEpoch = 'Средний палеолит';
  else if (lower.includes('верхний палеолит') || lower.includes('поздний палеолит')) inferredEpoch = 'Верхний палеолит';
  else if (lower.includes('мезолит')) inferredEpoch = 'Мезолит';
  else if (lower.includes('неолит')) inferredEpoch = 'Неолит';
  else if (lower.includes('энеолит') || lower.includes('медно')) inferredEpoch = 'Энеолит';
  else if (lower.includes('бронз') || lower.includes('бмак')) inferredEpoch = 'Бронзовый век';
  else if (lower.includes('желез') || lower.includes('раннее железо')) inferredEpoch = 'Ранний железный век';

  let inferredSiteType: SiteType | undefined;
  if (lower.includes('пещер')) inferredSiteType = 'Пещера';
  else if (lower.includes('грот') || lower.includes('навес')) inferredSiteType = 'Грот / Навес';
  else if (lower.includes('петроглиф') || lower.includes('наскальн')) inferredSiteType = 'Наскальные рисунки (петроглифы)';
  else if (lower.includes('городищ') || lower.includes('поселен')) inferredSiteType = 'Поселение / Городище';
  else if (lower.includes('могильн') || lower.includes('некропол')) inferredSiteType = 'Могильник / Некрополь';
  else if (lower.includes('мастерск') || lower.includes('карьер') || lower.includes('рудо')) inferredSiteType = 'Кремнёвая мастерская / Карьер';

  let inferredActivity: Activity | undefined;
  if (lower.includes('земледел') || lower.includes('зерно')) inferredActivity = 'Земледелие';
  else if (lower.includes('рыболов') || lower.includes('рыб')) inferredActivity = 'Рыболовство';
  else if (lower.includes('скотовод') || lower.includes('коневод')) inferredActivity = 'Скотоводство';
  else if (lower.includes('металлург') || lower.includes('плавк')) inferredActivity = 'Металлургия';
  else if (lower.includes('охот')) inferredActivity = 'Охота';

  return {
    raw,
    cleanedText: raw,
    inferredCountry,
    inferredEpoch,
    inferredSiteType,
    inferredActivity
  };
}

// Levenshtein distance for fuzzy matching
export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

export interface SearchFilters {
  country?: string;
  epoch?: string;
  culture?: string;
  siteType?: string;
  activity?: string;
  minYearBP?: number;
  maxYearBP?: number;
  verificationStatus?: string;
  onlyFavorites?: boolean;
}

export interface SearchResult {
  site: Site;
  score: number;
  matchedHighlights: string[];
}

export function searchSites(
  sites: Site[],
  query: string,
  filters: SearchFilters = {},
  favoriteIds: string[] = []
): SearchResult[] {
  const parsed = parseNaturalQuery(query);
  const qClean = parsed.cleanedText.trim();
  const qTokens = qClean.toLowerCase().split(/[\s,.-]+/).filter(Boolean);
  const { latin: qLatin, cyrillic: qCyrillic } = transliterate(qClean);

  // Active filters (combining manual filters and natural query extractions)
  const effectiveCountry = filters.country || parsed.inferredCountry;
  const effectiveEpoch = filters.epoch || parsed.inferredEpoch;
  const effectiveSiteType = filters.siteType || parsed.inferredSiteType;
  const effectiveActivity = filters.activity || parsed.inferredActivity;

  const results: SearchResult[] = [];

  for (const site of sites) {
    // Hard filter checks
    if (filters.onlyFavorites && !favoriteIds.includes(site.id)) continue;
    if (effectiveCountry && site.country !== effectiveCountry) continue;
    if (effectiveEpoch && site.epoch !== effectiveEpoch) continue;
    if (filters.culture && !site.culture.toLowerCase().includes(filters.culture.toLowerCase())) continue;
    if (effectiveSiteType && site.siteType !== effectiveSiteType) continue;
    if (effectiveActivity && !site.activities.includes(effectiveActivity as Activity)) continue;
    if (filters.verificationStatus && site.verificationStatus !== filters.verificationStatus) continue;
    if (filters.minYearBP !== undefined && site.dating.fromYearsBP < filters.minYearBP) continue;
    if (filters.maxYearBP !== undefined && site.dating.toYearsBP > filters.maxYearBP) continue;

    // If query is empty, all filtered sites score equally
    if (qTokens.length === 0) {
      results.push({ site, score: 10, matchedHighlights: [] });
      continue;
    }

    let score = 0;
    const highlights: string[] = [];

    const siteNameLower = site.name.toLowerCase();
    const siteNameClean = siteNameLower.replace(/[-]/g, ' ');
    const altNamesCombined = site.altNames.join(' ').toLowerCase();
    const allSearchable = [
      site.name,
      ...site.altNames,
      site.region,
      site.culture,
      site.epoch,
      site.siteType,
      site.keyFindings,
      site.researchHistory,
      site.scientificSignificance,
      ...site.activities
    ].join(' ').toLowerCase();

    // 1. Direct name match
    if (siteNameLower === qClean.toLowerCase() || siteNameClean === qClean.toLowerCase()) {
      score += 150;
      highlights.push(`Точное совпадение: «${site.name}»`);
    } else if (siteNameLower.includes(qClean.toLowerCase()) || siteNameClean.includes(qClean.toLowerCase())) {
      score += 90;
      highlights.push(`Вхождение в название: «${site.name}»`);
    }

    // 2. Transliteration match (e.g. user typed "teshik" or "тешик")
    if (altNamesCombined.includes(qLatin) || altNamesCombined.includes(qCyrillic)) {
      score += 80;
      highlights.push(`Совпадение по транслитерации`);
    }

    // 3. Synonym matching
    for (const [synWord, synData] of Object.entries(SYNONYMS)) {
      if (qClean.toLowerCase().includes(synWord)) {
        if (synData.siteIds?.includes(site.id)) {
          score += 70;
          highlights.push(`Тематическая связь: «${synWord}»`);
        }
        for (const kw of synData.relatedKeywords) {
          if (allSearchable.includes(kw)) {
            score += 25;
            break;
          }
        }
      }
    }

    // 4. Token-by-token matching with stemming & fuzzy distance
    for (const token of qTokens) {
      const stem = stemRussian(token);

      // Exact substring in site fields
      if (siteNameLower.includes(token)) {
        score += 40;
      } else if (altNamesCombined.includes(token)) {
        score += 30;
      } else if (site.culture.toLowerCase().includes(token)) {
        score += 25;
        highlights.push(`Культура: ${site.culture}`);
      } else if (site.region.toLowerCase().includes(token)) {
        score += 20;
        highlights.push(`Регион: ${site.region}`);
      } else if (site.keyFindings.toLowerCase().includes(token)) {
        score += 20;
        highlights.push(`Находки`);
      } else if (allSearchable.includes(token)) {
        score += 15;
      } else if (allSearchable.includes(stem)) {
        // Stem hit
        score += 12;
      } else {
        // Fuzzy match against site name or alt names
        const words = siteNameLower.split(/[\s,.-]+/);
        for (const w of words) {
          if (Math.abs(w.length - token.length) <= 2 && token.length >= 4) {
            const dist = levenshtein(w, token);
            if (dist === 1) {
              score += 25;
              highlights.push(`Похожее: ${w}`);
              break;
            } else if (dist === 2 && token.length >= 6) {
              score += 15;
              break;
            }
          }
        }
      }
    }

    if (score > 0) {
      results.push({
        site,
        score,
        matchedHighlights: Array.from(new Set(highlights))
      });
    }
  }

  // Sort descending by relevance score
  return results.sort((a, b) => b.score - a.score);
}
