import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Mascot from '../components/Mascot';
import { Bubble, Button } from '../components/UI';
import { TYPE_LABEL } from '../game/logic';

export default function PracticeEndScreen({ theme, result, goTo }) {
  const { type, correct, total, bestStreak } = result;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Mascot mood={pct >= 70 ? 'happy' : 'idle'} />
      <Bubble theme={theme} text={pct >= 70 ? "Great reps — that skill is getting sharper." : 'Good session. Consistency beats intensity.'} />
      <Text style={[styles.kicker, { color: theme.textDim }]}>{TYPE_LABEL[type].toUpperCase()} PRACTICE COMPLETE</Text>
      <Text style={[styles.num, { color: theme.text }]}>{pct}%</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>{correct} of {total} correct · best streak {bestStreak}</Text>

      <View style={styles.actions}>
        <Button theme={theme} label="Practice again" onPress={() => goTo('practice', { type })} />
        <Button theme={theme} variant="ghost" label="Choose another skill" onPress={() => goTo('practice-select')} />
        <Button theme={theme} variant="ghost" label="Back to home" onPress={() => goTo('home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  kicker: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginTop: 6 },
  num: { fontSize: 44, fontWeight: '700', marginVertical: 2 },
  sub: { fontSize: 13, fontWeight: '600', marginBottom: 22 },
  actions: { width: '100%', maxWidth: 280, gap: 10 },
});
