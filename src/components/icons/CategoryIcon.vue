<script setup lang="ts">
import type { CategoryId } from '@/types'

defineProps<{
  id: CategoryId | 'all'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- all: 2×2 grid -->
    <template v-if="id === 'all'">
      <rect x="2" y="2" width="5" height="5" rx="1"/>
      <rect x="9" y="2" width="5" height="5" rx="1"/>
      <rect x="2" y="9" width="5" height="5" rx="1"/>
      <rect x="9" y="9" width="5" height="5" rx="1"/>
    </template>

    <!-- games: controller -->
    <template v-else-if="id === 'games'">
      <path d="M2 8.5 Q2 5.5 4.5 5.5 h7 Q13.5 5.5 13.5 8.5 v1 Q13.5 11.5 11 11.5 h-6 Q2 11.5 2 9.5 z"/>
      <line x1="5.5" y1="8.5" x2="7.5" y2="8.5"/>
      <line x1="6.5" y1="7.5" x2="6.5" y2="9.5"/>
      <circle cx="10.5" cy="8.5" r="1"/>
      <path d="M4 5.5 Q4 3.5 5.5 3.5 h1"/>
      <path d="M11.5 5.5 Q11.5 3.5 10 3.5 h-1"/>
    </template>

    <!-- books: open book -->
    <template v-else-if="id === 'books'">
      <path d="M8 4.5 Q5.5 3.5 2 4.5 v7 Q5.5 10.5 8 11.5"/>
      <path d="M8 4.5 Q10.5 3.5 14 4.5 v7 Q10.5 10.5 8 11.5"/>
      <line x1="8" y1="4.5" x2="8" y2="11.5"/>
    </template>

    <!-- movies: clapperboard -->
    <template v-else-if="id === 'movies'">
      <rect x="2" y="6.5" width="12" height="7" rx="1"/>
      <rect x="2" y="3" width="12" height="3.5" rx="1"/>
      <line x1="5.5" y1="3" x2="4.5" y2="6.5"/>
      <line x1="8.5" y1="3" x2="7.5" y2="6.5"/>
      <line x1="11.5" y1="3" x2="10.5" y2="6.5"/>
    </template>

    <!-- shows: TV monitor -->
    <template v-else-if="id === 'shows'">
      <rect x="1.5" y="2" width="13" height="9.5" rx="1.5"/>
      <path d="M6 11.5 L5 14.5"/>
      <path d="M10 11.5 L11 14.5"/>
      <line x1="4.5" y1="14.5" x2="11.5" y2="14.5"/>
    </template>

    <!-- anime: 4-pointed star sparkle -->
    <template v-else-if="id === 'anime'">
      <path d="M8 1.5 L9 7 L14.5 8 L9 9 L8 14.5 L7 9 L1.5 8 L7 7 Z"/>
    </template>

    <!-- music: quarter note -->
    <template v-else-if="id === 'music'">
      <line x1="10.5" y1="3" x2="10.5" y2="11.5"/>
      <ellipse cx="8" cy="12.5" rx="2.8" ry="2" transform="rotate(-20 8 12.5)"/>
    </template>

    <!-- podcasts: microphone -->
    <template v-else-if="id === 'podcasts'">
      <rect x="5.5" y="2" width="5" height="7" rx="2.5"/>
      <path d="M3 8.5 a5 4.5 0 0 0 10 0"/>
      <line x1="8" y1="13" x2="8" y2="14.5"/>
      <line x1="5.5" y1="14.5" x2="10.5" y2="14.5"/>
    </template>

    <!-- docs: film reel -->
    <template v-else-if="id === 'docs'">
      <circle cx="8" cy="8" r="6"/>
      <circle cx="8" cy="8" r="2.5"/>
      <circle cx="8" cy="2.5" r="0.8"/>
      <circle cx="12.5" cy="10.5" r="0.8"/>
      <circle cx="3.5" cy="10.5" r="0.8"/>
    </template>

    <!-- courses: graduation cap -->
    <template v-else-if="id === 'courses'">
      <path d="M8 2.5 L14.5 6 L8 9.5 L1.5 6 Z"/>
      <line x1="14.5" y1="6" x2="14.5" y2="10"/>
      <path d="M5.5 9 v2.5 a2.5 2.5 0 0 0 5 0 v-2.5"/>
    </template>
  </svg>
</template>
