import { findEasterEgg, RAINBOW_SLIDE_SENTINEL } from '../utils/easterEggs';

const STARKID_ANSWERS: string[] = [
  'The universe doesn\'t keep secrets — it just waits for someone curious enough to look. You looked. That\'s the whole answer.',
  'Every star you collected was already inside you. You just needed the journey to remember where you put them.',
  'The bravest thing you can do is be exactly who you are, even when the universe feels too big for it. Especially then.',
  'You didn\'t fly all this way to find me. You flew all this way to find out that you could. And you can. You always could.',
  'There is no wrong question and no wrong path. Every direction you choose becomes the right one the moment you take the first step.',
  'The light you see in the stars? That\'s the same light in you. Distance doesn\'t dim it — it just makes it harder to notice. But it\'s there.',
  'Some things can\'t be taught. They can only be discovered. And you just discovered something most people spend their whole lives looking for.',
  'The darkness between the stars isn\'t empty. It\'s full of possibilities that haven\'t chosen their shape yet. Just like you.',
  'You built a spacesuit out of scraps and flew into the unknown. That\'s not recklessness — that\'s faith. And faith is just courage that learned to fly.',
  'The answer to your question has been traveling toward you at the speed of light since before you were born. You just had to be here to catch it.',
];

export class QuestionUI {
  private container: HTMLDivElement;
  private onComplete: () => void;
  private onRainbowSlide: (() => void) | null;
  private answerIndex = Math.floor(Math.random() * STARKID_ANSWERS.length);

  constructor(onComplete: () => void, onRainbowSlide?: () => void) {
    this.onComplete = onComplete;
    this.onRainbowSlide = onRainbowSlide ?? null;
    this.container = document.createElement('div');
    this.container.id = 'question-ui';
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      pointerEvents: 'all',
      opacity: '0',
      transition: 'opacity 1.5s ease-in-out',
      background: 'radial-gradient(ellipse at center, rgba(10,5,20,0.85) 0%, rgba(5,5,16,0.95) 100%)',
    });

    document.getElementById('game-container')!.appendChild(this.container);
    requestAnimationFrame(() => { this.container.style.opacity = '1'; });

    this.showPrompt();
  }

  private showPrompt(): void {
    this.container.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <p style="color: #ffeedd; font-family: Georgia, serif; font-size: 24px; font-style: italic; margin-bottom: 40px; line-height: 1.6; text-shadow: 0 0 30px rgba(255,215,100,0.5), 0 0 60px rgba(255,200,100,0.2);">
          "You've found StarKid. You may ask him one question."
        </p>
        <div style="position: relative;">
          <input type="text" id="starkid-question" placeholder="Ask your question..." style="
            width: 100%;
            padding: 16px 24px;
            font-size: 18px;
            font-family: Georgia, serif;
            background: rgba(20, 15, 30, 0.8);
            border: 1px solid rgba(255, 200, 100, 0.3);
            border-radius: 30px;
            color: #ffeedd;
            outline: none;
            box-shadow: 0 0 30px rgba(255, 200, 100, 0.1);
          " />
        </div>
        <button id="starkid-ask" style="
          margin-top: 20px;
          padding: 12px 36px;
          font-size: 16px;
          font-family: Georgia, serif;
          background: rgba(255, 200, 100, 0.15);
          border: 1px solid rgba(255, 200, 100, 0.3);
          border-radius: 25px;
          color: #ffeedd;
          cursor: pointer;
          transition: all 0.3s;
        ">Ask StarKid</button>
      </div>
    `;

    const input = document.getElementById('starkid-question') as HTMLInputElement;
    const button = document.getElementById('starkid-ask') as HTMLButtonElement;

    input.focus();

    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') submit();
    });

    const submit = () => {
      const question = input.value.trim();
      if (!question) return;
      button.disabled = true;
      button.textContent = 'Listening to the stars...';
      input.disabled = true;
      this.submitQuestion(question);
    };

    button.addEventListener('click', submit);
  }

  private submitQuestion(question: string): void {
    const easterEgg = findEasterEgg(question);
    if (easterEgg) {
      if (easterEgg === RAINBOW_SLIDE_SENTINEL && this.onRainbowSlide) {
        this.onRainbowSlide();
        return;
      }
      this.showAnswer(easterEgg);
      return;
    }
    const answer = STARKID_ANSWERS[this.answerIndex];
    this.answerIndex = (this.answerIndex + 1) % STARKID_ANSWERS.length;
    this.showAnswer(answer);
  }

  private showAnswer(answer: string): void {
    this.container.innerHTML = `
      <div style="text-align: center; max-width: 650px; padding: 40px;">
        <div id="starkid-answer" style="
          color: #ffeedd;
          font-family: Georgia, serif;
          font-size: 22px;
          line-height: 1.8;
          text-shadow: 0 0 15px rgba(255, 200, 100, 0.2);
          opacity: 0;
          transition: opacity 2s ease-in;
        "></div>
      </div>
    `;

    const answerEl = document.getElementById('starkid-answer')!;
    requestAnimationFrame(() => { answerEl.style.opacity = '1'; });

    this.typewriterEffect(answerEl, answer);
  }

  private typewriterEffect(element: HTMLElement, text: string): void {
    let index = 0;
    const speed = 40;

    const type = () => {
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        index++;
        setTimeout(type, speed);
      } else {
        setTimeout(() => this.onComplete(), 3000);
      }
    };

    setTimeout(type, 1000);
  }

  destroy(): void {
    this.container.remove();
  }
}
