import { bodyStyleFor, paintFor, type BodyStyle } from '../lib/vehicleArt';

/** Side profiles drawn on a 240x100 canvas; wheels sit on y = 78. */
const BODIES: Record<BodyStyle, { body: string; glass: string; wheels: [number, number] }> = {
  sedan: {
    body: 'M18 72Q18 59 31 56L70 51Q90 33 112 31H150Q171 32 187 49L213 55Q226 58 226 70V74Q226 78 222 78H22Q18 78 18 74Z',
    glass: 'M80 50Q96 37 113 36H128V50ZM134 36H149Q164 37 176 50H134Z',
    wheels: [62, 184]
  },
  suv: {
    body: 'M16 72V52Q16 44 26 42L58 40L78 22Q82 18 90 18H178Q188 18 194 26L208 42Q222 44 224 56V74Q224 78 220 78H20Q16 78 16 74Z',
    glass: 'M70 40L86 24H124V40ZM130 24H176Q182 24 186 30L194 40H130Z',
    wheels: [60, 182]
  },
  truck: {
    body: 'M14 74V54Q14 48 22 47H122L132 24Q134 20 140 20H176Q184 20 188 28L198 46Q222 48 226 58V74Q226 78 222 78H18Q14 78 14 74Z',
    glass: 'M136 44L143 26H160V44ZM165 26H176Q180 26 182 30L189 44H165Z',
    wheels: [58, 186]
  },
  hatch: {
    body: 'M18 72Q18 58 30 55L72 50Q92 30 112 28H168Q182 28 190 40L200 54Q222 57 224 68V74Q224 78 220 78H22Q18 78 18 72Z',
    glass: 'M82 49Q97 34 113 33H136V49ZM142 33H167Q177 33 183 42L188 49H142Z',
    wheels: [62, 182]
  },
  coupe: {
    body: 'M14 72Q14 62 26 59L76 54Q100 36 128 35H150Q172 40 194 54L218 58Q228 60 228 70V74Q228 78 224 78H18Q14 78 14 74Z',
    glass: 'M90 53Q106 41 127 40H142V53ZM148 40H150Q166 43 180 53H148Z',
    wheels: [62, 188]
  }
};

interface CarArtProps {
  category: string;
  color: string | null;
  seed: string;
  className?: string;
}

/** A small illustrated car tinted with the vehicle's paint colour, so every card has a visual. */
export function CarArt({ category, color, seed, className = '' }: CarArtProps) {
  const style = bodyStyleFor(category);
  const { body, glass, wheels } = BODIES[style];
  const paint = paintFor(color, seed);
  const id = `paint-${seed.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg viewBox="0 0 240 100" className={className} role="img" aria-label={`${category} illustration`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paint} />
          <stop offset="1" stopColor={paint} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <ellipse cx="121" cy="84" rx="104" ry="6" fill="#000" opacity="0.45" />
      <path d={body} fill={`url(#${id})`} />
      <path d={body} fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1" />
      <path d={glass} fill="#0b0e16" opacity="0.82" />
      <path d="M40 62H206" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" strokeLinecap="round" />
      {wheels.map(cx => (
        <g key={cx}>
          <circle cx={cx} cy="78" r="13" fill="#0b0e16" stroke="#2a3146" strokeWidth="2" />
          <circle cx={cx} cy="78" r="5.5" fill="#8d95ab" />
        </g>
      ))}
    </svg>
  );
}
