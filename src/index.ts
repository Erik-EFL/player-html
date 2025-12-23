/**
 * Player HTML5 completo com filas, modos de repetição, shuffle e suporte a acessibilidade.
 *
 * A classe `PlayerHTML` cria um player MP3 com interface pronta, controles acessíveis
 * e APIs de controle para ser reutilizado em qualquer projeto web.
 */

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerTrack {
  /**
   * Identificador único opcional (usado para persistência e depuração)
   */
  id?: string;
  /**
   * Caminho ou URL do arquivo MP3
   */
  src: string;
  /**
   * Nome da faixa exibido na interface
   */
  title: string;
  /**
   * Artista ou autor exibido na interface
   */
  artist?: string;
  /**
   * URL da capa opcional
   */
  cover?: string;
}

export interface PlayerOptions {
  /**
   * Lista de faixas que formarão a fila/playlist
   */
  tracks: PlayerTrack[];
  /**
   * Índice da faixa inicial (padrão: 0)
   */
  startIndex?: number;
  /**
   * Elemento ou seletor CSS do contêiner onde o player será renderizado
   */
  container?: string | HTMLElement;
  /**
   * Valor inicial do volume (0 a 1)
   */
  initialVolume?: number;
  /**
   * Preload padrão do elemento de áudio
   */
  preload?: 'auto' | 'metadata' | 'none';
  /**
   * Chave de persistência no localStorage. Quando informada, o player restaura
   * estado (faixa, posição, volume, modos) e salva automaticamente.
   */
  persistKey?: string;
  /**
   * Injeta estilos padrão (padrão: true). Desative para aplicar seus próprios estilos.
   */
  injectStyles?: boolean;
  /**
   * Habilita atalhos de teclado globais (padrão: true)
   */
  keyboardShortcuts?: boolean;
}

interface PersistedState {
  currentIndex: number;
  currentTime: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffle: boolean;
}

interface PlayerElements {
  playButton: HTMLButtonElement;
  previousButton: HTMLButtonElement;
  nextButton: HTMLButtonElement;
  rewindButton: HTMLButtonElement;
  forwardButton: HTMLButtonElement;
  shuffleButton: HTMLButtonElement;
  repeatButton: HTMLButtonElement;
  muteButton: HTMLButtonElement;
  progress: HTMLInputElement;
  volume: HTMLInputElement;
  elapsed: HTMLElement;
  duration: HTMLElement;
  nowTitle: HTMLElement;
  nowArtist: HTMLElement;
  nowCover: HTMLImageElement;
  queue: HTMLOListElement;
  status: HTMLElement;
}

const DEFAULT_STYLES = `
  :host, .mp3-player { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .mp3-player { background: #0f172a; color: #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); max-width: 420px; }
  .mp3-player__header { display: grid; grid-template-columns: 72px 1fr; gap: 12px; align-items: center; margin-bottom: 12px; }
  .mp3-player__cover { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; background: #1e293b; }
  .mp3-player__title { font-weight: 700; font-size: 1.05rem; }
  .mp3-player__artist { color: #cbd5e1; font-size: 0.9rem; margin-top: 2px; }
  .mp3-player__controls { display: flex; gap: 8px; justify-content: center; margin: 12px 0; flex-wrap: wrap; }
  .mp3-player__button { border: none; background: #1e293b; color: inherit; padding: 10px; border-radius: 12px; cursor: pointer; min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
  .mp3-player__button[aria-pressed="true"] { background: #22c55e; color: #0f172a; }
  .mp3-player__button:focus-visible { outline: 3px solid #38bdf8; outline-offset: 2px; }
  .mp3-player__progress { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; }
  .mp3-player__range { width: 100%; accent-color: #22c55e; }
  .mp3-player__secondary { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
  .mp3-player__queue { margin: 0; padding: 0; list-style: none; max-height: 220px; overflow: auto; border-top: 1px solid #1e293b; }
  .mp3-player__queue-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 4px; border-bottom: 1px solid #1e293b; }
  .mp3-player__queue-item button { background: transparent; border: none; color: inherit; cursor: pointer; text-align: left; width: 100%; padding: 8px; border-radius: 8px; }
  .mp3-player__queue-item button:hover, .mp3-player__queue-item button:focus-visible { background: #1e293b; outline: none; }
  .mp3-player__queue-item--active button { font-weight: 700; color: #22c55e; }
  .mp3-player__sr { position: absolute; clip: rect(1px, 1px, 1px, 1px); width: 1px; height: 1px; overflow: hidden; }
`;

