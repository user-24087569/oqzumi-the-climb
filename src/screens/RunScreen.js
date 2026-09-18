import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { rankFor, genPuzzle, pickType, TYPE_LABEL } from '../game/logic';

const HEART_PATH = 'M12 21s-7.5-4.7-10-9.3C.5 8 2.4 4.5 6 4.5c2 0 3.5 1.1 4.5 2.6.9-1.5 2.4-2.6 4.5-2.6 3.6 0 5.5 3.5 4 7.2C19.5 16.3 12 21 12 21z';

export default function RunScreen({ theme, bestLevel, recordAnswer, recordStreak, onRunEnd, startLevel }) {
  const [level, setLevel] = useState(startLevel);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [bonusGiven, setBonusGiven] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(1);
  const [puzzle, setPuzzle] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [pct, setPct] = useState(100); // timer bar percent
  const [memPhase, setMemPhase] = useState('showing'); // 'showing' | 'input'
  const [memLitIndex, setMemLitIndex] = useState(-1);
  const [memInput, setMemInput] = useState([]);
  const [hintFlag, setHintFlag] = useState(null); // index to highlight
  const [disabledOpts, setDisabledOpts] = useState([]);

  const runBestAtStart = useRef(bestLevel);
  const skillStats = useRef({ memory: { c: 0, t: 0 }, math: { c: 0, t: 0 }, attention: { c: 0, t: 0 }, logic: { c: 0, t: 0 } });
  const answeredRef = useRef(false);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const newPuzzle = useCallback((lvl) => {
    const type = pickType();
    const p = genPuzzle(type, lvl);
    setPuzzle(p);
    setFeedback('');
    setDisabledOpts([]);
    setHintFlag(null);
    answeredRef.current = false;
    if (type === 'memory') {
      setMemPhase('showing');
      setMemInput([]);
      playSequence(p.seq, 0);
    } else {
      startTimer(p.timeMs, () => resolve(false, true));
    }
  }, []);

  useEffect(() => {
    newPuzzle(level);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function startTimer(ms, onTimeout) {
    clearTimers();
    const start = Date.now();
    setPct(100);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, 100 - (elapsed / ms) * 100);
      setPct(left);
      if (left <= 0) clearInterval(intervalRef.current);
    }, 60);
    timerRef.current = setTimeout(() => {
      if (!answeredRef.current) onTimeout();
    }, ms);
  }

  function playSequence(seq, idx) {
    if (idx >= seq.length) {
      setMemLitIndex(-1);
      setMemPhase('input');
      setFeedback('Your turn');
      startTimer(genPuzzle('memory', level).inputMs, () => resolve(false, true));
      return;
    }
    setMemLitIndex(seq[idx]);
    setTimeout(() => {
      setMemLitIndex(-1);
      setTimeout(() => playSequence(seq, idx + 1), 160);
    }, 400);
  }

  function resolve(correct, timedOut) {
    if (answeredRef.current) return;
    answeredRef.current = true;
    clearTimers();

    const type = puzzle.type;
    skillStats.current[type].t += 1;
    if (correct) skillStats.current[type].c += 1;
    recordAnswer(type, correct);
    setFeedback(correct ? 'Correct' : timedOut ? 'Too slow' : 'Not quite');

    let nextStreak = streak;
    let nextLives = lives;
    if (correct) {
      nextStreak = streak + 1;
      setStreak(nextStreak);
      recordStreak(nextStreak);
      if (nextStreak >= 10 && !bonusGiven) {
        setBonusGiven(true);
        nextLives = lives + 1;
        setLives(nextLives);
      }
    } else {
      nextStreak = 0;
      setStreak(0);
      nextLives = lives - 1;
      setLives(nextLives);
    }

    setTimeout(() => {
      if (nextLives <= 0) {
        onRunEnd({ level, startLevel, skillStats: skillStats.current });
      } else {
        setLevel((l) => Math.min(1000, l + 1));
      }
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
    const ok = puzzle.seq[idx] === i;
    if (!ok) { resolve(false); return; }
    if (nextInput.length === puzzle.seq.length) resolve(true);
  }

  function useHint() {
    if (hintsLeft <= 0 || answeredRef.current) return;
    setHintsLeft(0);
    if (puzzle.type === 'math' || puzzle.type === 'logic') {
      const wrong = puzzle.opts.filter((o) => o !== puzzle.answer && !disabledOpts.includes(o));
      if (wrong.length) setDisabledOpts((d) => [...d, wrong[Math.floor(Math.random() * wrong.length)]]);
    } else if (puzzle.type === 'attention') {
      setHintFlag(puzzle.oddIndex);
      setTimeout(() => setHintFlag(null), 900);
    } else if (puzzle.type === 'memory' && memPhase === 'input') {
      setMemLitIndex(puzzle.seq[memInput.length]);
      setTimeout(() => setMemLitIndex(-1), 500);
    }
  }

  if (!puzzle) return null;
  const rank = rankFor(level);
  const pace = runBestAtStart.current > 0
    ? (level > runBestAtStart.current ? '✨ Ahead of your best run' : `${runBestAtStart.current - level} levels from your best`)
    : '';

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <View style={styles.topRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.levelTag, { color: theme.text }]}>Level {level}</Text>
          {streak >= 3 && (
            <View style={[styles.streakTag, { backgroundColor: 'rgba(245,161,0,0.14)' }]}>
              <Text style={{ color: theme.amber, fontWeight: '700', fontSize: 12 }}>🔥 {streak}</Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <Svg key={i} width={16} height={16} viewBox="0 0 24 24">
              <Path d={HEART_PATH} fill={i < lives ? theme.pink : theme.textDim} opacity={i < lives ? 1 : 0.3} />
            </Svg>
          ))}
        </View>
      </View>
      <Text style={[styles.rankStrip, { color: rank.color }]}>{rank.name}</Text>
      {!!pace && <Text style={[styles.paceStrip, { color: level > runBestAtStart.current ? theme.green : theme.textDim }]}>{pace}</Text>}

      <View style={[styles.timerTrack, { backgroundColor: theme.panelAlt, borderColor: theme.border }]}>
        <View style={[styles.timerBar, { width: `${pct}%`, backgroundColor: theme.cyan }]} />
      </View>

      <Text style={[styles.kicker, { color: theme.violet }]}>{TYPE_LABEL[puzzle.type].toUpperCase()}</Text>

      {puzzle.type === 'memory' && (
        <View style={styles.memGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <TouchableOpacity
              key={i}
              disabled={memPhase !== 'input'}
              onPress={() => onMemTile(i)}
              style={[
                styles.memTile,
                {
                  backgroundColor:
                    memLitIndex === i ? theme.amber :
                    memInput[memInput.length - 1] === i && memInput.length <= puzzle.seq.length ? theme.panelAlt :
                    theme.panelAlt,
                  borderColor: theme.border,
                },
              ]}
            />
          ))}
        </View>
      )}

      {(puzzle.type === 'math' || puzzle.type === 'logic') && (
        <>
          <View style={[styles.promptBox, { backgroundColor: theme.panel, borderColor: theme.border }]}>
            <Text style={[styles.promptText, { color: theme.text }]}>
              {puzzle.type === 'math' ? `${puzzle.text} = ?` : `${puzzle.seq.join('  →  ')}  →  ?`}
            </Text>
          </View>
          <View style={styles.optGrid}>
            {puzzle.opts.map((o) => {
              const isDisabled = disabledOpts.includes(o) || answeredRef.current;
              const isCorrect = answeredRef.current && o === puzzle.answer;
              return (
                <TouchableOpacity
                  key={o}
                  disabled={isDisabled}
                  onPress={() => onOptionPress(o)}
                  style={[
                    styles.optBtn,
                    {
                      backgroundColor: isCorrect ? 'rgba(34,181,115,0.15)' : theme.panel,
                      borderColor: isCorrect ? theme.green : theme.border,
                      opacity: disabledOpts.includes(o) && !isCorrect ? 0.3 : 1,
                    },
                  ]}
                >
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 18 }}>{o}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {puzzle.type === 'attention' && (
        <View style={[styles.attGrid, { flexDirection: 'row', flexWrap: 'wrap' }]}>
          {Array.from({ length: puzzle.total }).map((_, i) => {
            const l = puzzle.baseLight + (i === puzzle.oddIndex ? puzzle.delta : 0);
            const size = `${100 / puzzle.n}%`;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => resolve(i === puzzle.oddIndex)}
                style={{
                  width: size, aspectRatio: 1, padding: 4,
                }}
              >
                <View
                  style={{
                    flex: 1, borderRadius: 8,
                    backgroundColor: `hsl(${puzzle.baseHue}deg ${puzzle.baseSat}% ${l}%)`,
                    borderWidth: hintFlag === i ? 3 : 0,
                    borderColor: theme.amber,
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={[styles.feedback, { color: theme.textMuted }]}>{feedback}</Text>

      <TouchableOpacity
        onPress={useHint}
        disabled={hintsLeft <= 0}
        style={[styles.hintBtn, { opacity: hintsLeft <= 0 ? 0.35 : 1, borderColor: theme.amber }]}
      >
        <Text style={{ color: theme.amber, fontWeight: '700', fontSize: 13 }}>
          💡 {hintsLeft > 0 ? 'Hint (1 left)' : 'No hints left'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 18, paddingTop: 50 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  levelTag: { fontSize: 19, fontWeight: '700' },
  streakTag: { marginLeft: 8, borderRadius: 100, paddingVertical: 3, paddingHorizontal: 9 },
  rankStrip: { textAlign: 'center', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  paceStrip: { textAlign: 'center', fontSize: 11, fontWeight: '600', marginBottom: 10 },
  timerTrack: { height: 6, borderRadius: 4, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  timerBar: { height: '100%', borderRadius: 4 },
  kicker: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  memGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  memTile: { width: '30%', aspectRatio: 1, borderRadius: 14, borderWidth: 1 },
  promptBox: { borderWidth: 1, borderRadius: 16, paddingVertical: 28, paddingHorizontal: 16, alignItems: 'center', marginBottom: 16 },
  promptText: { fontSize: 24, fontWeight: '700' },
  optGrid: { flexDirection: 'row', gap: 9 },
  optBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  attGrid: { marginBottom: 8 },
  feedback: { textAlign: 'center', fontSize: 14, fontWeight: '600', marginTop: 12, minHeight: 18 },
  hintBtn: { alignSelf: 'center', marginTop: 12, borderWidth: 1, borderRadius: 100, paddingVertical: 8, paddingHorizontal: 16 },
});
