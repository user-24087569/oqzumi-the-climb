import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { rankFor, checkpointFor, checkpointList } from '../game/logic';

export default function LevelSelectScreen({ theme, bestLevel, goTo }) {
  const top = checkpointFor(bestLevel);
  const list = checkpointList(bestLevel).slice().reverse();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <TouchableOpacity onPress={() => goTo('home')}>
        <Text style={{ color: theme.textMuted, fontWeight: '600', marginBottom: 14 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.text }]}>Choose a difficulty</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>
        Jump into any level you've unlocked. Puzzles start at that level's difficulty and keep climbing from there.
      </Text>
      <FlatList
        data={list}
        keyExtractor={(cp) => String(cp)}
        renderItem={({ item: cp }) => {
          const r = rankFor(cp);
          const isLatest = cp === top;
          return (
            <TouchableOpacity
              onPress={() => goTo('run', { startLevel: cp })}
              style={[
                styles.item,
                { backgroundColor: theme.panel, borderColor: isLatest ? theme.cyan : theme.border },
              ]}
            >
              <Text style={[styles.num, { color: r.color }]}>{cp}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Difficulty {cp}</Text>
                <Text style={{ color: theme.textDim, fontSize: 12 }}>{r.name} tier</Text>
              </View>
              {isLatest && (
                <View style={[styles.tag, { backgroundColor: theme.cyan }]}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>Latest</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, paddingTop: 56 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  sub: { fontSize: 13, marginBottom: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 9 },
  num: { fontSize: 19, fontWeight: '700', width: 50 },
  tag: { borderRadius: 100, paddingVertical: 4, paddingHorizontal: 10 },
});
