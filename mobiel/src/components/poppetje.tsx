import Svg, { Circle, Path } from 'react-native-svg'

import { Colors } from '@/constants/theme'

// Hetzelfde poppetje als op de site (src/components/welcome-tour.tsx),
// maar zonder de CSS-animaties: die bestaan niet in React Native.
export function Poppetje({ size = 96 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 100 130" width={size} height={size * 1.3}>
      <Path
        d="M47 72 C 38 66, 31 55, 30 44"
        fill="none"
        stroke={Colors.text}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <Path
        d="M34 33 C 25 35, 20 44, 23 52"
        fill="none"
        stroke={Colors.text}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Path
        d="M70 33 C 79 35, 84 44, 81 52"
        fill="none"
        stroke={Colors.text}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={23} cy={52} r={2.6} fill={Colors.text} />
      <Circle cx={81} cy={52} r={2.6} fill={Colors.text} />
      <Path
        d="M52 18 C 64 17, 73 27, 72 38 C 71 50, 62 58, 51 57.5 C 40 57, 32 48, 32.5 37 C 33 27, 41 18.5, 52 18"
        fill={Colors.surface}
        stroke={Colors.text}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M40 23 C 44 18, 50 17, 53 20 M53 20 C 56 16.5, 62 17.5, 64 22"
        fill="none"
        stroke={Colors.text}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Path d="M52 58 L 52 66" fill="none" stroke={Colors.text} strokeWidth={5} strokeLinecap="round" />
      <Path
        d="M52 64 L 40 96 L 64 96 Z"
        fill={Colors.surface}
        stroke={Colors.text}
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M55 72 C 62 76, 67 83, 69 91"
        fill="none"
        stroke={Colors.text}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <Path
        d="M47 96 C 46 104, 45 112, 44 119 M57 96 C 58 104, 59 111, 60 118"
        fill="none"
        stroke={Colors.text}
        strokeWidth={4.5}
        strokeLinecap="round"
      />
      <Path
        d="M44 119 L 37 121 M60 118 L 67 119"
        fill="none"
        stroke={Colors.text}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={46} cy={36} r={2.8} fill={Colors.text} />
      <Circle cx={59} cy={36} r={2.8} fill={Colors.text} />
      <Path
        d="M47 45 C 50 48.5, 55 48.5, 58 45"
        fill="none"
        stroke={Colors.text}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <Circle cx={41} cy={43} r={3.5} fill={Colors.accent} opacity={0.4} />
      <Circle cx={64} cy={43} r={3.5} fill={Colors.accent} opacity={0.4} />
    </Svg>
  )
}