export class PlayerHTML {
  private audio: HTMLAudioElement;
  private elements!: PlayerElements;
  private tracks: PlayerTrack[];
  private currentIndex: number;
  private repeatMode: RepeatMode = 'off';
  private shuffleEnabled = false;
  private shuffledOrder: number[] = [];
  private persistKey?: string;
  private pendingSeek: number | null = null;
  private keyboardShortcuts: boolean;
  private container: HTMLElement;
  private preload: 'auto' | 'metadata' | 'none';

  constructor(options: PlayerOptions) {
    if (!options.tracks || options.tracks.length === 0) {
      throw new Error('É necessário informar ao menos uma faixa para o player.');
    }

    this.tracks = options.tracks;
    this.currentIndex = options.startIndex ?? 0;
    this.persistKey = options.persistKey;
    this.keyboardShortcuts = options.keyboardShortcuts ?? true;
    this.preload = options.preload ?? 'metadata';

    const container =
      typeof options.container === 'string'
        ? (document.querySelector(options.container) as HTMLElement | null)
        : options.container;
    if (!container) {
      throw new Error('Contêiner do player não encontrado.');
    }
    this.container = container;
    this.container.classList.add('mp3-player');

    if (options.injectStyles ?? true) {
      PlayerHTML.injectDefaultStyles();
    }

    this.audio = document.createElement('audio');
    this.audio.preload = this.preload;
    this.audio.className = 'mp3-player__audio';
    this.audio.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.audio);

    this.buildUI();
    const restored = this.restoreState();
    const startIndex = restored?.currentIndex ?? this.currentIndex;
    this.shuffleEnabled = restored?.shuffle ?? false;
    this.repeatMode = restored?.repeatMode ?? 'off';

    this.loadTrack(startIndex, restored?.currentTime ?? 0);
    this.audio.volume = restored?.volume ?? options.initialVolume ?? 0.8;
    this.elements.volume.value = String(this.audio.volume);
    this.updateVolumeAria();

