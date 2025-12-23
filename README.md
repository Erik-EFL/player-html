# player-html
um player html 5  para todas as finalidades de midia

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

## Estrutura

```
player-html/
├── src/           # Código fonte TypeScript
├── dist/          # Arquivos compilados
├── rollup.config.js
├── tsconfig.json
└── package.json
```

## Uso

```typescript
import PlayerHTML from 'player-html';

const player = new PlayerHTML('#my-video');
player.play();
player.setVolume(0.5);
```
