import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Mascot from '../components/Mascot';
import { Button } from '../components/UI';

export default function OnboardingScreen({ theme, onDone }) {
  const [name, setName] = useState('');
  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Mascot mood="idle" size={110} />
      <Text style={[styles.title, { color: theme.text }]}>Hi! I don't have a name yet.</Text>
      <Text style={[styles.sub, { color: theme.textMuted }]}>
        I'll be climbing right alongside you. What should I be called?
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Pip"
        placeholderTextColor={theme.textDim}
        maxLength={16}
        style={[styles.input, { backgroundColor: theme.panel, borderColor: theme.borderStrong, color: theme.text }]}
      />
      <Button label="Let's go" theme={theme} onPress={() => onDone(name.trim() || 'Pip')} style={{ width: 220 }} />
      <TouchableOpacity onPress={() => onDone('Pip')} style={{ marginTop: 14 }}>
        <Text style={{ color: theme.textDim, fontSize: 13, textDecorationLine: 'underline' }}>
          Skip — just call me Pip
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 14, textAlign: 'center' },
  sub: { fontSize: 14, marginTop: 6, marginBottom: 18, textAlign: 'center', maxWidth: 260 },
  input: {
    width: 240, borderWidth: 1, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16,
    fontSize: 17, textAlign: 'center', marginBottom: 16,
  },
});
