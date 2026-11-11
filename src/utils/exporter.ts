import { Site } from '../types';
import { GLOSSARY_TERMS } from '../data/glossary';
import { QUIZ_QUESTIONS } from '../data/quiz';

export function generateStandaloneHTML(allSites: Site[]): string {
  const sitesJSON = JSON.stringify(allSites);
  const glossaryJSON = JSON.stringify(GLOSSARY_TERMS);
  const quizJSON = JSON.stringify(QUIZ_QUESTIONS);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Стоянки Средней Азии и Узбекистана: интерактивные схемы</title>
  <meta name="description" content="Интерактивный археологический атлас древних стоянок Средней Азии и Узбекистана. Полностью автономен, работает офлайн.">
  <style>
    :root {
      --bg: #F9F7F3;
      --bg-surface: #FFFFFF;
      --bg-accent: #F4F1EA;
      --khaki: #4A502C;
      --khaki-dark: #3D4224;
      --text: #22201B;
      --gold: #E8E3D9;
      --gold-border: #E8E3D9;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      font-size: 14px;
    }
    h1, h2, h3, h4, .serif {
      font-family: 'Cormorant Garamond', Georgia, serif;
    }
    header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--gold-border);
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .header-title {
      font-size: 20px;
      font-weight: bold;
      color: var(--text);
    }
    .header-sub {
      font-size: 12px;
      color: var(--khaki);
    }
    .btn {
      background: var(--bg-accent);
      border: 1px solid var(--gold-border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s;
    }
    .btn:hover { background: #E5D7BE; }
    .btn-primary {
      background: var(--khaki);
      color: white;
      border-color: var(--khaki-dark);
    }
    .btn-primary:hover { background: var(--khaki-dark); }
    .tabs {
      display: flex;
      gap: 8px;
      margin: 14px 20px 10px;
      border-bottom: 1px solid var(--gold-border);
      padding-bottom: 8px;
      flex-wrap: wrap;
    }
    .tab-btn {
      background: none;
      border: none;
      font-size: 14px;
      padding: 6px 12px;
      cursor: pointer;
      color: #666;
      border-radius: 4px;
    }
    .tab-btn.active {
      background: var(--khaki);
      color: white;
      font-weight: bold;
    }
    .container {
      padding: 0 20px 20px;
      display: grid;
      gap: 15px;
    }
    .search-box {
      margin: 0 20px 10px;
      display: flex;
      gap: 10px;
    }
    .search-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 4px;
      border: 1px solid var(--gold-border);
      background: var(--bg-surface);
      font-size: 14px;
      outline: none;
    }
    .search-input:focus { border-color: var(--khaki); }
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--gold-border);
      border-radius: 6px;
      padding: 16px;
    }
    .site-item {
      padding: 10px;
      border-radius: 4px;
      border: 1px solid rgba(184, 150, 46, 0.2);
      margin-bottom: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.15s;
    }
    .site-item:hover, .site-item.active {
      background: #F4EBDB;
      border-color: var(--khaki);
    }
    .drawer {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      max-width: 580px;
      background: var(--bg-surface);
      border-left: 1px solid var(--gold-border);
      box-shadow: -4px 0 20px rgba(0,0,0,0.15);
      padding: 20px;
      overflow-y: auto;
      z-index: 100;
      display: none;
    }
    .drawer.open { display: block; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      border: 1px solid var(--gold-border);
      background: var(--bg-accent);
      margin-right: 4px;
      margin-bottom: 4px;
    }
    @media (max-width: 768px) {
      .container { padding: 0 10px 10px; }
      .tabs, .search-box, header { margin-left: 10px; margin-right: 10px; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="header-title">Стоянки Средней Азии и Узбекистана: интерактивные схемы</div>
      <div class="header-sub">Автономный академический атлас древней истории региона (без серверов и сборки)</div>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn" onclick="openQuiz()">Викторина</button>
      <button class="btn" onclick="exportJSON()">Экспорт JSON</button>
      <button class="btn" onclick="window.print()">Печать</button>
    </div>
  </header>

  <div class="search-box">
    <input type="text" id="searchInput" class="search-input" placeholder="Умный поиск (опечатки, 'неандерталец', 'пещеры', 'земледелие')..." oninput="filterSites()">
  </div>

  <div class="tabs">
    <button class="tab-btn active" id="tabTerritory" onclick="switchTab('territory')">По территориям и SVG-карта</button>
    <button class="tab-btn" id="tabTimeline" onclick="switchTab('timeline')">По времени (хронология)</button>
    <button class="tab-btn" id="tabActivity" onclick="switchTab('activity')">По деятельности (матрица)</button>
  </div>

  <div class="container" id="mainContent">
    <!-- Populated by JavaScript -->
  </div>

  <!-- Detail Drawer -->
  <div class="drawer" id="siteDrawer">
    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px; border-bottom:1px solid var(--gold-border); padding-bottom:10px;">
      <div>
        <span class="badge" id="drawerEpoch">Эпоха</span>
        <h2 id="drawerName" class="serif" style="font-size:24px; margin-top:4px;">Название</h2>
        <div id="drawerAlt" style="font-size:12px; color:#666; font-style:italic;"></div>
      </div>
      <button class="btn" onclick="closeDrawer()">✕</button>
    </div>
    <div id="drawerBody" style="font-size:13px; line-height:1.6;"></div>
  </div>

  <script>
    // Embedded Data
    const SITES = ${sitesJSON};
    const GLOSSARY = ${glossaryJSON};
    const QUIZ = ${quizJSON};

    let currentTab = 'territory';
    let selectedSiteId = SITES[0] ? SITES[0].id : null;
    let filtered = [...SITES];

    // LocalStorage fallback for notes and favorites
    function getFavorites() {
      try { return JSON.parse(localStorage.getItem('arca_favs') || '[]'); } catch { return []; }
    }
    function toggleFav(id) {
      let favs = getFavorites();
      if (favs.includes(id)) favs = favs.filter(x => x !== id);
      else favs.push(id);
      localStorage.setItem('arca_favs', JSON.stringify(favs));
      render();
      if (selectedSiteId === id) openSite(id);
    }
    function getNote(id) {
      try { return localStorage.getItem('arca_note_' + id) || ''; } catch { return ''; }
    }
    function saveNote(id, text) {
      try { localStorage.setItem('arca_note_' + id, text); } catch {}
      alert('Заметка сохранена локально в браузере!');
    }

    function switchTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'territory') document.getElementById('tabTerritory').classList.add('active');
      if (tab === 'timeline') document.getElementById('tabTimeline').classList.add('active');
      if (tab === 'activity') document.getElementById('tabActivity').classList.add('active');
      render();
    }

    function filterSites() {
      const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
      if (!q) {
        filtered = [...SITES];
      } else {
        filtered = SITES.filter(s => {
          const str = (s.name + ' ' + s.altNames.join(' ') + ' ' + s.country + ' ' + s.region + ' ' + s.culture + ' ' + s.keyFindings + ' ' + s.activities.join(' ')).toLowerCase();
          return str.includes(q) || (q.includes('неандертал') && (s.id === 'teshik-tash' || s.id === 'angilak' || s.id === 'obirakhmat'));
        });
      }
      render();
    }

    function openSite(id) {
      selectedSiteId = id;
      const s = SITES.find(x => x.id === id);
      if (!s) return;
      const d = document.getElementById('siteDrawer');
      document.getElementById('drawerName').innerText = s.name;
      document.getElementById('drawerEpoch').innerText = s.epoch + ' • ' + s.country;
      document.getElementById('drawerAlt').innerText = s.altNames ? s.altNames.join(' • ') : '';

      const isFav = getFavorites().includes(s.id);
      const note = getNote(s.id);

      document.getElementById('drawerBody').innerHTML = \`
        <div style="margin-bottom:12px; background:#FAF5EB; padding:10px; border-radius:4px; border:1px solid rgba(184,150,46,0.25);">
          <div><strong>📍 Локализация:</strong> \${s.region} (\${s.coordinates.lat}° N, \${s.coordinates.lng}° E)</div>
          <div><strong>⏱ Датировка:</strong> \${s.dating.displayLabel}</div>
          <div><strong>🏛 Культура:</strong> \${s.culture}</div>
          <div><strong>🏺 Тип памятника:</strong> \${s.siteType}</div>
          <div><strong>🛡 Достоверность:</strong> \${s.verificationStatus}</div>
        </div>
        <div style="margin-bottom:12px;">
          <strong>Хозяйственная деятельность:</strong><br>
          \${s.activities.map(a => '<span class="badge">' + a + '</span>').join('')}
        </div>
        <div style="margin-bottom:12px;">
          <strong>Основные находки:</strong>
          <p style="background:white; padding:10px; border-radius:4px; border:1px solid #ddd; margin-top:4px;">\${s.keyFindings}</p>
        </div>
        <div style="margin-bottom:12px;">
          <strong>История исследования:</strong>
          <p style="background:white; padding:10px; border-radius:4px; border:1px solid #ddd; margin-top:4px;">\${s.researchHistory}</p>
        </div>
        <div style="margin-bottom:12px;">
          <strong>Значение для науки:</strong>
          <p style="font-style:italic; border-left:3px solid #6B7040; padding-left:8px; margin-top:4px;">\${s.scientificSignificance}</p>
        </div>
        <div style="margin-bottom:15px;">
          <strong>Источники и литература:</strong>
          <ul style="padding-left:18px; margin-top:4px; font-size:12px;">
            \${(s.sources || []).map(src => '<li>' + src + '</li>').join('')}
          </ul>
        </div>
        <div style="border-top:1px solid var(--gold-border); padding-top:10px;">
          <button class="btn \${isFav ? 'btn-primary' : ''}" onclick="toggleFav('\${s.id}')">\${isFav ? '★ В избранном' : '☆ В избранное'}</button>
          <div style="margin-top:10px;">
            <label><strong>Моя заметка:</strong></label>
            <textarea id="noteInput" style="width:100%; height:60px; padding:6px; margin-top:4px; border:1px solid #ccc; border-radius:4px;">\${note}</textarea>
            <button class="btn" style="margin-top:4px;" onclick="saveNote('\${s.id}', document.getElementById('noteInput').value)">Сохранить заметку</button>
          </div>
        </div>
      \`;
      d.classList.add('open');
    }

    function closeDrawer() {
      document.getElementById('siteDrawer').classList.remove('open');
    }

    function render() {
      const container = document.getElementById('mainContent');
      if (currentTab === 'territory') {
        container.innerHTML = \`
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:15px;">
            <div class="card">
              <h3 class="serif" style="font-size:18px; margin-bottom:10px;">Дерево территорий (найдено: \${filtered.length})</h3>
              <div style="max-height:550px; overflow-y:auto;">
                \${filtered.map(s => \`
                  <div class="site-item \${selectedSiteId === s.id ? 'active' : ''}" onclick="openSite('\${s.id}')">
                    <div style="display:flex; justify-content:space-between; font-weight:bold;">
                      <span>\${s.name}</span>
                      <span style="font-size:11px; color:#6B7040;">\${s.country}</span>
                    </div>
                    <div style="font-size:11px; color:#666;">\${s.region}</div>
                    <div style="font-size:11px; color:#888;">\${s.epoch} • \${s.dating.displayLabel}</div>
                  </div>
                \`).join('')}
              </div>
            </div>
            <div class="card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; text-align:center;">
              <h3 class="serif" style="font-size:18px; margin-bottom:8px;">Интерактивная карта памятников</h3>
              <p style="font-size:12px; color:#666; margin-bottom:15px;">Кликните по любой точке стоянки на карте:</p>
              <svg viewBox="0 0 600 400" style="width:100%; max-height:450px; background:#FAF5EB; border:1px solid var(--gold-border); border-radius:6px;">
                <!-- Waterways & Terrain -->
                <path d="M 0 0 L 60 0 C 70 100 50 200 60 400 L 0 400 Z" fill="#B3CCD4" />
                <path d="M 160 140 C 185 130 200 150 205 180 C 210 210 180 230 160 230 C 145 230 140 200 145 160 Z" fill="#B3CCD4" />
                <path d="M 360 300 Q 310 270 230 220" fill="none" stroke="#688B97" stroke-width="2" />
                <path d="M 420 190 Q 330 170 220 150" fill="none" stroke="#688B97" stroke-width="2" />
                <!-- Sites points -->
                \${filtered.map(s => {
                  const x = ((s.coordinates.lng - 52) / 32) * 560 + 20;
                  const y = ((54 - s.coordinates.lat) / 19) * 360 + 20;
                  const isSel = selectedSiteId === s.id;
                  return \`
                    <g onclick="openSite('\${s.id}')" style="cursor:pointer;">
                      <circle cx="\${x}" cy="\${y}" r="\${isSel ? 7 : 5}" fill="\${isSel ? '#B8962E' : '#6B7040'}" stroke="#fff" stroke-width="1.5" />
                      <text x="\${x}" y="\${y - 8}" text-anchor="middle" font-size="9" font-family="serif" fill="#2E2B1F" font-weight="bold">\${s.name}</text>
                    </g>
                  \`;
                }).join('')}
              </svg>
            </div>
          </div>
        \`;
      } else if (currentTab === 'timeline') {
        container.innerHTML = \`
          <div class="card">
            <h3 class="serif" style="font-size:18px; margin-bottom:10px;">Хронологическая периодизация</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
              \${['Нижний палеолит', 'Средний палеолит', 'Верхний палеолит', 'Мезолит', 'Неолит', 'Энеолит', 'Бронзовый век', 'Ранний железный век'].map(ep => {
                const epSites = filtered.filter(s => s.epoch === ep);
                return \`
                  <div style="background:#FAF5EB; border:1px solid var(--gold-border); border-top:3px solid #6B7040; border-radius:4px; padding:10px;">
                    <strong class="serif" style="font-size:15px;">\${ep}</strong>
                    <div style="font-size:11px; color:#6B7040; margin-bottom:8px;">Памятников: \${epSites.length}</div>
                    \${epSites.map(s => \`
                      <div class="site-item" onclick="openSite('\${s.id}')" style="margin-bottom:6px; font-size:12px;">
                        <strong>\${s.name}</strong> (\${s.country})<br>
                        <span style="font-size:10px; color:#666;">\${s.culture}</span>
                      </div>
                    \`).join('')}
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        \`;
      } else if (currentTab === 'activity') {
        const cats = ['Охота', 'Рыболовство', 'Скотоводство', 'Земледелие', 'Кремнёвая индустрия', 'Керамика', 'Металлургия', 'Погребальные практики', 'Культ и наскальное искусство', 'Обмен и торговля'];
        container.innerHTML = \`
          <div class="card">
            <h3 class="serif" style="font-size:18px; margin-bottom:10px;">Кластеры деятельности</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
              \${cats.map(cat => {
                const catSites = filtered.filter(s => s.activities.includes(cat));
                return \`
                  <div style="background:#FAF5EB; border:1px solid var(--gold-border); border-radius:4px; padding:10px;">
                    <strong class="serif" style="font-size:15px; color:#4A4E2A;">\${cat} (\${catSites.length})</strong>
                    <div style="margin-top:6px; max-height:200px; overflow-y:auto;">
                      \${catSites.map(s => \`
                        <div class="site-item" onclick="openSite('\${s.id}')" style="margin-bottom:4px; font-size:11px;">
                          \${s.name} — <span style="color:#666;">\${s.epoch}</span>
                        </div>
                      \`).join('')}
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        \`;
      }
    }

    function openQuiz() {
      const q = QUIZ[0];
      const ans = prompt(q.question + '\\n\\n' + q.options.map((o, i) => (i + 1) + '. ' + o).join('\\n') + '\\n\\nВведите номер ответа (1-' + q.options.length + '):');
      if (ans) {
        const idx = parseInt(ans) - 1;
        if (idx === q.correctIndex) {
          alert('Верно! ' + q.explanation);
        } else {
          alert('Неверно. ' + q.explanation);
        }
      }
    }

    function exportJSON() {
      const blob = new Blob([JSON.stringify({ sites: SITES, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'archaeology_central_asia_export.json';
      a.click();
    }

    // Initial render
    render();
  </script>
</body>
</html>`;
}
