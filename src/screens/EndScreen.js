import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Mascot from '../components/Mascot';
import { Bubble, Button } from '../components/UI';
import { rankFor, TYPES, TYPE_LABEL, checkpointFor } from '../game/logic';
import { pickLine } from '../game/dialogue';

export default function EndScreen({ theme, result, recordRunEnd, goTo }) {
  const { level, startLevel, skillStats } = result;
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const newBest = recordRunEnd(level);
    setIsNewBest(newBest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rank = rankFor(level);
  const mood = isNewBest ? 'happy' : level <= startLevel + 2 ? 'sad' : 'idle';
  const line = useMemo(
    () => (isNewBest ? pickLine('newBest') : level <= startLevel + 2 ? pickLine('shortRun') : pickLine('goodRun')),
    [isNewBest]
  );

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Mascot mood={mood} />
      <Bubble theme={theme} text={line} />
      <Text style={[styles.kicker, { color: theme.textDim }]}>RUN OVER</Text>
      <Text style={[styles.num, { color: theme.text }]}>{level}</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>
        Level reached · <Text style={{ color: rank.color }}>{rank.name}</Text>
      </Text>
      {isNewBest && <Text style={[styles.newBest, { color: theme.green }]}>🎉 New personal best</Text>}

      <View style={[styles.breakdown, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <Text style={[styles.bdTitle, { color: theme.textDim }]}>THIS RUN'S ACCURACY</Text>
        {TYPES.map((k) => {
          const s = skillStats[k];
          const p = s.t > 0 ? Math.round((s.c / s.t) * 100) : 0;
          return (
            <View key={k} style={styles.bdRow}>
              <Text style={{ color: theme.textMuted, width: 66, fontSize: 13, fontWeight: '600' }}>{TYPE_LABEL[k]}</Text>
              <View style={[styles.bdTrack, { backgroundColor: theme.panelAlt }]}>
                <View style={[styles.bdFill, { width: `${p}%`, backgroundColor: theme.violet }]} />
              </View>
              <Text style={{ color: theme.textDim, width: 36, textAlign: 'right', fontSize: 12 }}>
                {s.t > 0 ? `${p}%` : '—'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button theme={theme} label="Play again" onPress={() => goTo('run', { startLevel: checkpointFor(level) })} />
        <Button theme={theme} variant="ghost" label="Choose a difficulty" onPress={() => goTo('select')} />
        <Button theme={theme} variant="ghost" label="Back to home" onPress={() => goTo('home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 6 },
  num: { fontSize: 46, fontWeight: '700', marginVertical: 2 },
  sub: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  newBest: { fontWeight: '700', fontSize: 13, marginBottom: 10 },
  breakdown: { width: '100%', maxWidth: 300, borderWidth: 1, borderRadius: 16, padding: 16, marginVertical: 18 },
  bdTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  bdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 },
  bdTrack: { flex: 1, height: 7, borderRadius: 4, overflow: 'hidden' },
  bdFill: { height: '100%', borderRadius: 4 },
  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
