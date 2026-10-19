import { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { Map as LeafletMap, LatLng } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type PvgisData = { E_y: number; H_y: number };
type GeoResult = { lat: string; lon: string; display_name: string };

const SOLAR_RATING_MARKER_FALLBACK = "#64748b";

function getRating(ey: number) {
  if (ey >= 1100) return { label: "Sehr gut geeignet", colorText: "text-emerald-700", colorBorder: "border-emerald-200", colorBg: "bg-emerald-50", dot: "bg-emerald-500" };
  if (ey >= 1000) return { label: "Gut geeignet",      colorText: "text-green-700",   colorBorder: "border-green-200",   colorBg: "bg-green-50",   dot: "bg-green-500"   };
  if (ey >= 900)  return { label: "Geeignet",           colorText: "text-amber-700",   colorBorder: "border-amber-200",   colorBg: "bg-amber-50",   dot: "bg-amber-400"   };
  return              { label: "Bedingt geeignet",  colorText: "text-orange-700",  colorBorder: "border-orange-200",  colorBg: "bg-orange-50",  dot: "bg-orange-400"  };
}

function MapClickHandler({ onMapClick }: { onMapClick: (ll: LatLng) => void }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export function SolarkatasterPage() {
  const [pos, setPos]                   = useState<{ lat: number; lng: number } | null>(null);
  const [pvgis, setPvgis]               = useState<PvgisData | null>(null);
  const [pvgisLoading, setPvgisLoading] = useState(false);
  const [pvgisError, setPvgisError]     = useState(false);
  const [query, setQuery]               = useState("");
  const [geoResults, setGeoResults]     = useState<GeoResult[]>([]);
  const [geoLoading, setGeoLoading]     = useState(false);
  const [peakPower, setPeakPower]       = useState(6);
  const mapRef      = useRef<LeafletMap | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function loadPvgis(lat: number, lng: number) {
    setPvgisLoading(true);
    setPvgis(null);
    setPvgisError(false);
    try {
      const url = `/api/pvgis?lat=${lat.toFixed(5)}&lon=${lng.toFixed(5)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("pvgis");
      const json = await res.json();
      const fixed = json.outputs?.totals?.fixed;
      setPvgis({ E_y: Math.round(fixed["E_y"]), H_y: Math.round(fixed["H(i)_y"]) });
    } catch {
      setPvgisError(true);
    } finally {
      setPvgisLoading(false);
    }
  }

  function handleMapClick(ll: LatLng) {
    setPos({ lat: ll.lat, lng: ll.lng });
    setQuery("");
    setGeoResults([]);
    loadPvgis(ll.lat, ll.lng);
  }

  function handleQueryChange(q: string) {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.length < 3) { setGeoResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ", Bayern")}&format=json&limit=6&accept-language=de`;
        const res = await fetch(url);
        setGeoResults(await res.json());
      } catch { /* ignore */ }
      finally { setGeoLoading(false); }
    }, 400);
  }

  function selectGeo(r: GeoResult) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setPos({ lat, lng });
    setQuery(r.display_name.split(",")[0]);
    setGeoResults([]);
    mapRef.current?.flyTo([lat, lng], 15, { duration: 1.2 });
    loadPvgis(lat, lng);
  }

  const rating = pvgis ? getRating(pvgis.E_y) : null;
  const markerColor = rating?.dot === "bg-emerald-500" ? "#10b981"
    : rating?.dot === "bg-green-500" ? "#22c55e"
      : rating?.dot === "bg-amber-400" ? "#fbbf24"
        : rating ? "#fb923c" : SOLAR_RATING_MARKER_FALLBACK;
  const markerIcon = L.divIcon({
    className: "solar-rating-marker",
    html: `<span style="display:block;width:18px;height:18px;border:3px solid white;border-radius:9999px;background:${markerColor};box-shadow:0 1px 5px rgba(0,0,0,.45)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <div className="bg-muted/30 border-b py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-3">Daten & Tools</p>
          <h1 className="text-4xl font-serif font-bold mb-3">Solar-Potenzialkataster FFB</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Adresse eingeben oder auf die Karte klicken — wir zeigen das Solarpotenzial auf Basis der EU-Satellitendaten (PVGIS).
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl mt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">

            {/* Search */}
            <div className="border rounded-xl p-4 bg-card">
              <label className="text-sm font-semibold mb-2 block">Adresse suchen</label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="z. B. Hauptstraße 12, Germering"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-8"
                />
                {geoLoading && (
                  <div className="absolute right-2.5 top-2.5 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {geoResults.length > 0 && (
                <div className="mt-1 border rounded-lg bg-background shadow-lg overflow-hidden divide-y z-50 relative">
                  {geoResults.map((r, i) => (
                    <button key={i} onClick={() => selectGeo(r)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors">
                      <span className="font-medium block truncate">{r.display_name.split(",")[0]}</span>
                      <span className="text-muted-foreground text-xs truncate block">{r.display_name.split(",").slice(1, 3).join(",").trim()}</span>
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Oder direkt auf die Karte klicken</p>
            </div>

            {/* Result / placeholder */}
            {pvgisLoading && (
              <div className="border rounded-xl p-5 bg-card flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-sm text-muted-foreground">Satellitendaten werden abgerufen…</span>
              </div>
            )}

            {pvgisError && !pvgisLoading && (
              <div className="border rounded-xl p-5 bg-card text-center">
                <p className="text-sm text-muted-foreground">Daten konnten nicht geladen werden. Bitte versuch es noch einmal.</p>
              </div>
            )}

            {pvgis && rating && !pvgisLoading && (
              <div className={`border ${rating.colorBorder} rounded-xl p-5 ${rating.colorBg}`}>
                <div className={`flex items-center gap-2 mb-4`}>
                  <div className={`w-3.5 h-3.5 rounded-full ${rating.dot} ring-2 ring-white shadow-sm`} aria-hidden="true" />
                  <span className={`text-sm font-semibold ${rating.colorText}`}>{rating.label}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Jahresertrag je kWp</p>
                    <p className="text-4xl font-bold font-mono mt-0.5">{pvgis.E_y.toLocaleString("de-DE")}</p>
                    <p className="text-sm text-muted-foreground">kWh/kWp·Jahr</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Einstrahlung (optimal geneigt)</p>
                    <p className="text-2xl font-semibold font-mono mt-0.5">{pvgis.H_y.toLocaleString("de-DE")}</p>
                    <p className="text-sm text-muted-foreground">kWh/m²·Jahr</p>
                  </div>
                </div>

                {/* Anlagenrechner */}
                <div className="mt-5 pt-4 border-t border-black/10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Für deine Anlage</p>
                  <input
                    type="range"
                    min={2} max={20} step={0.5}
                    value={peakPower}
                    onChange={(e) => setPeakPower(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-sm font-medium">{peakPower} kWp</span>
                    <span className="text-sm font-bold">{Math.round(pvgis.E_y * peakPower).toLocaleString("de-DE")} kWh/Jahr</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">≈ {Math.round(peakPower * 7)} m² Dachfläche benötigt</p>
                </div>
              </div>
            )}

            {!pvgis && !pvgisLoading && !pvgisError && (
              <div className="border rounded-xl p-6 bg-card text-center">
                <div className="text-5xl mb-3">☀️</div>
                <p className="text-sm text-muted-foreground">
                  Adresse eingeben oder auf die Karte klicken — wir zeigen das Solarpotenzial für diesen Standort.
                </p>
              </div>
            )}

            {/* Legende */}
            <div className="border rounded-xl p-4 bg-card">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Legende</p>
              <p className="text-xs text-muted-foreground mb-3">Ertragsklasse des ausgewählten Standorts</p>
              <div className="space-y-2">
                {[
                  { label: "Sehr gut", range: "≥ 1.100 kWh/kWp·Jahr", dot: "bg-emerald-500", row: "border-emerald-200 bg-emerald-50", text: "text-emerald-800" },
                  { label: "Gut", range: "1.000 bis < 1.100 kWh/kWp·Jahr", dot: "bg-green-500", row: "border-green-200 bg-green-50", text: "text-green-800" },
                  { label: "Geeignet", range: "900 bis < 1.000 kWh/kWp·Jahr", dot: "bg-amber-400", row: "border-amber-200 bg-amber-50", text: "text-amber-800" },
                  { label: "Bedingt", range: "< 900 kWh/kWp·Jahr", dot: "bg-orange-400", row: "border-orange-200 bg-orange-50", text: "text-orange-800" },
                ].map((item) => (
                  <div key={item.label} className={`grid grid-cols-[0.75rem_1fr] items-center gap-x-3 rounded-lg border p-2.5 ${item.row}`}>
                    <span className={`row-span-2 h-9 w-3 rounded-sm ${item.dot}`} aria-hidden="true" />
                    <span className={`text-sm font-semibold ${item.text}`}>{item.label}</span>
                    <span className={`col-start-2 text-xs ${item.text}`}>{item.range}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mt-3">
                Der Kartenpunkt hat dieselbe Farbe wie die Einstufung. Die Grundkarte selbst ist nicht nach Ertrag eingefärbt.
              </p>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed px-0.5">
              Datenquelle: PVGIS 5 (EU Joint Research Centre, JRC) · Geocodierung: OpenStreetMap Nominatim ·
              Kein offizieller Bestandteil des kommunalen Solarkatasters. Angaben ohne Gewähr.
            </p>
          </div>

          {/* ── Map ── */}
          <div className="flex-1 rounded-xl overflow-hidden border shadow-sm" style={{ minHeight: 560 }}>
            <MapContainer
              center={[48.18, 11.24]}
              zoom={12}
              style={{ height: "100%", minHeight: 560, width: "100%", cursor: "crosshair" }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {pos && (
                <Marker
                  position={[pos.lat, pos.lng]}
                  icon={markerIcon}
                  title={rating ? `${rating.label}: ${pvgis?.E_y.toLocaleString("de-DE")} kWh/kWp·Jahr` : "Ausgewählter Standort"}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
