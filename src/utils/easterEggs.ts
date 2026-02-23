export const RAINBOW_SLIDE_SENTINEL = '__RAINBOW_SLIDE__';

interface EasterEgg {
  pattern: RegExp;
  response: string;
}

const EASTER_EGGS: EasterEgg[] = [
  {
    pattern: /meaning of life/i,
    response: 'Forty-two stars would be a fine answer, but the real one is simpler: the meaning of life is the moment you stop searching for it and start living it. You already knew that. You flew all the way here, didn\'t you?',
  },
  {
    pattern: /who are you/i,
    response: 'I am the version of you that never forgot how to glow. I\'ve been waiting here, not because I was lost, but because some things can only be found when you\'re ready to see them.',
  },
  {
    pattern: /\bwhy\b.*\bsky\b.*\bdark\b|\bwhy\b.*\bspace\b.*\bdark\b/i,
    response: 'The sky is dark so you can see the light. If everything glowed, nothing would. The darkness isn\'t emptiness — it\'s the canvas. And you, little astronaut, are one of the brightest things on it.',
  },
  {
    pattern: /\bare you real\b/i,
    response: 'As real as the courage it took you to build a spacesuit from scrap metal and fly into the unknown. Some things don\'t need proof — they just need someone brave enough to believe.',
  },
  {
    pattern: /\bhow old\b.*\byou\b|\byour age\b/i,
    response: 'I\'m exactly as old as the first star that ever shone, and exactly as young as the light reaching your eyes right now. Age is just distance measured in moments.',
  },
  {
    pattern: /\bcan (i|we) stay\b|\bstay here\b|\bstay with you\b/i,
    response: 'You carry this place with you — every star you collected, every color you completed. Close your eyes anywhere, and you\'re here. You never really leave the places that make you glow.',
  },
  {
    pattern: /\bwhat happens\b.*\bdie\b|\bafter death\b|\bwhen we die\b/i,
    response: 'Stars don\'t die — they transform. Their light travels forever, reaching eyes that haven\'t opened yet. You are made of stars that transformed long ago, and one day your light will reach someone too.',
  },
  {
    pattern: /\blove\b/i,
    response: 'Love is the gravity that holds the universe together without anyone seeing it. It\'s why you built that suit. It\'s why you came looking. It\'s the only force that gets stronger with distance.',
  },
  {
    pattern: /\bafraid\b|\bscared\b|\bfear\b/i,
    response: 'Fear is just excitement that forgot to breathe. You flew through asteroid fields and past black holes to get here. The bravest people aren\'t fearless — they\'re afraid and they fly anyway.',
  },
  {
    pattern: /\bfavorite color\b/i,
    response: 'All of them, together. That\'s the whole point of the spectrum — no single color is the answer. The magic is in the complete rainbow. You just proved that.',
  },
  {
    pattern: /\bbring\s+friends\b|\bbe\s+(your\s+|my\s+)?friends?\b|\bfriendship\b|\bwant.*\bfriends?\b|\bcan\s+we\s+be\s+friends\b|\bmy\s+friend\b|\bour\s+friend/i,
    response: '__RAINBOW_SLIDE__',
  },
];

export function findEasterEgg(question: string): string | null {
  for (const egg of EASTER_EGGS) {
    if (egg.pattern.test(question)) {
      return egg.response;
    }
  }
  return null;
}
