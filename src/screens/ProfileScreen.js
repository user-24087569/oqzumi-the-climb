import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Mascot from '../components/Mascot';
import { rankFor, nextRank, checkpointList, TYPES, TYPE_LABEL } from '../game/logic';

export default function ProfileScreen({ theme, companionName, renameCompanion, bestLevel, lifetime, goTo }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(companionName);
  const r = rankFor(Math.max(bestLevel, 1));
  const nr = nextRank(bestLevel);
  const pct = nr ? Math.round(((bestLevel - r.from) / (nr.from - r.from)) * 100) : 100;
  const unlocked = checkpointList(bestLevel).length;

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={styles.wrap}>
      <TouchableOpacity onPress={() => goTo('home')}>
        <Text style={{ color: theme.textMuted, fontWeight: '600', marginBottom: 14 }}>← Back</Text>
      </TouchableOpacity>

      <View style={[styles.header, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <Mascot mood="idle" size={56} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          {editing ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                maxLength={16}
                style={[styles.nameInput, { borderColor: theme.borderStrong, color: theme.text, backgroundColor: theme.panelAlt }]}
              />
              <TouchableOpacity
                onPress={() => { renameCompanion(draft.trim() || companionName); setEditing(false); }}
                style={[styles.saveBtn, { backgroundColor: theme.cyan }]}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 17 }}>{companionName}</Text>
              <TouchableOpacity onPress={() => { setDraft(companionName); setEditing(true); }}>
                <Text style={{ color: theme.textMuted }}>✎</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={{ color: r.color, fontWeight: '600', fontSize: 13, marginTop: 2 }}>
            {r.name} · Level {bestLevel}
          </Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <StatCard theme={theme} val={bestLevel} lab="Best Level" />
        <StatCard theme={theme} val={lifetime.totalRuns} lab="Runs Played" />
        <StatCard theme={theme} val={lifetime.totalAttempts} lab="Puzzles Solved" />
        <StatCard theme={theme} val={lifetime.bestStreak} lab="Best Streak" />
      </View>

      <View style={[styles.section, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDim }]}>RANK PROGRESS</Text>
        <View style={styles.progressRow}>
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '600' }}>{r.name}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '600' }}>{nr ? nr.name : 'Max rank'}</Text>
        </View>
        <View style={[styles.track, { backgroundColor: theme.panelAlt, borderColor: theme.border }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: theme.cyan }]} />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDim }]}>SKILL MASTERY (LIFETIME)</Text>
        {TYPES.map((k) => {
          const s = lifetime.perType[k];
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

      <View style={[styles.section, { backgroundColor: theme.panel, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.textDim }]}>EXPLORATION</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>
          Difficulty checkpoints unlocked: <Text style={{ color: theme.text, fontWeight: '700' }}>{unlocked}</Text> of 100
        </Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ theme, val, lab }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.panel, borderColor: theme.border }]}>
      <Text style={{ color: theme.text, fontWeight: '700', fontSize: 22 }}>{val}</Text>
      <Text style={{ color: theme.textDim, fontSize: 11, fontWeight: '600', marginTop: 2 }}>{lab}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  nameInput: { fontSize: 15, borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, width: 120 },
  saveBtn: { borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { width: '47%', borderWidth: 1, borderRadius: 14, padding: 14 },
  section: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', borderWidth: 1 },
  fill: { height: '100%', borderRadius: 4 },
  bdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  bdTrack: { flex: 1, height: 7, borderRadius: 4, overflow: 'hidden' },
  bdFill: { height: '100%', borderRadius: 4 },
});
