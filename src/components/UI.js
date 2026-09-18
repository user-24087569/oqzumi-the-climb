import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

export function Button({ label, onPress, variant = 'primary', theme, disabled, style }) {
  const bg = variant === 'primary' ? theme.cyan : theme.panelAlt;
  const color = variant === 'primary' ? '#0B1020' : theme.text;
  const borderColor = variant === 'ghost' ? theme.borderStrong : 'transparent';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, borderWidth: variant === 'ghost' ? 1 : 0, opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Bubble({ text, theme, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper onPress={onPress} activeOpacity={0.8} style={[styles.bubble, { backgroundColor: theme.panel, borderColor: theme.borderStrong }]}>
      <Text style={[styles.bubbleText, { color: theme.text }]}>{text}</Text>
    </Wrapper>
  );
}

export function Card({ children, theme, style }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.panel, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontWeight: '700', fontSize: 16 },
  bubble: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: 280,
    marginVertical: 10,
  },
  bubbleText: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
});
