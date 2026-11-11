import { useState, useMemo, useRef, MouseEvent, TouchEvent } from 'react';
import { Site, Country } from '../types';
import { EPOCH_COLORS } from '../data/sites';
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Sparkles
} from 'lucide-react';

interface Props {
  sites: Site[];
  filteredSites: Site[];
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
}

// Convert Lat/Lng to SVG Canvas coords (ViewBox: 0 0 940 600)
// Lng span: 51.0 -> 85.0 (34.0 deg)
// Lat span: 35.0 -> 54.5 (19.5 deg)
function projectGeo(lat: number, lng: number): { x: number; y: number } {
  const minLng = 51.0;
  const maxLng = 85.0;
  const minLat = 35.0;
  const maxLat = 54.5;

  const clampLng = Math.max(minLng, Math.min(maxLng, lng));
  const clampLat = Math.max(minLat, Math.min(maxLat, lat));

  const x = ((clampLng - minLng) / (maxLng - minLng)) * 880 + 30;
  const y = ((maxLat - clampLat) / (maxLat - minLat)) * 540 + 30;

  return { x, y };
}

export function TerritoryScheme({
  sites,
  filteredSites,
  selectedSiteId,
  onSelectSite
}: Props) {
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({
    'Узбекистан': true,
    'Казахстан': false,
    'Кыргызстан': false,
    'Таджикистан': false,
    'Туркменистан': false
  });
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    'Сурхандарьинская область (хребет Байсунтау)': true,
    'Ташкентская область (Бостанлыкский район, река Пальтау)': true
  });

  const [hoveredSite, setHoveredSite] = useState<Site | null>(null);

  // SVG Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const filteredIdsSet = useMemo(() => new Set(filteredSites.map(s => s.id)), [filteredSites]);

  // Group sites by Country -> Region
  const hierarchy = useMemo(() => {
    const tree: Record<Country, Record<string, Site[]>> = {
      'Узбекистан': {},
      'Казахстан': {},
      'Кыргызстан': {},
      'Таджикистан': {},
      'Туркменистан': {}
    };

    for (const site of sites) {
      if (!tree[site.country]) tree[site.country] = {};
      if (!tree[site.country][site.region]) tree[site.country][site.region] = [];
      tree[site.country][site.region].push(site);
    }
    return tree;
  }, [sites]);

  const toggleCountry = (country: string) => {
    setExpandedCountries(prev => ({ ...prev, [country]: !prev[country] }));
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({ ...prev, [region]: !prev[region] }));
  };

  // Map mouse / touch drag handlers
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(3.5, Math.max(0.7, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[620px]">
      {/* LEFT: HIERARCHICAL TREE (4 COLS) */}
      <div className="lg:col-span-4 bg-white border border-[#E8E3D9] rounded p-3.5 flex flex-col h-full shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#EFEBE2] mb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#736E64]" />
            <h3 className="font-serif font-medium text-base text-[#22201B]">
              Территории и памятники
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#736E64] bg-[#F4F1EA] px-1.5 py-0.5 rounded">
            {filteredSites.length} из {sites.length}
          </span>
        </div>

        {/* Tree List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-1.5 text-xs">
          {Object.entries(hierarchy).map(([country, regions]) => {
            const countrySites = Object.values(regions).flat();
            const countryFilteredCount = countrySites.filter(s => filteredIdsSet.has(s.id)).length;
            const isCountryExpanded = expandedCountries[country];

            return (
              <div
                key={country}
                className="border border-[#EFEBE2] rounded overflow-hidden"
              >
                {/* Country Header */}
                <button
                  onClick={() => toggleCountry(country)}
                  className="w-full flex items-center justify-between p-2 text-left hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-medium text-[#22201B]">
                    {isCountryExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-[#8C877D]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#8C877D]" />
                    )}
                    <span>{country}</span>
                  </div>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-mono ${countryFilteredCount > 0 ? 'bg-[#F4F1EA] text-[#423E36]' : 'text-neutral-300'}`}>
                    {countryFilteredCount}
                  </span>
                </button>

                {/* Regions */}
                {isCountryExpanded && (
                  <div className="pl-3.5 pr-2 pb-2 space-y-1 border-t border-[#F2EEE6] bg-[#FAF8F5]/50 pt-1">
                    {Object.entries(regions).map(([region, regionSites]) => {
                      const regionFilteredCount = regionSites.filter(s => filteredIdsSet.has(s.id)).length;
                      const isRegionExpanded = expandedRegions[region];

                      return (
                        <div key={region} className="border-l border-[#E2DDD3] pl-2 my-1">
                          <button
                            onClick={() => toggleRegion(region)}
                            className="w-full flex items-center justify-between py-1 text-left text-[11px] text-[#5C574E] hover:text-[#22201B]"
                          >
                            <span className="truncate pr-1.5 font-medium" title={region}>
                              {region}
                            </span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              ({regionFilteredCount})
                            </span>
                          </button>

                          {/* Sites inside region */}
                          {isRegionExpanded && (
                            <div className="pl-1.5 space-y-0.5 mt-0.5">
                              {regionSites.map(site => {
                                const isSelected = selectedSiteId === site.id;
                                const isMatch = filteredIdsSet.has(site.id);
                                const epochStyle = EPOCH_COLORS[site.epoch] || { dot: '#888' };

                                return (
                                  <button
                                    key={site.id}
                                    onClick={() => onSelectSite(site.id)}
                                    className={`w-full flex items-center justify-between text-left px-2 py-1 rounded text-xs transition-colors ${
                                      isSelected
                                        ? 'bg-[#4A502C] text-white font-medium'
                                        : isMatch
                                        ? 'hover:bg-[#EFEBE2] text-[#22201B]'
                                        : 'opacity-35 hover:opacity-75 text-neutral-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: epochStyle.dot }}
                                        title={site.epoch}
                                      />
                                      <span className="truncate">{site.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono shrink-0 ml-1 ${isSelected ? 'text-stone-200' : 'text-neutral-400'}`}>
                                      {site.dating.displayLabel.split('(')[0].trim().slice(0, 12)}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: INTERACTIVE REGIONAL TOPOGRAPHICAL SVG MAP (8 COLS) */}
      <div className="lg:col-span-8 bg-white border border-[#E8E3D9] rounded relative flex flex-col h-full overflow-hidden shadow-2xs">
        {/* Map Header & Controls */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded border border-[#E2DDD3] text-xs shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-[#596038]" />
          <span className="font-serif font-medium text-[#22201B]">
            Векторная карта стоянок
          </span>
          <span className="text-[11px] text-[#8C877D] ml-1 hidden sm:inline">
            (зум / перетаскивание)
          </span>
        </div>

        {/* Map Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-0.5 bg-white/95 p-0.5 rounded border border-[#E2DDD3] shadow-2xs">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 hover:bg-[#F4F1EA] rounded text-[#423E36] transition-colors"
            title="Приблизить"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 hover:bg-[#F4F1EA] rounded text-[#423E36] transition-colors"
            title="Отдалить"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 hover:bg-[#F4F1EA] rounded text-[#423E36] transition-colors"
            title="Сбросить масштаб"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Epoch legend bar along bottom of map */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-white/95 px-3 py-1.5 rounded border border-[#E2DDD3] text-[11px] flex items-center justify-between flex-wrap gap-2 shadow-2xs">
          <div className="flex items-center gap-3 overflow-x-auto py-0.5">
            <span className="text-[#736E64] font-medium shrink-0">Эпохи:</span>
            {Object.entries(EPOCH_COLORS).map(([epoch, col]) => (
              <div key={epoch} className="flex items-center gap-1 shrink-0">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: col.dot }}
                />
                <span className="text-[#423E36] whitespace-nowrap text-[10px]">{epoch}</span>
              </div>
            ))}
          </div>
          <span className="font-mono text-[10px] text-neutral-400 hidden md:inline">
            SVG
          </span>
        </div>

        {/* SVG Viewport */}
        <div
          className="flex-1 w-full h-full cursor-grab active:cursor-grabbing select-none relative overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 940 600"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '50% 50%',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            <defs>
              <pattern id="mountainHatch" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 0 12 L 6 0 L 12 12" fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base landmass backdrop - clean soft ivory */}
            <rect x="0" y="0" width="940" height="600" fill="#FAF8F5" />

            {/* Mountain Massifs */}
            <path
              d="M 520 280 Q 640 250 820 230 Q 860 300 780 340 Q 660 350 560 330 Z"
              fill="url(#mountainHatch)"
            />
            <path
              d="M 460 360 Q 560 350 630 380 Q 600 460 520 450 Q 450 420 460 360 Z"
              fill="url(#mountainHatch)"
            />
            <path
              d="M 170 380 Q 250 370 320 440 Q 280 470 200 450 Z"
              fill="url(#mountainHatch)"
            />
            <path
              d="M 440 220 Q 500 200 550 240 Q 520 270 450 250 Z"
              fill="url(#mountainHatch)"
            />

            {/* Caspian Sea Eastern Coast */}
            <path
              d="M 0 0 L 90 0 C 100 120 70 220 95 310 C 110 390 80 480 60 600 L 0 600 Z"
              fill="#DCE8EE"
              stroke="#B3CCD6"
              strokeWidth="0.8"
            />
            <text x="35" y="280" fill="#7593A0" fontSize="10" fontFamily="serif" fontStyle="italic" opacity="0.85">
              Каспий
            </text>

            {/* Aral Sea */}
            <path
              d="M 230 180 C 265 170 290 190 295 240 C 300 280 270 310 240 310 C 215 310 205 270 210 220 Z"
              fill="#DCE8EE"
              stroke="#B3CCD6"
              strokeWidth="0.8"
            />
            <text x="235" y="245" fill="#7593A0" fontSize="9" fontFamily="serif" fontStyle="italic" opacity="0.85">
              Арал
            </text>

            {/* Lake Balkhash */}
            <path
              d="M 680 120 C 720 110 780 115 820 145 C 790 160 740 145 700 150 C 670 140 660 130 680 120 Z"
              fill="#DCE8EE"
              stroke="#B3CCD6"
              strokeWidth="0.8"
            />
            <text x="725" y="135" fill="#7593A0" fontSize="9" fontFamily="serif" fontStyle="italic" opacity="0.85">
              Балхаш
            </text>

            {/* Lake Issyk-Kul */}
            <ellipse
              cx="675"
              cy="255"
              rx="24"
              ry="11"
              fill="#DCE8EE"
              stroke="#B3CCD6"
              strokeWidth="0.8"
            />
            <text x="660" y="258" fill="#7593A0" fontSize="8" fontFamily="serif" fontStyle="italic" opacity="0.85">
              Иссык-Куль
            </text>

            {/* Major Rivers */}
            <path
              d="M 530 430 Q 480 410 440 395 Q 380 390 320 330 Q 275 300 250 295"
              fill="none"
              stroke="#98B8C6"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <text x="340" y="365" fill="#7A9AA8" fontSize="8" fontStyle="italic" opacity="0.8" transform="rotate(-30, 340, 365)">
              р. Амударья
            </text>

            <path
              d="M 620 280 Q 550 270 480 250 Q 420 220 320 210 Q 280 210 275 215"
              fill="none"
              stroke="#98B8C6"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <text x="440" y="225" fill="#7A9AA8" fontSize="8" fontStyle="italic" opacity="0.8" transform="rotate(-15, 440, 225)">
              р. Сырдарья
            </text>

            <path
              d="M 480 340 Q 430 335 380 330 Q 340 330 320 340"
              fill="none"
              stroke="#ADC7D3"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            <text x="410" y="325" fill="#7A9AA8" fontSize="7.5" fontStyle="italic" opacity="0.8">
              р. Зеравшан
            </text>

            <path
              d="M 330 460 Q 320 420 300 395"
              fill="none"
              stroke="#ADC7D3"
              strokeWidth="1"
            />

            {/* Country Contours - Minimal Hairlines */}
            <path
              d="M 200 230 L 260 210 L 320 220 L 400 240 L 460 230 L 530 250 L 580 270 L 570 290 L 500 295 L 490 340 L 450 360 L 450 430 L 390 410 L 350 350 L 280 330 L 210 320 Z"
              fill="none"
              stroke="#D1C9BC"
              strokeWidth="0.8"
              strokeDasharray="4,2"
            />

            {/* Country Names - Subtle, clean typography */}
            <text x="350" y="275" fill="#B3ACA0" fontSize="13" fontFamily="serif" letterSpacing="4">
              УЗБЕКИСТАН
            </text>
            <text x="490" y="100" fill="#B3ACA0" fontSize="13" fontFamily="serif" letterSpacing="4">
              КАЗАХСТАН
            </text>
            <text x="680" y="295" fill="#B3ACA0" fontSize="11" fontFamily="serif" letterSpacing="3">
              КЫРГЫЗСТАН
            </text>
            <text x="510" y="405" fill="#B3ACA0" fontSize="11" fontFamily="serif" letterSpacing="3">
              ТАДЖИКИСТАН
            </text>
            <text x="220" y="415" fill="#B3ACA0" fontSize="12" fontFamily="serif" letterSpacing="3">
              ТУРКМЕНИСТАН
            </text>

            {/* Sites Markers */}
            {sites.map(site => {
              const { x, y } = projectGeo(site.coordinates.lat, site.coordinates.lng);
              const isSelected = selectedSiteId === site.id;
              const isMatch = filteredIdsSet.has(site.id);
              const colorConfig = EPOCH_COLORS[site.epoch] || { dot: '#B8962E' };

              return (
                <g
                  key={site.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSite(site.id);
                  }}
                  onMouseEnter={() => setHoveredSite(site)}
                  onMouseLeave={() => setHoveredSite(null)}
                  opacity={isMatch ? 1 : 0.25}
                >
                  {/* Selected / Search match pulse halo */}
                  {isSelected && (
                    <circle
                      r="12"
                      fill="none"
                      stroke="#B8962E"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    r={isSelected ? 6.5 : isMatch ? 5 : 3.5}
                    fill={colorConfig.dot}
                    stroke={isSelected ? '#FFFFFF' : '#2E2B1F'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="hover:scale-125 transition-transform"
                  />

                  {/* Small gold core dot */}
                  <circle
                    r="1.5"
                    fill="#FFFFFF"
                  />

                  {/* Site Name Label (shown when selected or on hover or when zoomed) */}
                  {(isSelected || zoom > 1.4 || hoveredSite?.id === site.id) && isMatch && (
                    <g transform="translate(0, -9)">
                      <rect
                        x="-45"
                        y="-12"
                        width="90"
                        height="14"
                        rx="2"
                        fill="#FAF6EE"
                        stroke="#B8962E"
                        strokeWidth="0.7"
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill="#2E2B1F"
                        fontSize="9"
                        fontWeight="600"
                        fontFamily="serif"
                      >
                        {site.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hovered Site Card Tooltip (Floating on bottom-right of map) */}
          {hoveredSite && (
            <div className="absolute top-12 right-3 max-w-xs bg-white/95 border border-[#E2DDD3] rounded p-2.5 shadow-sm text-xs pointer-events-none z-20">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-serif font-medium text-sm text-[#22201B] truncate">
                  {hoveredSite.name}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: EPOCH_COLORS[hoveredSite.epoch]?.dot }}
                />
              </div>
              <div className="text-[11px] text-[#5C574E] mb-1">
                {hoveredSite.epoch} • {hoveredSite.culture}
              </div>
              <div className="text-[10px] text-neutral-500 mb-0.5">
                {hoveredSite.region}
              </div>
              <div className="text-[10px] font-mono text-[#736E64]">
                {hoveredSite.dating.displayLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
