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
  reorder: [draggedId: string, targetId: string]
}>()

const tweaks = useTweaksStore()
const isDragOver = ref(false)
const dragOverItemId = ref<string | null>(null)

function onColumnDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}

function onColumnDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node)) isDragOver.value = false
}

function onColumnDrop(e: DragEvent) {
  if (dragOverItemId.value !== null) return
  e.preventDefault()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('text/plain')
  if (id) emit('drop', id, props.status.id)
}

function onItemDragOver(e: DragEvent, itemId: string) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  dragOverItemId.value = itemId
}

function onItemDragLeave(e: DragEvent, itemId: string) {
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node) && dragOverItemId.value === itemId) {
    dragOverItemId.value = null
  }
}

function onItemDrop(e: DragEvent, targetId: string) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  dragOverItemId.value = null
  const draggedId = e.dataTransfer?.getData('text/plain')
  if (!draggedId || draggedId === targetId) return
  const isInSameColumn = props.items.some(i => i.id === draggedId)
  if (isInSameColumn) {
    emit('reorder', draggedId, targetId)
  } else {
    emit('drop', draggedId, props.status.id)
  }
}
</script>

<template>
  <div
    class="column"
    :class="{ 'drag-over': isDragOver }"
    :style="`--col-color: var(${status.colorVar})`"
    @dragover="onColumnDragOver"
    @dragleave="onColumnDragLeave"
    @drop="onColumnDrop"
  >
    <div class="column-head">
      <span class="col-title">{{ status.labels[tweaks.tweaks.language] }}</span>
      <span class="count">{{ items.length }}</span>
      <button class="add-btn" @click="emit('addItem', status.id)" :title="`Add to ${status.labels[tweaks.tweaks.language]}`">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="column-body">
      <div
        v-for="item in items"
        :key="item.id"
        class="card-slot"
        :class="{ 'drop-above': dragOverItemId === item.id }"
        @dragover="onItemDragOver($event, item.id)"
        @dragleave="onItemDragLeave($event, item.id)"
        @drop="onItemDrop($event, item.id)"
      >
        <ItemCard :item="item" @click="emit('editItem', item)" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.column {
  background: var(--bg-1);
  border: 1px solid var(--border-0);
  border-radius: var(--r-lg);
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.column.drag-over {
  border-color: var(--col-color, var(--accent));
  background: oklch(from var(--col-color, var(--accent)) l c h / 0.06);
}
.column-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--border-0);
}
.col-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--col-color, var(--fg-2));
  flex: 1;
}
.count {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  color: var(--fg-1);
  padding: 1px 6px;
  background: oklch(from var(--col-color, var(--fg-3)) l c h / 0.15);
  border-radius: 4px;
}
.add-btn {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  background: transparent;
  border: 1px solid var(--border-0);
  color: var(--fg-3);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color var(--t-fast), background var(--t-fast), border-color var(--t-fast);
  flex-shrink: 0;
}
.add-btn:hover {
  color: var(--col-color, var(--fg-0));
  background: var(--bg-3);
  border-color: var(--col-color, var(--border-1));
}
.column-body { display: flex; flex-direction: column; gap: var(--card-gap); flex: 1; }

/* Indicador de posição via pseudo-elemento — não causa layout shift */
.card-slot { border-radius: var(--r-md); }
.card-slot::before {
  content: '';
  display: block;
  height: 0;
  border-radius: 99px;
  background: var(--col-color, var(--accent));
  opacity: 0;
  transition: height var(--t-fast), opacity var(--t-fast), margin-bottom var(--t-fast);
  pointer-events: none;
}
.card-slot.drop-above::before {
  height: 3px;
  opacity: 0.8;
  margin-bottom: 6px;
}
</style>
