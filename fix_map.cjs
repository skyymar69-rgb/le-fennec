const fs = require('fs');

function filterPath(pathStr) {
  if (!pathStr) return pathStr;
  
  // Split into sub-paths (each starting with M)
  const subPaths = pathStr.split(/(?=M)/).filter(Boolean);
  
  if (subPaths.length <= 1) return pathStr;
  
  // Keep only sub-paths where ALL coordinates are within valid SVG bounds [0, 520]
  const valid = subPaths.filter(sp => {
    const nums = sp.match(/-?\d+\.?\d*/g);
    if (!nums || nums.length < 4) return false;
    const vals = nums.map(Number);
    return vals.every(v => v >= -10 && v <= 510);
  });
  
  return valid.join('') || subPaths[0]; // fallback to first if none valid
}

// Read and parse
const content = fs.readFileSync('./src/data/wilayaPaths.ts', 'utf8');
const match = content.match(/= (\{[\s\S]*\});?\s*$/);
const data = JSON.parse(match[1]);

let fixed = 0;
for (const [code, w] of Object.entries(data)) {
  const original = w.path;
  const cleaned  = filterPath(original);
  if (cleaned !== original) {
    w.path = cleaned;
    fixed++;
  }
}

console.log(`Fixed ${fixed} wilaya paths`);

// Verify
for (const [code, w] of Object.entries(data)) {
  const nums = (w.path || '').match(/-?\d+\.?\d*/g);
  if (nums) {
    const vals = nums.map(Number);
    const min = Math.min(...vals), max = Math.max(...vals);
    if (min < -10 || max > 510) {
      console.log(`  Still bad: ${code} ${w.nameFr} min=${min.toFixed(0)} max=${max.toFixed(0)}`);
    }
  }
}

const ts = `// Auto-generated — Lambert Conic Equal Area, Algeria geographic bounds, viewBox 0 0 480 560
export interface WilayaPath { path:string; cx:number; cy:number; nameFr:string; nameAr:string; nameEn:string; }
export const WILAYA_PATHS: Record<string,WilayaPath> = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync('./src/data/wilayaPaths.ts', ts);
console.log('wilayaPaths.ts rewritten — clean paths only');
