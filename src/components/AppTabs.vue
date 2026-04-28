<script setup lang="ts">
import type { CategoryId } from '@/types'
import type { SortKey } from '@/stores/items'
import { CATEGORIES } from '@/constants'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'

defineProps<{
  activeCat: CategoryId
  counts: Record<CategoryId, number>
  sort: SortKey
}>()

const emit = defineEmits<{
  'update:activeCat': [CategoryId]
  'update:sort': [SortKey]
}>()

const tweaks = useTweaksStore()
</script>

<template>
  <nav class="tabs">
    <button
      v-for="cat in CATEGORIES"
      :key="cat.id"
      class="tab"
      :data-active="activeCat === cat.id || undefined"
      @click="emit('update:activeCat', cat.id)"
    >
      <span class="tab-icon">{{ cat.icon }}</span>
      <span>{{ cat.labels[tweaks.tweaks.language] }}</span>
      <span class="count">{{ counts[cat.id] ?? 0 }}</span>
    </button>

    <div class="toolbar">
      <select
        class="select"
        :value="sort"
        @change="emit('update:sort', ($event.target as HTMLSelectElement).value as SortKey)"
      >
        <option value="recent">{{ tr('sortRecent', tweaks.tweaks.language) }}</option>
        <option value="title">{{ tr('sortTitle', tweaks.tweaks.language) }}</option>
        <option value="year">{{ tr('sortYear', tweaks.tweaks.language) }}</option>
      </select>
    </div>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex; align-items: center; gap: 2px;
  padding: 8px 20px; border-bottom: 1px solid var(--border-0);
  background: var(--bg-1); overflow-x: auto; flex-shrink: 0;
}
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 6px 11px; border-radius: 8px;
  background: transparent; border: 1px solid transparent;
  color: var(--fg-2); cursor: pointer; font-size: 13px;
  font-weight: 500; white-space: nowrap; transition: var(--t-fast);
}
.tab:hover { color: var(--fg-0); background: var(--bg-2); }
.tab[data-active] { color: var(--fg-0); background: var(--bg-3); border-color: var(--border-0); }
.tab-icon { font-size: 14px; }
.count {
  font-family: var(--font-mono); font-size: 10px;
  padding: 1px 5px; background: var(--bg-4); color: var(--fg-2); border-radius: 4px;
}
.tab[data-active] .count { background: var(--accent-soft); color: var(--accent); }
.toolbar { margin-left: auto; display: flex; gap: 6px; }
.select {
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: 8px; color: var(--fg-1); padding: 6px 10px;
  font-size: 12px; cursor: pointer; outline: none;
}
.select:hover { border-color: var(--border-1); }
</style>
