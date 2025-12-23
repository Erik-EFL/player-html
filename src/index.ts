/**
 * Player HTML5
 * Um player de mídia HTML5 versátil
 */

export class PlayerHTML {
  private element: HTMLMediaElement | null = null;
  
  constructor(selector: string) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLMediaElement) {
      this.element = el;
    } else {
      throw new Error(`Element ${selector} is not a valid media element`);
    }
  }

  /**
   * Reproduz o media
   */
  play(): void {
    this.element?.play();
  }

  /**
   * Pausa o media
   */
  pause(): void {
    this.element?.pause();
  }

  /**
   * Define o volume (0.0 a 1.0)
   */
  setVolume(volume: number): void {
    if (this.element) {
      this.element.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Obtém o tempo atual
   */
  getCurrentTime(): number {
    return this.element?.currentTime || 0;
  }

  /**
   * Define o tempo atual
   */
  setCurrentTime(time: number): void {
    if (this.element) {
      this.element.currentTime = time;
    }
  }
}

export default PlayerHTML;
