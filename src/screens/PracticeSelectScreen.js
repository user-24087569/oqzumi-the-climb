import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TYPES, TYPE_LABEL } from '../game/logic';

export default function PracticeSelectScreen({ theme, lifetime, goTo }) {
  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <TouchableOpacity onPress={() => goTo('home')}>
        <Text style={{ color: theme.textMuted, fontWeight: '600', marginBottom: 14 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>Train a skill</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>
        Pick one skill and only that kind of puzzle will come up. No lives, no pressure — just reps.
        This doesn't affect your Climb level.
      </Text>
      {TYPES.map((k) => {
        const s = lifetime.perType[k];
        const label = s.t >= 5 ? `${Math.round((s.c / s.t) * 100)}% lifetime accuracy` : 'Not enough data yet';
        return (
          <TouchableOpacity
            key={k}
            onPress={() => goTo('practice', { type: k })}
            style={[styles.item, { backgroundColor: theme.panel, borderColor: theme.border }]}
          >
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 16 }}>{TYPE_LABEL[k]}</Text>
            <Text style={{ color: theme.textDim, fontSize: 12, marginTop: 2 }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 18 },
  item: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10 },
});