    this.bindAudioEvents();
    this.bindControlEvents();
    if (this.keyboardShortcuts) {
      this.bindKeyboardShortcuts();
    }
    this.updateRepeatButton();
    this.updateShuffleButton();
    this.updateQueue();
  }

  /** Reproduz a faixa atual */
  play(): void {
    this.audio.play().then(() => {
      this.elements.playButton.setAttribute('aria-pressed', 'true');
      this.elements.playButton.textContent = 'Pausar';
      this.announce(`Tocando: ${this.getCurrentTrack().title}`);
    }).catch(() => {
      // Navegadores podem bloquear autoplay; não lança erro para não quebrar UX
    });
  }

  /** Pausa a faixa atual */
  pause(): void {
    this.audio.pause();
    this.elements.playButton.setAttribute('aria-pressed', 'false');
    this.elements.playButton.textContent = 'Tocar';
    this.announce('Pausado');
  }

  /** Avança para a próxima faixa */
  next(): void {
    const nextIndex = this.getNextIndex();
    if (nextIndex !== null) {
      this.loadTrack(nextIndex);
      this.play();
    }
  }

  /** Volta para a faixa anterior */
  previous(): void {
    const previousIndex = this.getPreviousIndex();
    if (previousIndex !== null) {
      this.loadTrack(previousIndex);
      this.play();
    }
  }

  /** Ativa/desativa o modo shuffle */
  toggleShuffle(): void {
    this.shuffleEnabled = !this.shuffleEnabled;
    if (this.shuffleEnabled) {
      this.shuffledOrder = this.buildShuffledOrder();
    }
    this.updateShuffleButton();
    this.updateQueue();
    this.persist();
  }

  /** Cicla entre modos de repetição: off -> all -> one */
  toggleRepeat(): void {
    if (this.repeatMode === 'off') {
      this.repeatMode = 'all';
    } else if (this.repeatMode === 'all') {
      this.repeatMode = 'one';
    } else {
      this.repeatMode = 'off';
    }
    this.updateRepeatButton();
    this.persist();
  }

  /** Retorna a faixa atual */
  getCurrentTrack(): PlayerTrack {
    return this.tracks[this.currentIndex];
  }

  /** Define o volume (0-1) */
  setVolume(volume: number): void {
    const safeVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = safeVolume;
    this.elements.volume.value = String(safeVolume);
    this.updateVolumeAria();
    this.persist();
  }

  /** Move o tempo de reprodução */
  seek(seconds: number): void {
    this.audio.currentTime = Math.max(0, Math.min(this.audio.duration || 0, seconds));
    this.updateProgress();
  }

  private static injectDefaultStyles(): void {
    const styleId = 'player-html-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = DEFAULT_STYLES;
    document.head.appendChild(style);
  }

  private buildUI(): void {
    this.container.innerHTML = `
      <div class="mp3-player__header">
        <img class="mp3-player__cover" alt="Capa do álbum" />
        <div>
          <div class="mp3-player__title" aria-live="polite"></div>
          <div class="mp3-player__artist"></div>
        </div>
      </div>
      <div class="mp3-player__controls" role="group" aria-label="Controles principais">
        <button type="button" class="mp3-player__button" data-action="previous" aria-label="Faixa anterior">⏮</button>
        <button type="button" class="mp3-player__button" data-action="rewind" aria-label="Voltar 10 segundos">⏪</button>
        <button type="button" class="mp3-player__button" data-action="play" aria-label="Tocar ou pausar" aria-pressed="false">Tocar</button>
        <button type="button" class="mp3-player__button" data-action="forward" aria-label="Avançar 10 segundos">⏩</button>
        <button type="button" class="mp3-player__button" data-action="next" aria-label="Próxima faixa">⏭</button>
      </div>
      <div class="mp3-player__progress">
        <span class="mp3-player__time" data-el="elapsed">0:00</span>
        <input type="range" class="mp3-player__range" data-el="progress" min="0" max="0" value="0" step="0.1" aria-label="Progresso da faixa" />
        <span class="mp3-player__time" data-el="duration">0:00</span>
      </div>
      <div class="mp3-player__secondary" role="group" aria-label="Ajustes">
        <button type="button" class="mp3-player__button" data-action="shuffle" aria-label="Alternar modo aleatório" aria-pressed="false">Shuffle</button>
        <button type="button" class="mp3-player__button" data-action="repeat" aria-label="Modo repetição: desligado" aria-pressed="false">Repeat</button>
        <button type="button" class="mp3-player__button" data-action="mute" aria-label="Ativar ou desativar mudo">🔇</button>
        <label>
          <span class="mp3-player__sr">Volume</span>
          <input type="range" class="mp3-player__range" data-el="volume" min="0" max="1" step="0.01" value="0.8" aria-label="Volume" />
        </label>
      </div>
      <div aria-live="polite" data-el="status" class="mp3-player__sr"></div>
      <ol class="mp3-player__queue" data-el="queue" aria-label="Fila de reprodução"></ol>
    `;

    this.elements = {
      playButton: this.container.querySelector('[data-action="play"]') as HTMLButtonElement,
      previousButton: this.container.querySelector('[data-action="previous"]') as HTMLButtonElement,
      nextButton: this.container.querySelector('[data-action="next"]') as HTMLButtonElement,
      rewindButton: this.container.querySelector('[data-action="rewind"]') as HTMLButtonElement,
      forwardButton: this.container.querySelector('[data-action="forward"]') as HTMLButtonElement,
      shuffleButton: this.container.querySelector('[data-action="shuffle"]') as HTMLButtonElement,
      repeatButton: this.container.querySelector('[data-action="repeat"]') as HTMLButtonElement,
      muteButton: this.container.querySelector('[data-action="mute"]') as HTMLButtonElement,
      progress: this.container.querySelector('[data-el="progress"]') as HTMLInputElement,
      volume: this.container.querySelector('[data-el="volume"]') as HTMLInputElement,
      elapsed: this.container.querySelector('[data-el="elapsed"]') as HTMLElement,
      duration: this.container.querySelector('[data-el="duration"]') as HTMLElement,
      nowTitle: this.container.querySelector('.mp3-player__title') as HTMLElement,
      nowArtist: this.container.querySelector('.mp3-player__artist') as HTMLElement,
      nowCover: this.container.querySelector('.mp3-player__cover') as HTMLImageElement,
      queue: this.container.querySelector('[data-el="queue"]') as HTMLOListElement,
      status: this.container.querySelector('[data-el="status"]') as HTMLElement,
    };
  }

  private bindAudioEvents(): void {
    this.audio.addEventListener('timeupdate', () => {
      this.updateProgress();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.updateDuration();
      if (this.pendingSeek !== null) {
        this.audio.currentTime = this.pendingSeek;
        this.pendingSeek = null;
      }
      this.updateProgress();
    });

    this.audio.addEventListener('ended', () => {
      if (this.repeatMode === 'one') {
        this.audio.currentTime = 0;
        this.play();
        return;
      }
      const nextIndex = this.getNextIndex();
      if (nextIndex !== null) {
        this.loadTrack(nextIndex);
        this.play();
      } else {
        this.pause();
      }
    });

    this.audio.addEventListener('volumechange', () => {
      this.elements.muteButton.textContent = this.audio.muted ? '🔈' : '🔇';
      this.updateVolumeAria();
      this.persist();
    });
  }

  private bindControlEvents(): void {
    this.elements.playButton.addEventListener('click', () => {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    });

    this.elements.previousButton.addEventListener('click', () => this.previous());
    this.elements.nextButton.addEventListener('click', () => this.next());

    this.elements.rewindButton.addEventListener('click', () => {
      this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
    });

    this.elements.forwardButton.addEventListener('click', () => {
      const duration = this.audio.duration || 0;
      this.audio.currentTime = Math.min(duration, this.audio.currentTime + 10);
    });

    this.elements.shuffleButton.addEventListener('click', () => this.toggleShuffle());
    this.elements.repeatButton.addEventListener('click', () => this.toggleRepeat());

    this.elements.muteButton.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
      this.elements.muteButton.setAttribute('aria-pressed', String(this.audio.muted));
    });

    this.elements.progress.addEventListener('input', (event) => {
      const input = event.target as HTMLInputElement;
      const value = Number(input.value);
      const duration = this.audio.duration || 0;
      const seconds = duration * (value / 100);
      this.audio.currentTime = seconds;
      this.updateProgress();
    });

    this.elements.volume.addEventListener('input', (event) => {
      const input = event.target as HTMLInputElement;
      const value = Number(input.value);
      this.setVolume(value);
    });
  }

  private bindKeyboardShortcuts(): void {
    this.container.addEventListener('keydown', (event) => this.handleShortcut(event));
    document.addEventListener('keydown', (event) => {
      if (this.container.contains(document.activeElement)) return;
      this.handleShortcut(event);
    });
  }

  private handleShortcut(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement) return;
    switch (event.key.toLowerCase()) {
      case ' ': // espaço
        event.preventDefault();
        this.audio.paused ? this.play() : this.pause();
        break;
      case 'arrowright':
        this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 5);
        break;
      case 'arrowleft':
        this.audio.currentTime = Math.max(0, this.audio.currentTime - 5);
        break;
      case 'l':
        this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 10);
        break;
      case 'j':
        this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
        break;
      case 'n':
        this.next();
        break;
      case 'p':
        this.previous();
        break;
      case 'm':
        this.audio.muted = !this.audio.muted;
        break;
    }
  }

  private loadTrack(index: number, startTime = 0): void {
    if (index < 0 || index >= this.tracks.length) return;
    this.currentIndex = index;
    const track = this.tracks[index];

    this.audio.src = track.src;
    this.audio.preload = this.preload;
    this.pendingSeek = startTime;

    this.elements.nowTitle.textContent = track.title;
    this.elements.nowArtist.textContent = track.artist ?? 'Artista desconhecido';
    this.elements.nowCover.src = track.cover ?? '';
    this.elements.nowCover.alt = track.cover ? `Capa de ${track.title}` : 'Capa da faixa';

    this.updateQueue();
    this.updateMediaSession(track);
    this.persist();
    this.announce(`Selecionado: ${track.title}`);
  }

  private updateQueue(): void {
    const order = this.getOrderedIndices();
    this.elements.queue.innerHTML = '';

    order.forEach((trackIndex) => {
      const track = this.tracks[trackIndex];
      const li = document.createElement('li');
      li.className = 'mp3-player__queue-item';
      if (trackIndex === this.currentIndex) {
        li.classList.add('mp3-player__queue-item--active');
      }
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${track.title}${track.artist ? ` — ${track.artist}` : ''}`;
      button.setAttribute('aria-label', `Tocar ${track.title}`);
      button.addEventListener('click', () => {
        this.loadTrack(trackIndex);
        this.play();
      });
      li.appendChild(button);
      this.elements.queue.appendChild(li);
    });
  }

  private updateMediaSession(track: PlayerTrack): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist ?? '',
        artwork: track.cover ? [{ src: track.cover, sizes: '512x512', type: 'image/png' }] : [],
      });
      navigator.mediaSession.setActionHandler?.('play', () => this.play());
      navigator.mediaSession.setActionHandler?.('pause', () => this.pause());
      navigator.mediaSession.setActionHandler?.('previoustrack', () => this.previous());
      navigator.mediaSession.setActionHandler?.('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler?.('seekbackward', () => {
        this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler?.('seekforward', () => {
        this.audio.currentTime = Math.min(this.audio.duration || 0, this.audio.currentTime + 10);
      });
      navigator.mediaSession.setActionHandler?.('seekto', (details: MediaSessionActionDetails) => {
        if (typeof details.seekTime === 'number') {
          this.audio.currentTime = details.seekTime;
        }
      });
    }
  }

  private updateProgress(): void {
    const duration = this.audio.duration || 0;
    const current = this.audio.currentTime || 0;
    this.elements.elapsed.textContent = formatTime(current);
    this.elements.duration.textContent = formatTime(duration);
    const value = duration ? (current / duration) * 100 : 0;
    this.elements.progress.value = String(value);
    this.elements.progress.setAttribute('aria-valuetext', `${formatTime(current)} de ${formatTime(duration)}`);
    this.persist();
  }

  private updateDuration(): void {
    const duration = this.audio.duration || 0;
    this.elements.duration.textContent = formatTime(duration);
    this.elements.progress.max = '100';
  }

  private updateRepeatButton(): void {
    const labels: Record<RepeatMode, string> = {
      off: 'Modo repetição: desligado',
      all: 'Modo repetição: repetir playlist',
      one: 'Modo repetição: repetir faixa',
    };
    this.elements.repeatButton.setAttribute('aria-label', labels[this.repeatMode]);
    this.elements.repeatButton.textContent = this.repeatMode === 'one' ? 'Repeat 1' : 'Repeat';
    this.elements.repeatButton.setAttribute('aria-pressed', String(this.repeatMode !== 'off'));
  }

  private updateShuffleButton(): void {
    this.elements.shuffleButton.setAttribute('aria-pressed', String(this.shuffleEnabled));
    this.elements.shuffleButton.textContent = this.shuffleEnabled ? 'Shuffle ✓' : 'Shuffle';
  }

  private updateVolumeAria(): void {
    const percent = Math.round(this.audio.volume * 100);
    this.elements.volume.setAttribute('aria-valuetext', `${percent}% de volume`);
  }

  private getOrderedIndices(): number[] {
    if (this.shuffleEnabled) {
      if (this.shuffledOrder.length === 0) {
        this.shuffledOrder = this.buildShuffledOrder();
      }
      return this.shuffledOrder;
    }
    return this.tracks.map((_, index) => index);
  }

  private buildShuffledOrder(): number[] {
    const indices = this.tracks.map((_, index) => index);
    const current = this.currentIndex;
    const rest = indices.filter((i) => i !== current);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return [current, ...rest];
  }

  private getNextIndex(): number | null {
    const order = this.getOrderedIndices();
    const position = order.indexOf(this.currentIndex);
    if (position === -1) return null;
    if (position + 1 < order.length) return order[position + 1];
    if (this.repeatMode === 'all') {
      if (this.shuffleEnabled) {
        this.shuffledOrder = this.buildShuffledOrder();
        return this.shuffledOrder[1] ?? this.shuffledOrder[0];
      }
      return order[0];
    }
    return null;
  }

  private getPreviousIndex(): number | null {
    const order = this.getOrderedIndices();
    const position = order.indexOf(this.currentIndex);
    if (position === -1) return null;
    if (position - 1 >= 0) return order[position - 1];
    if (this.repeatMode === 'all') {
      return order[order.length - 1];
    }
    return null;
  }

  private restoreState(): PersistedState | null {
    if (!this.persistKey) return null;
    try {
      const raw = localStorage.getItem(this.persistKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedState;
      if (Number.isFinite(parsed.currentIndex) && parsed.currentIndex < this.tracks.length) {
        return parsed;
      }
    } catch {
      return null;
    }
    return null;
  }

  private persist(): void {
    if (!this.persistKey) return;
    const state: PersistedState = {
      currentIndex: this.currentIndex,
      currentTime: this.audio.currentTime || 0,
      volume: this.audio.volume,
      repeatMode: this.repeatMode,
      shuffle: this.shuffleEnabled,
    };
    try {
      localStorage.setItem(this.persistKey, JSON.stringify(state));
    } catch {
      // localStorage pode estar indisponível; ignora silenciosamente
    }
  }

  private announce(message: string): void {
    this.elements.status.textContent = message;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
}

export default PlayerHTML;
