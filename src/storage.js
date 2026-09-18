import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyLifetime } from './game/logic';

const KEYS = {
  best: 'climb_best',
  name: 'climb_name',
  lifetime: 'climb_lifetime',
  theme: 'climb_theme',
};

export async function loadAll() {
  try {
    const [best, name, lifetimeRaw, theme] = await Promise.all([
      AsyncStorage.getItem(KEYS.best),
      AsyncStorage.getItem(KEYS.name),
      AsyncStorage.getItem(KEYS.lifetime),
      AsyncStorage.getItem(KEYS.theme),
    ]);
    return {
      bestLevel: best ? parseInt(best, 10) : 0,
      companionName: name || '',
      lifetime: lifetimeRaw ? { ...emptyLifetime(), ...JSON.parse(lifetimeRaw) } : emptyLifetime(),
      theme: theme || 'light',
    };
  } catch (e) {
    return { bestLevel: 0, companionName: '', lifetime: emptyLifetime(), theme: 'light' };
  }
}

export function saveBest(v) {
  return AsyncStorage.setItem(KEYS.best, String(v)).catch(() => {});
}
export function saveName(v) {
  return AsyncStorage.setItem(KEYS.name, v).catch(() => {});
}
export function saveLifetime(v) {
  return AsyncStorage.setItem(KEYS.lifetime, JSON.stringify(v)).catch(() => {});
}
export function saveTheme(v) {
  return AsyncStorage.setItem(KEYS.theme, v).catch(() => {});
}
