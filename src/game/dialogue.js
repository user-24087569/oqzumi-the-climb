export const LINES = {
  greeting: [
    'Ready to climb, champion?',
    'Your brain called \u2014 it wants a workout.',
    'Let\u2019s beat that record today.',
    'I\u2019ve been practicing my puzzles. Have you?',
    'One tap and we\u2019re climbing.',
  ],
  newBest: [
    'WOW. New record! I\u2019m so proud right now.',
    'You just out-climbed yourself. Incredible.',
    'That\u2019s a new best! Want to go again?',
  ],
  goodRun: [
    'Solid climb! Let\u2019s push further next time.',
    'Nice work up there. Onward!',
    'You\u2019re getting sharper every run.',
  ],
  shortRun: [
    'Rough one \u2014 happens to everyone. Try again?',
    'Shake it off. Your best climb is still ahead.',
    'Even I trip on my own wires sometimes. Go again!',
  ],
};

export function pickLine(key) {
  const arr = LINES[key];
  return arr[Math.floor(Math.random() * arr.length)];
}
