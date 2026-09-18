import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { genPuzzle, TYPE_LABEL } from '../game/logic';

export default function PracticeScreen({ theme, practiceType, recordAnswer, recordStreak, onSessionEnd }) {
  const [difficulty, setDifficulty] = useState(1);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [puzzle, setPuzzle] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [pct, setPct] = useState(100);
  const [memPhase, setMemPhase] = useState('showing');
  const [memLitIndex, setMemLitIndex] = useState(-1);
  const [memInput, setMemInput] = useState([]);
  const [disabledOpts, setDisabledOpts] = useState([]);

  const answeredRef = useRef(false);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const newPuzzle = useCallback((diff) => {
    const p = genPuzzle(practiceType, diff);
    setPuzzle(p);
    setFeedback('');
    setDisabledOpts([]);
    answeredRef.current = false;
    if (practiceType === 'memory') {
      setMemPhase('showing');
      setMemInput([]);
      playSequence(p.seq, 0, diff);
    } else {
      startTimer(p.timeMs, () => resolve(false, true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceType]);

  useEffect(() => {
    newPuzzle(difficulty);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  function startTimer(ms, onTimeout) {
    clearTimers();
    const start = Date.now();
    setPct(100);
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, 100 - ((Date.now() - start) / ms) * 100);
      setPct(left);
      if (left <= 0) clearInterval(intervalRef.current);
    }, 60);
    timerRef.current = setTimeout(() => { if (!answeredRef.current) onTimeout(); }, ms);
  }

  function playSequence(seq, idx, diff) {
    if (idx >= seq.length) {
      setMemLitIndex(-1);
      setMemPhase('input');
      setFeedback('Your turn');
      startTimer(genPuzzle('memory', diff).inputMs, () => resolve(false, true));
      return;
    }
    setMemLitIndex(seq[idx]);
    setTimeout(() => {
      setMemLitIndex(-1);
      setTimeout(() => playSequence(seq, idx + 1, diff), 160);
    }, 400);
  }

  function resolve(isCorrect) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimers();

    setTotal((t) => t + 1);
    recordAnswer(practiceType, isCorrect);
    setFeedback(isCorrect ? 'Correct' : 'Not quite');

    let nextStreak = streak;
    if (isCorrect) {
      setCorrect((c) => c + 1);
      nextStreak = streak + 1;
      setStreak(nextStreak);
      setBestStreak((b) => Math.max(b, nextStreak));
      recordStreak(nextStreak);
    } else {
      nextStreak = 0;
      setStreak(0);
    }

    setTimeout(() => {
      setDifficulty((d) => Math.max(1, isCorrect ? d + 2 : d - 1));
    }, 550);
  }

  function onOptionPress(opt) {
    if (answeredRef.current) return;
    setDisabledOpts((d) => [...d, opt]);
    resolve(opt === puzzle.answer);
  }

  function onMemTile(i) {
    if (answeredRef.current || memPhase !== 'input') return;
    const nextInput = [...memInput, i];
    setMemInput(nextInput);
    const idx = nextInput.length - 1;
    if (puzzle.seq[idx] !== i) { resolve(false); return; }
    if (nextInput.length === puzzle.seq.length) resolve(true);
  }

  function endSession() {
    onSessionEnd({ type: practiceType, correct, total, bestStreak });
  }

  if (!puzzle) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.levelTag, { color: theme.text }]}>{TYPE_LABEL[practiceType]} practice</Text>
          {streak >= 3 && (
            <View style={[styles.streakTag, { backgroundColor: 'rgba(245,161,0,0.14)' }]}>
              <Text style={{ color: theme.amber, fontWeight: '700', fontSize: 12 }}>🔥 {streak}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={endSession}>
          <Text style={{ color: theme.textMuted, fontWeight: '600', fontSize: 13 }}>End session</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.rankStrip, { color: theme.textDim }]}>Difficulty {difficulty} · {correct}/{total} correct</Text>

      <View style={[styles.timerTrack, { backgroundColor: theme.panelAlt, borderColor: theme.border }]}>
        <View style={[styles.timerBar, { width: `${pct}%`, backgroundColor: theme.cyan }]} />
      </View>

      {practiceType === 'memory' && (
        <View style={styles.memGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <TouchableOpacity
              key={i}
              disabled={memPhase !== 'input'}
              onPress={() => onMemTile(i)}
              style={[styles.memTile, { backgroundColor: memLitIndex === i ? theme.amber : theme.panelAlt, borderColor: theme.border }]}
            />
          ))}
        </View>
      )}

      {(practiceType === 'math' || practiceType === 'logic') && (
        <>
          <View style={[styles.promptBox, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <Text style={[styles.promptText, { color: theme.text }]}>
              {practiceType === 'math' ? `${puzzle.text} = ?` : `${puzzle.seq.join('  →  ')}  →  ?`}
            </Text>
          </View>
          <View style={styles.optGrid}>
            {puzzle.opts.map((o) => {
              const isCorrect = answeredRef.current && o === puzzle.answer;
              return (
                <TouchableOpacity
                  key={o}
                  disabled={disabledOpts.includes(o) || answeredRef.current}
                  onPress={() => onOptionPress(o)}
                  style={[
                    styles.optBtn,
                    { backgroundColor: isCorrect ? 'rgba(34,181,115,0.15)' : theme.panel, borderColor: isCorrect ? theme.green : theme.border },
                  ]}
                >
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 18 }}>{o}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {practiceType === 'attention' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: puzzle.total }).map((_, i) => {
            const l = puzzle.baseLight + (i === puzzle.oddIndex ? puzzle.delta : 0);
            return (
              <TouchableOpacity key={i} onPress={() => resolve(i === puzzle.oddIndex)} style={{ width: `${100 / puzzle.n}%`, aspectRatio: 1, padding: 4 }}>
                <View style={{ flex: 1, borderRadius: 8, backgroundColor: `hsl(${puzzle.baseHue}deg ${puzzle.baseSat}% ${l}%)` }} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={[styles.feedback, { color: theme.textMuted }]}>{feedback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18, paddingTop: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  levelTag: { fontSize: 17, fontWeight: '700' },
  streakTag: { marginLeft: 8, borderRadius: 100, paddingVertical: 3, paddingHorizontal: 9 },
  rankStrip: { textAlign: 'center', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  timerTrack: { height: 6, borderRadius: 4, borderWidth: 1, overflow: 'hidden', marginBottom: 18 },
  timerBar: { height: '100%', borderRadius: 4 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  memTile: { width: '30%', aspectRatio: 1, borderRadius: 14, borderWidth: 1 },
  promptBox: { borderWidth: 1, borderRadius: 16, paddingVertical: 28, paddingHorizontal: 16, alignItems: 'center', marginBottom: 16 },
  promptText: { fontSize: 24, fontWeight: '700' },
  optGrid: { flexDirection: 'row', gap: 9 },
  optBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  feedback: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 12, minHeight: 18 },
});
