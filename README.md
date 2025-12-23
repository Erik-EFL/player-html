# player-html

Um player MP3 HTML5 completo, acessível e pronto para ser reutilizado em qualquer projeto.

## Principais recursos
- Interface pronta com Shadow-like styling (CSS variables) e controles completos: play/pause, anterior/próxima, retroceder/avançar 10s.
- Fila/playlist com destaque da faixa atual, modos **shuffle** e **repeat** (off/all/one).
- Barra de progresso e volume com controles de teclado, atalhos globais e integração com **Media Session API** (mídia keys do sistema).
- Persistência opcional de estado (faixa atual, tempo, volume, modos) no `localStorage`.
- Acessibilidade: botões reais, `aria-label`/`aria-pressed`, região `aria-live`, foco visível e sliders com `aria-valuetext`.

## Configuração do Projeto

Este projeto está configurado com:
- **TypeScript**: Compilação e tipagem estática
- **Rollup**: Bundler para gerar builds otimizados
- **Suporte a ESM e CommonJS**: Compatibilidade com diferentes ambientes

## Comandos Disponíveis

```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Modo desenvolvimento (watch mode)
npm run dev
```

## Uso

```typescript
import PlayerHTML from 'player-html';

const player = new PlayerHTML({
  container: '#player',
  tracks: [
    { src: '/musicas/faixa-01.mp3', title: 'Faixa 01', artist: 'Artista X', cover: '/img/capa-01.png' },
    { src: '/musicas/faixa-02.mp3', title: 'Faixa 02', artist: 'Artista Y' },
  ],
  startIndex: 0,
  initialVolume: 0.8,
  preload: 'metadata',
  persistKey: 'player-html-demo',
});

// Métodos úteis
player.play();
player.pause();
player.next();
player.previous();
player.setVolume(0.5);
```

Crie um contêiner no HTML e o player será renderizado dentro dele:

```html
<div id="player"></div>
```

### Acessibilidade e atalhos
- **Espaço**: play/pause
- **N/P**: próxima/anterior
- **J/L**: -10s / +10s
- **←/→**: -5s / +5s
- **M**: mute

### Customização
- Desative `injectStyles` para aplicar seus próprios estilos.
- Use `keyboardShortcuts: false` se quiser controlar manualmente os atalhos.
- Personalize a fila/controles via CSS usando os seletores `.mp3-player__*`.
