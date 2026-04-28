import type { Category, Status } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'games',    icon: '🎮', labels: { pt: 'Jogos',         en: 'Games' } },
  { id: 'books',    icon: '📚', labels: { pt: 'Livros',        en: 'Books' } },
  { id: 'movies',   icon: '🎬', labels: { pt: 'Filmes',        en: 'Movies' } },
  { id: 'shows',    icon: '📺', labels: { pt: 'Séries',        en: 'Shows' } },
  { id: 'anime',    icon: '🍙', labels: { pt: 'Animes/Mangás', en: 'Anime/Manga' } },
  { id: 'music',    icon: '🎵', labels: { pt: 'Álbuns',        en: 'Albums' } },
  { id: 'podcasts', icon: '🎙️', labels: { pt: 'Podcasts',      en: 'Podcasts' } },
  { id: 'docs',     icon: '🎞️', labels: { pt: 'Documentários', en: 'Documentaries' } },
  { id: 'courses',  icon: '🎓', labels: { pt: 'Cursos',        en: 'Courses' } },
]

export const STATUSES: Status[] = [
  { id: 'wishlist', colorVar: '--st-wishlist', labels: { pt: 'Quero conhecer', en: 'Want to try' } },
  { id: 'planned',  colorVar: '--st-planned',  labels: { pt: 'Próximo',        en: 'Up next' } },
  { id: 'active',   colorVar: '--st-active',   labels: { pt: 'Em andamento',   en: 'In progress' } },
  { id: 'paused',   colorVar: '--st-paused',   labels: { pt: 'Pausado',        en: 'Paused' } },
  { id: 'done',     colorVar: '--st-done',     labels: { pt: 'Concluído',      en: 'Done' } },
  { id: 'dropped',  colorVar: '--st-dropped',  labels: { pt: 'Abandonado',     en: 'Dropped' } },
]
