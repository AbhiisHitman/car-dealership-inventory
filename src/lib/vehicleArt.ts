/** Maps a paint name such as "Soul Red Crystal" to a swatch, falling back to a stable hashed hue. */
const PAINTS: [RegExp, string][] = [
  [/red/i, '#e5484d'],
  [/orange|lava/i, '#f0883e'],
  [/yellow|gold|solar/i, '#e9c46a'],
  [/green|sarge|olive/i, '#6f8f58'],
  [/terra|sand|desert|bronze/i, '#b08a5a'],
  [/geyser|teal|aqua/i, '#6fb5c4'],
  [/blue|navarra|ocean/i, '#4b7bff'],
  [/purple|violet/i, '#9b7bff'],
  [/white|pearl|ivory/i, '#e6e9f0'],
  [/silver/i, '#c3c9d6'],
  [/grey|gray|celestite|graphite/i, '#8b93a6'],
  [/black|obsidian|carbon|onyx|antimatter/i, '#343a48']
];

export function paintFor(color: string | null, seed: string): string {
  const match = color ? PAINTS.find(([pattern]) => pattern.test(color)) : undefined;
  if (match) return match[1];
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 55% 58%)`;
}

export type BodyStyle = 'sedan' | 'suv' | 'truck' | 'hatch' | 'coupe';

export function bodyStyleFor(category: string): BodyStyle {
  const c = category.toLowerCase();
  if (/suv|crossover|wagon|van/.test(c)) return 'suv';
  if (/truck|pickup/.test(c)) return 'truck';
  if (/hatch|electric|ev/.test(c)) return 'hatch';
  if (/coupe|convertible|sport|roadster/.test(c)) return 'coupe';
  return 'sedan';
}
