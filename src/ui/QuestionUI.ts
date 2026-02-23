import { askStarKid } from '../api/claude';
import { findEasterEgg } from '../utils/easterEggs';

export class QuestionUI {
  private container: HTMLDivElement;
  private onComplete: () => void;

  constructor(onComplete: () => void) {
    this.onComplete = onComplete;
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
    });

    document.getElementById('game-container')!.appendChild(this.container);
    requestAnimationFrame(() => { this.container.style.opacity = '1'; });

    this.showPrompt();
  }

  private showPrompt(): void {
    this.container.innerHTML = `
      <div style="text-align: center; max-width: 600px; padding: 40px;">
        <p style="color: #eeddcc; font-family: Georgia, serif; font-size: 22px; font-style: italic; margin-bottom: 40px; line-height: 1.6; text-shadow: 0 0 20px rgba(255,200,100,0.3);">
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

    const submit = () => {
      const question = input.value.trim();
      if (!question) return;
      button.disabled = true;
      button.textContent = 'Listening to the stars...';
      input.disabled = true;
      this.submitQuestion(question);
    };

    button.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
  }

  private async submitQuestion(question: string): Promise<void> {
    const easterEgg = findEasterEgg(question);
    if (easterEgg) {
      this.showAnswer(easterEgg);
      return;
    }
    const answer = await askStarKid(question);
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
