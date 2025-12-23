import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { PlayerHTML, type PlayerTrack } from 'player-html';
import './index.css';

const demoTracks: PlayerTrack[] = [
  {
    id: 'react-01',
    title: 'Breeze',
    artist: 'Komiku',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Komiku/Helioglitch/Komiku_-_07_-_Breeze.mp3',
    cover: 'https://images.unsplash.com/photo-1528442410070-6e3344c544cd?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'react-02',
    title: 'Yonder Hill',
    artist: 'scottholmesmusic.com',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes_Music/Happy_Music/Scott_Holmes_Music_-_Happy.mp3',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'react-03',
    title: 'Café Connection',
    artist: 'Loyalty Freak Music',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Loyalty_Freak_Music/RE_MUSICA_La_Meilleur_Musique_Libre/04_-_Loyalty_Freak_Music_-_Caf_Cafelito.mp3',
    cover: 'https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=300&q=80',
  },
];

function App() {
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playerRef.current) return;

    // Limpa o contêiner para evitar cópias ao recarregar em desenvolvimento
    playerRef.current.textContent = '';

    const player = new PlayerHTML({
      container: playerRef.current,
      tracks: demoTracks,
      persistKey: 'player-html-react-demo',
      keyboardShortcuts: true,
    });

    return () => {
      playerRef.current?.replaceChildren();
    };
  }, []);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">React + player-html</p>
        <h1>Player MP3 pronto para uso</h1>
        <p className="lede">
          Este app demonstra o componente PlayerHTML funcionando dentro de um projeto React
          usando a biblioteca instalada via arquivo local.
        </p>
      </header>
      <section className="card">
        <div ref={playerRef} aria-label="Player MP3" />
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
