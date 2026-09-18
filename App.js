import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { getTheme } from './src/theme';
import * as storage from './src/storage';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PracticeSelectScreen from './src/screens/PracticeSelectScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import RunScreen from './src/screens/RunScreen';
import EndScreen from './src/screens/EndScreen';
import PracticeEndScreen from './src/screens/PracticeEndScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [companionName, setCompanionName] = useState('');
  const [bestLevel, setBestLevel] = useState(0);
  const [lifetime, setLifetime] = useState(null);
  const [themeMode, setThemeMode] = useState('light');
  const [nav, setNav] = useState({ route: 'home', params: {} });
  const [runResult, setRunResult] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await storage.loadAll();
      setCompanionName(data.companionName);
      setBestLevel(data.bestLevel);
      setLifetime(data.lifetime);
      setThemeMode(data.theme);
      setNav({ route: data.companionName ? 'home' : 'onboarding', params: {} });
      setLoading(false);
    })();
  }, []);

  const goTo = useCallback((route, params = {}) => setNav({ route, params }), []);

  const toggleTheme = useCallback(() => {
    setThemeMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      storage.saveTheme(next);
      return next;
    });
  }, []);

  const finishOnboarding = useCallback((name) => {
    setCompanionName(name);
    storage.saveName(name);
    goTo('home');
  }, [goTo]);

  const renameCompanion = useCallback((name) => {
    setCompanionName(name);
    storage.saveName(name);
  }, []);

  // Called by Run/Practice screens after each answer to update lifetime stats.
  const recordAnswer = useCallback((type, correct) => {
    setLifetime((prev) => {
      const next = {
        ...prev,
        perType: { ...prev.perType, [type]: { ...prev.perType[type] } },
      };
      next.perType[type].t += 1;
      next.totalAttempts += 1;
      if (correct) {
        next.perType[type].c += 1;
        next.totalCorrect += 1;
      }
      storage.saveLifetime(next);
      return next;
    });
  }, []);

  const recordStreak = useCallback((streak) => {
    setLifetime((prev) => {
      if (streak <= prev.bestStreak) return prev;
      const next = { ...prev, bestStreak: streak };
      storage.saveLifetime(next);
      return next;
    });
  }, []);

  const recordRunEnd = useCallback((levelReached) => {
    setLifetime((prev) => {
      const next = { ...prev, totalRuns: prev.totalRuns + 1 };
      storage.saveLifetime(next);
      return next;
    });
    if (levelReached > bestLevel) {
      setBestLevel(levelReached);
      storage.saveBest(levelReached);
      return true; // isNewBest
    }
    return false;
  }, [bestLevel]);

  if (loading || !lifetime) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFBFF' }}>
        <ActivityIndicator size="large" color="#18C4B2" />
      </View>
    );
  }

  const theme = getTheme(themeMode);
  const shared = {
    theme, themeMode, toggleTheme,
    companionName, renameCompanion,
    bestLevel, lifetime,
    recordAnswer, recordStreak, recordRunEnd,
    goTo,
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
      {nav.route === 'onboarding' && <OnboardingScreen {...shared} onDone={finishOnboarding} />}
      {nav.route === 'home' && <HomeScreen {...shared} />}
      {nav.route === 'select' && <LevelSelectScreen {...shared} />}
      {nav.route === 'profile' && <ProfileScreen {...shared} />}
      {nav.route === 'practice-select' && <PracticeSelectScreen {...shared} />}
      {nav.route === 'practice' && (
        <PracticeScreen
          {...shared}
          practiceType={nav.params.type}
          onSessionEnd={(result) => { setPracticeResult(result); goTo('practice-end'); }}
        />
      )}
      {nav.route === 'practice-end' && practiceResult && (
        <PracticeEndScreen {...shared} result={practiceResult} />
      )}
      {nav.route === 'run' && (
        <RunScreen
          {...shared}
          startLevel={nav.params.startLevel || 1}
          onRunEnd={(result) => { setRunResult(result); goTo('end'); }}
        />
      )}
      {nav.route === 'end' && runResult && <EndScreen {...shared} result={runResult} />}
    </View>
  );
}
