<script setup lang="ts">
import { ref } from 'vue'
import type { Item, Status } from '@/types'
import { useTweaksStore } from '@/stores/tweaks'
import ItemCard from './ItemCard.vue'

const props = defineProps<{ status: Status; items: Item[] }>()
const emit = defineEmits<{
  addItem: [statusId: string]
  editItem: [Item]
  drop: [itemId: string, statusId: string, toIndex: number]
  reorder: [draggedId: string, toIndex: number]
}>()

const tweaks = useTweaksStore()
const isDragOver = ref(false)
const dragOverIdx = ref<number | null>(null)

function onColumnDragOver(e: DragEvent) {
  e.preventDefault()
  if (dragOverIdx.value === null) isDragOver.value = true
}

function onColumnDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
    dragOverIdx.value = null
  }
}

function onColumnDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  dragOverIdx.value = null
  const id = e.dataTransfer?.getData('text/plain')
  if (id) emit('drop', id, props.status.id, props.items.length)
}

function onItemDragOver(e: DragEvent, idx: number) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  dragOverIdx.value = e.clientY > rect.top + rect.height / 2 ? idx + 1 : idx
}

function onItemDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el.contains(e.relatedTarget as Node)) dragOverIdx.value = null
}

function onItemDrop(e: DragEvent, idx: number) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  const finalIdx = dragOverIdx.value ?? idx
  dragOverIdx.value = null
  const draggedId = e.dataTransfer?.getData('text/plain')
  if (!draggedId) return
  if (props.items.some(i => i.id === draggedId)) {
    emit('reorder', draggedId, finalIdx)
  } else {
    emit('drop', draggedId, props.status.id, finalIdx)
  }
}

function onEndDragOver(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  dragOverIdx.value = props.items.length
}

function onEndDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false
  dragOverIdx.value = null
  const draggedId = e.dataTransfer?.getData('text/plain')
  if (!draggedId) return
  if (props.items.some(i => i.id === draggedId)) {
    emit('reorder', draggedId, props.items.length)
  } else {
    emit('drop', draggedId, props.status.id, props.items.length)
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
      <template v-for="(item, idx) in items" :key="item.id">
        <div class="drop-line" :class="{ active: dragOverIdx === idx }" aria-hidden="true" />
        <div
          class="card-slot"
          @dragover="onItemDragOver($event, idx)"
          @dragleave="onItemDragLeave"
          @drop="onItemDrop($event, idx)"
        >
          <ItemCard :item="item" @click="emit('editItem', item)" />
        </div>
      </template>
      <div class="drop-line" :class="{ active: dragOverIdx === items.length }" aria-hidden="true" />
      <div
        class="end-zone"
        @dragover.prevent.stop="onEndDragOver"
        @dragleave="dragOverIdx = null; isDragOver = false"
        @drop.prevent.stop="onEndDrop"
      />
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
  height: 100%;
  min-height: 200px;
  overflow: hidden;
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
  margin-bottom: 2px;
  border-bottom: 1px solid var(--border-0);
}
.col-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--col-color, var(--fg-2));
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.column-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 8px;
  scrollbar-width: thin;
}

.drop-line {
  height: 0;
  border-radius: 99px;
  background: var(--col-color, var(--accent));
  transition: height var(--t-fast), margin var(--t-fast);
  pointer-events: none;
  flex-shrink: 0;
}
.drop-line.active {
  height: 4px;
  margin: 2px 0;
}

.card-slot { margin-bottom: var(--card-gap); }

.end-zone { flex: 1; min-height: 32px; }
</style>
