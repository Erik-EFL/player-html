<template>
  <main class="page">
    <header>
      <p class="eyebrow">Vue + player-html</p>
      <h1>Player MP3 integrado a um app Vue</h1>
      <p class="lede">
        Demonstração simples do PlayerHTML funcionando como dependência local instalada
        em um projeto Vite + Vue 3.
      </p>
    </header>
    <section class="card">
      <div ref="playerHost" aria-label="Player MP3" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { PlayerHTML, type PlayerTrack } from 'player-html';

const playerHost = ref<HTMLElement | null>(null);

const tracks: PlayerTrack[] = [
  {
    id: 'vue-01',
    title: 'Walking Together',
    artist: 'Loyalty Freak Music',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Loyalty_Freak_Music/INSTRUMENTAL/01_-_Walking_Together.mp3',
    cover: 'https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'vue-02',
    title: 'Night Drive',
    artist: 'Ketsa',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Ketsa/Looking_Back/Ketsa_-_07_-_Night_Drive.mp3',
    cover: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'vue-03',
    title: 'Neon Skyline',
    artist: 'Scott Holmes',
    src: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Scott_Holmes_Music/Corporate__Motivational_Music/Scott_Holmes_Music_-_02_-_Neon_Skies.mp3',
    cover: 'https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&w=300&q=80',
  },
];

onMounted(() => {
  if (!playerHost.value) return;
  playerHost.value.textContent = '';

  new PlayerHTML({
    container: playerHost.value,
    tracks,
    persistKey: 'player-html-vue-demo',
    keyboardShortcuts: true,
  });
});

onBeforeUnmount(() => {
  playerHost.value?.replaceChildren();
});
</script>
