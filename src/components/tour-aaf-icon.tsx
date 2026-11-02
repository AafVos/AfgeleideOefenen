/** Het tekenfilmpje van Aaf, gebruikt door zowel het rustende knopje als de rondleiding zelf. */
export function Aaf({ size = 84 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 130"
      width={size}
      height={size * 1.3}
      className="overflow-visible text-text"
      aria-hidden
    >
      <g className="tour-inner">
        {/* zwaaiende arm (achter het lijf) */}
        <path
          className="tour-arm-wave"
          d="M47 72 C 38 66, 31 55, 30 44"
          fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"
        />
        {/* staartjes (achter het hoofd) */}
        <path d="M34 33 C 25 35, 20 44, 23 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 33 C 79 35, 84 44, 81 52" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        <circle cx="23" cy="52" r="2.6" fill="currentColor" />
        <circle cx="81" cy="52" r="2.6" fill="currentColor" />
        {/* hoofd: licht wiebelige cirkel */}
        <path
          d="M52 18 C 64 17, 73 27, 72 38 C 71 50, 62 58, 51 57.5 C 40 57, 32 48, 32.5 37 C 33 27, 41 18.5, 52 18"
          fill="var(--color-surface)" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* pony */}
        <path
          d="M40 23 C 44 18, 50 17, 53 20 M53 20 C 56 16.5, 62 17.5, 64 22"
          fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
        />
        {/* hals */}
        <path d="M52 58 L 52 66" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        {/* jurkje */}
        <path
          d="M52 64 L 40 96 L 64 96 Z"
          fill="var(--color-surface)" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* rustende arm */}
        <path d="M55 72 C 62 76, 67 83, 69 91" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* benen */}
        <path d="M47 96 C 46 104, 45 112, 44 119 M57 96 C 58 104, 59 111, 60 118" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
        {/* voeten */}
        <path d="M44 119 L 37 121 M60 118 L 67 119" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        {/* gezicht */}
        <g className="tour-eyes">
          <circle cx="46" cy="36" r="2.8" fill="currentColor" />
          <circle cx="59" cy="36" r="2.8" fill="currentColor" />
        </g>
        <path d="M47 45 C 50 48.5, 55 48.5, 58 45" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="41" cy="43" r="3.5" fill="var(--color-accent)" opacity="0.4" />
        <circle cx="64" cy="43" r="3.5" fill="var(--color-accent)" opacity="0.4" />
      </g>
    </svg>
  )
}
