import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Ellipse, Path } from 'react-native-svg';

// mood: 'idle' | 'happy' | 'sad'
export default function Mascot({ mood = 'idle', size = 104 }) {
  const eyeY = 46;
  const mouthPath =
    mood === 'happy' ? 'M40 66 Q52 78 64 66' :
    mood === 'sad' ? 'M40 70 Q52 60 64 70' :
    'M42 66 Q52 70 62 66';

  return (
    <Svg width={size} height={size} viewBox="0 0 104 104">
      <Defs>
        <LinearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#18C4B2" />
          <Stop offset="100%" stopColor="#8B5CF6" />
        </LinearGradient>
      </Defs>
      <Ellipse cx="52" cy="96" rx="26" ry="5" fill="#000" opacity="0.12" />
      <Rect x="14" y="16" width="76" height="66" rx="28" fill="url(#mg)" />
      <Circle cx="52" cy="10" r="6" fill="#F5A100" />
      <Rect x="50" y="10" width="4" height="14" fill="#F5A100" />
      <Circle cx="38" cy={eyeY} r="7" fill="#161C33" />
      <Circle cx="66" cy={eyeY} r="7" fill="#161C33" />
      <Circle cx="40" cy={eyeY - 2} r="2.2" fill="#fff" />
      <Circle cx="68" cy={eyeY - 2} r="2.2" fill="#fff" />
      <Path d={mouthPath} stroke="#161C33" strokeWidth="4" fill="none" strokeLinecap="round" />
      <Circle cx="24" cy="58" r="5" fill="#EC4899" opacity="0.5" />
      <Circle cx="80" cy="58" r="5" fill="#EC4899" opacity="0.5" />
    </Svg>
  );
}
