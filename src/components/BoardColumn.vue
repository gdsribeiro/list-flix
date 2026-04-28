<script setup lang="ts">
import { ref } from 'vue'
import type { Item, Status } from '@/types'
import { useTweaksStore } from '@/stores/tweaks'
import ItemCard from './ItemCard.vue'

const props = defineProps<{ status: Status; items: Item[] }>()
const emit = defineEmits<{
  addItem: [statusId: string]
  editItem: [Item]
  drop: [itemId: string, statusId: string]
}>()

const tweaks = useTweaksStore()
const isDragOver = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('text/plain')
  if (id) emit('drop', id, props.status.id)
}
</script>

<template>
  <div
    class="column"
    :class="{ 'drag-over': isDragOver }"
    :style="`--col-color: var(${status.colorVar})`"
    @dragover="onDragOver"
    @dragleave="isDragOver = false"
    @drop="onDrop"
  >
    <div class="column-head">
      <span class="pill" />
      <span class="col-title">{{ status.labels[tweaks.tweaks.language] }}</span>
      <span class="count">{{ items.length }}</span>
      <button class="add-btn" @click="emit('addItem', status.id)">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="column-body">
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @click="emit('editItem', item)"
      />
    </div>
  </div>
</template>

<style scoped>
.column {
  background: var(--bg-1); border: 1px solid var(--border-0);
  border-radius: var(--r-lg); padding: 12px;
  display: flex; flex-direction: column; min-height: 200px;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.column.drag-over {
  border-color: var(--col-color, var(--accent));
  background: oklch(from var(--col-color, var(--accent)) l c h / 0.07);
}
.column-head {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 4px 12px; border-bottom: 1px solid var(--border-0); margin-bottom: 10px;
}
.pill { width: 6px; height: 6px; border-radius: 50%; background: var(--col-color, var(--fg-2)); flex: none; }
.col-title { font-size: 12px; font-weight: 600; letter-spacing: 0.02em; color: var(--fg-1); }
.count {
  font-family: var(--font-mono); font-size: 10px; color: var(--fg-2);
  padding: 1px 5px; background: var(--bg-3); border-radius: 4px;
}
.add-btn {
  margin-left: auto; width: 22px; height: 22px; border-radius: 5px;
  background: transparent; border: 1px solid var(--border-0); color: var(--fg-2);
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: var(--t-fast);
}
.add-btn:hover { color: var(--fg-0); background: var(--bg-3); border-color: var(--border-1); }
.column-body { display: flex; flex-direction: column; gap: var(--card-gap); flex: 1; }
</style>
