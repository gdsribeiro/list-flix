<script setup lang="ts">
import type { Item } from '@/types'
import { useTweaksStore } from '@/stores/tweaks'
import CategoryIcon from '@/components/icons/CategoryIcon.vue'

defineProps<{ item: Item }>()
const emit = defineEmits<{ click: [Item] }>()

const tweaks = useTweaksStore()

function onDragStart(e: DragEvent, id: string) {
  e.dataTransfer?.setData('text/plain', id)
}
</script>

<template>
  <div
    class="card"
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

    <div v-if="item.progress > 0 && item.progress < 100" class="card-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: item.progress + '%' }" />
      </div>
      <span class="progress-text">{{ item.progress }}%</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-md); padding: var(--card-pad);
  cursor: grab; transition: border-color var(--t-fast), background var(--t-fast);
}
.card:hover { border-color: var(--border-1); background: var(--bg-3); }
.card:active { cursor: grabbing; }

.card-cover {
  width: 100%; aspect-ratio: 16/10; background: var(--bg-3);
  border-radius: 6px; margin-bottom: 8px; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.card-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-cover-icon { display: flex; align-items: center; justify-content: center; opacity: 0.3; color: var(--fg-2); }

.card-title {
  font-size: 13px; font-weight: 600; line-height: 1.3;
  color: var(--fg-0); margin-bottom: 4px;
}
.card-meta {
  display: flex; flex-wrap: wrap; align-items: center;
  gap: 5px; color: var(--fg-2); font-size: 11px; font-family: var(--font-mono);
}
.platform {
  padding: 1px 6px; background: var(--bg-3); border-radius: 4px; color: var(--fg-1);
}
.card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.tag {
  padding: 2px 7px; background: var(--bg-3); border-radius: 4px;
  font-size: 10px; color: var(--fg-1); border: 1px solid var(--border-0);
}
.card-progress { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.progress-bar { flex: 1; height: 4px; background: var(--bg-3); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); border-radius: 2px; transition: width 200ms ease; }
.progress-text { font-family: var(--font-mono); font-size: 10px; color: var(--fg-2); min-width: 28px; text-align: right; }
</style>
