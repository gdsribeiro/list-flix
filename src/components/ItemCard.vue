<script setup lang="ts">
import { computed } from 'vue'
import type { Item } from '@/types'
import { STATUSES } from '@/constants'
import { useTweaksStore } from '@/stores/tweaks'
import CategoryIcon from '@/components/icons/CategoryIcon.vue'

const props = defineProps<{ item: Item; layout?: string }>()
const emit = defineEmits<{ click: [Item] }>()

const tweaks = useTweaksStore()

const statusColorVar = computed(() =>
  STATUSES.find(s => s.id === props.item.status)?.colorVar ?? '--fg-3'
)

function onDragStart(e: DragEvent, id: string) {
  e.dataTransfer?.setData('text/plain', id)
}
</script>

<template>
  <div
    class="card"
    :class="{ 'card--list': props.layout === 'list' }"
    :style="`--item-st: var(${statusColorVar})`"
    draggable="true"
    @click="emit('click', item)"
    @dragstart="onDragStart($event, item.id)"
  >
    <div v-if="tweaks.tweaks.showCovers" class="card-cover">
      <img v-if="item.cover" :src="item.cover" alt="" loading="lazy" @error="($event.target as HTMLImageElement).style.display = 'none'" />
      <span v-else class="card-cover-icon"><CategoryIcon :id="item.category" :size="28" /></span>
    </div>

    <div class="card-title">{{ item.title }}</div>

    <div v-if="item.platform" class="card-meta">
      <span class="platform">{{ item.platform }}</span>
    </div>

    <div v-if="item.tags.length" class="card-tags">
      <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-top: 2px solid var(--item-st, var(--border-1));
  border-radius: var(--r-md);
  padding: var(--card-pad);
  cursor: grab;
  transition: border-color var(--t-fast), background var(--t-fast), box-shadow var(--t-fast);
}
.card:hover {
  border-color: var(--border-1);
  border-top-color: var(--item-st, var(--border-1));
  background: var(--bg-3);
  box-shadow: 0 4px 16px oklch(0 0 0 / 0.25);
}
.card:active { cursor: grabbing; }

.card-cover {
  width: 100%;
  aspect-ratio: 2 / 3;
  background: var(--bg-3);
  border-radius: var(--r-sm);
  margin-bottom: 9px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-cover-icon { display: flex; align-items: center; justify-content: center; opacity: 0.2; color: var(--fg-1); }

.card-title {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--fg-0);
  margin-bottom: 5px;
}
.card-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.platform {
  padding: 1px 6px;
  background: var(--bg-4);
  border-radius: 4px;
  color: var(--fg-2);
  font-size: 10px;
  font-weight: 500;
}
.card-tags { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 6px; }
.tag {
  padding: 1px 6px;
  background: transparent;
  border-radius: 4px;
  font-size: 10px;
  color: var(--fg-3);
  border: 1px solid var(--border-0);
}

/* ── List layout ─────────────────────────────────────────── */
.card--list {
  display: grid;
  grid-template-columns: 52px 1fr;
  grid-template-rows: auto auto auto;
  column-gap: 14px;
  align-items: start;
}
.card--list .card-cover {
  grid-row: 1 / 4;
  grid-column: 1;
  aspect-ratio: 2 / 3;
  width: 52px;
  margin-bottom: 0;
}
.card--list .card-title { grid-column: 2; margin-bottom: 3px; }
.card--list .card-meta  { grid-column: 2; }
.card--list .card-tags  { grid-column: 2; margin-top: 4px; }
</style>
