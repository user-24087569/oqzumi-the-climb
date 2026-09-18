import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Mascot from '../components/Mascot';
import { Button, Bubble } from '../components/UI';
import { rankFor, checkpointFor, TYPE_LABEL, weakestSkill } from '../game/logic';
import { pickLine } from '../game/dialogue';

export default function HomeScreen({ theme, themeMode, toggleTheme, companionName, bestLevel, lifetime, goTo }) {
  const rank = rankFor(Math.max(bestLevel, 1));
  const latestCp = checkpointFor(bestLevel);
  const weak = useMemo(() => weakestSkill(lifetime), [lifetime]);
  const greeting = useMemo(() => (weak ? null : pickLine('greeting')), [weak]);

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: theme.panel, borderColor: theme.borderStrong }]}>
        <Text style={{ color: theme.text }}>{themeMode === 'dark' ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <Mascot mood="idle" />
      <Text style={[styles.companionName, { color: theme.textMuted }]}>{companionName}</Text>

      {weak ? (
        <Bubble
          theme={theme}
          text={`I noticed your ${TYPE_LABEL[weak]} has been tricky lately — want to train it?`}
          onPress={() => goTo('practice', { type: weak })}
        />
      ) : (
        <Bubble theme={theme} text={greeting} />
      )}

      <Text style={[styles.brand, { color: theme.cyan }]}>OQZUMI</Text>
      <Text style={[styles.brandSub, { color: theme.textMuted }]}>The Climb</Text>
      <Text style={[styles.tagline, { color: theme.textMuted }]}>One ladder. Four skills. Endless levels.</Text>

      <View style={[styles.rankBadge, { backgroundColor: theme.panel, borderColor: theme.borderStrong }]}>
        <View style={[styles.rankDot, { backgroundColor: rank.color }]} />
        <Text style={{ color: theme.text, fontWeight: '600' }}>{rank.name}</Text>
      </View>

      <Text style={[styles.bestNum, { color: theme.text }]}>{bestLevel || '—'}</Text>
      <Text style={[styles.bestLab, { color: theme.textDim }]}>BEST LEVEL REACHED</Text>

      <View style={styles.actions}>
        <Button
          theme={theme}
          label={bestLevel > 0 ? `Continue from level ${latestCp}` : 'Play'}
          onPress={() => goTo('run', { startLevel: latestCp })}
        />
        {bestLevel >= 10 && (
          <Button theme={theme} variant="ghost" label="Choose a difficulty" onPress={() => goTo('select')} />
        )}
        <Button theme={theme} variant="ghost" label="Train a skill" onPress={() => goTo('practice-select')} />
        <Button theme={theme} variant="ghost" label="My profile" onPress={() => goTo('profile')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, paddingTop: 60 },
  themeToggle: {
    position: 'absolute', top: 14, right: 14, width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  companionName: { fontWeight: '600', fontSize: 13, marginTop: 4 },
  brand: { fontSize: 28, fontWeight: '700', marginTop: 8 },
  brandSub: { fontSize: 15, fontWeight: '600', marginTop: -4 },
  tagline: { fontSize: 14, marginTop: 6, marginBottom: 14, textAlign: 'center' },
  rankBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 100,
    paddingVertical: 8, paddingHorizontal: 18, marginBottom: 16,
  },
  rankDot: { width: 10, height: 10, borderRadius: 5 },
  bestNum: { fontSize: 44, fontWeight: '700' },
  bestLab: { fontSize: 12, letterSpacing: 1, marginBottom: 20 },
  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
