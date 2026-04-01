/**
 * Génère les paths SVG depuis le GeoJSON dza.geojson
 * Utilise geoIdentity + manual scale/translate pour éviter 
 * les artefacts de projection sphérique de geoMercator
 */
const fs   = require('fs');
const d3   = require('./node_modules/d3-geo/dist/d3-geo.js');

const SVG_W = 480, SVG_H = 560, PAD = 10;
const geojson = JSON.parse(fs.readFileSync('./src/assets/dza.geojson', 'utf8'));

// ── Find bounding box of all features ────────────────────────────────────
let minLon = Infinity, maxLon = -Infinity;
let minLat = Infinity, maxLat = -Infinity;

geojson.features.forEach(f => {
  const coords = f.geometry.coordinates.flat(3);
  for (let i = 0; i < coords.length; i += 2) {
    const lon = coords[i], lat = coords[i + 1];
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
});

console.log(`Bounds: lon [${minLon.toFixed(2)}, ${maxLon.toFixed(2)}] lat [${minLat.toFixed(2)}, ${maxLat.toFixed(2)}]`);

// ── Linear projection: lon/lat → SVG pixels (no sphere, no artifacts) ────
// Flip lat (north = top)
const scaleX = (SVG_W - PAD * 2) / (maxLon - minLon);
const scaleY = (SVG_H - PAD * 2) / (maxLat - minLat);
const scale  = Math.min(scaleX, scaleY);

const offsetX = PAD + (SVG_W - PAD * 2 - (maxLon - minLon) * scale) / 2;
const offsetY = PAD + (SVG_H - PAD * 2 - (maxLat - minLat) * scale) / 2;

function project([lon, lat]) {
  return [
    offsetX + (lon - minLon) * scale,
    offsetY + (maxLat - lat) * scale,  // flip lat
  ];
}

// ── Convert GeoJSON polygon to SVG path ───────────────────────────────────
function ringToPath(ring) {
  return ring.map((pt, i) => {
    const [x, y] = project(pt);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join('') + 'Z';
}

function featureToPath(feature) {
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') {
    return coordinates.map(ringToPath).join('');
  }
  if (type === 'MultiPolygon') {
    return coordinates.map(poly => poly.map(ringToPath).join('')).join('');
  }
  return '';
}

function centroidOfRing(ring) {
  let x = 0, y = 0;
  ring.forEach(pt => {
    const [px, py] = project(pt);
    x += px; y += py;
  });
  return [x / ring.length, y / ring.length];
}

function featureCentroid(feature) {
  const { type, coordinates } = feature.geometry;
  if (type === 'Polygon') {
    return centroidOfRing(coordinates[0]);
  }
  if (type === 'MultiPolygon') {
    // Largest ring
    const largest = coordinates
      .map(poly => poly[0])
      .sort((a, b) => b.length - a.length)[0];
    return centroidOfRing(largest);
  }
  return [0, 0];
}

// ── Generate ──────────────────────────────────────────────────────────────
const result = {};
let bad = 0;

geojson.features.forEach(f => {
  const code    = f.properties.code;
  const path    = featureToPath(f);
  const [cx, cy] = featureCentroid(f);

  // Validate: all coords must be within SVG bounds
  const nums = (path.match(/-?\d+\.?\d*/g) || []).map(Number);
  const minV = Math.min(...nums), maxV = Math.max(...nums);
  
  if (minV < -2 || maxV > SVG_W + 10) {
    console.log(`⚠️  ${code} ${f.properties.nameFr}: out of bounds min=${minV.toFixed(0)} max=${maxV.toFixed(0)}`);
    bad++;
  }

  result[code] = {
    path,
    cx: Math.round(cx),
    cy: Math.round(cy),
    nameFr: f.properties.nameFr,
    nameAr: f.properties.nameAr,
    nameEn: f.properties.nameEn,
  };
});

console.log(`\n✅ Generated: ${Object.keys(result).length} wilayas, ${bad} with issues`);

// Key wilaya check
for (const c of ['16','31','25','11','37','01']) {
  const w = result[c];
  console.log(`  ${c} ${(w?.nameFr||'?').padEnd(20)} cx=${w?.cx} cy=${w?.cy}`);
}

// Write TypeScript
const ts = `// Auto-generated — Linear projection from dza.geojson, viewBox 0 0 480 560
export interface WilayaPath { path:string; cx:number; cy:number; nameFr:string; nameAr:string; nameEn:string; }
export const WILAYA_PATHS: Record<string,WilayaPath> = ${JSON.stringify(result, null, 2)};
`;

fs.writeFileSync('./src/data/wilayaPaths.ts', ts);
console.log(`\n📁 wilayaPaths.ts — ${(fs.statSync('./src/data/wilayaPaths.ts').size / 1024).toFixed(0)}Ko`);
