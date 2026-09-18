export const LIGHT = {
  bg: '#FAFBFF', panel: '#FFFFFF', panelAlt: '#F1F3FC', panelRaised: '#E7EBFA',
  border: 'rgba(20,30,60,0.09)', borderStrong: 'rgba(20,30,60,0.18)',
  text: '#161C33', textMuted: '#5C699A', textDim: '#93A0C4',
  cyan: '#18C4B2', amber: '#F5A100', green: '#22B573', violet: '#8B5CF6', pink: '#EC4899',
};

export const DARK = {
  bg: '#0B1020', panel: '#141B32', panelAlt: '#1B2440', panelRaised: '#232E52',
  border: 'rgba(255,255,255,0.09)', borderStrong: 'rgba(255,255,255,0.18)',
  text: '#F1F4FB', textMuted: '#9AA6C4', textDim: '#66739C',
  cyan: '#4FE3D4', amber: '#FFB020', green: '#7CF29C', violet: '#B794FF', pink: '#FF6FA5',
};

export function getTheme(mode) {
  return mode === 'dark' ? DARK : LIGHT;
}
