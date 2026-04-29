<script setup lang="ts">
import type { CategoryId } from '@/types'
import { CATEGORIES } from '@/constants'
import { useTweaksStore } from '@/stores/tweaks'
import { useItemsStore } from '@/stores/items'
import { tr } from '@/constants/i18n'
import { computed } from 'vue'
import CategoryIcon from '@/components/icons/CategoryIcon.vue'

const props = defineProps<{
  activeCat: CategoryId | 'all'
}>()

const emit = defineEmits<{
  'update:activeCat': [CategoryId | 'all']
}>()

const tweaks = useTweaksStore()
const items = useItemsStore()
const lang = () => tweaks.tweaks.language

const counts = computed(() => items.countsByCategory())
const totalAll = computed(() => items.items.length)
</script>

<template>
  <aside class="sidebar">
    <button
      class="sidebar-item"
      :class="{ active: activeCat === 'all' }"
      @click="emit('update:activeCat', 'all')"
    >
      <span class="sidebar-icon"><CategoryIcon id="all" :size="16" /></span>
      <span class="sidebar-label">{{ tr('allCategories', lang()) }}</span>
      <span v-if="totalAll" class="sidebar-count">{{ totalAll }}</span>
    </button>

    <div class="sidebar-sep" />

    <button
      v-for="cat in CATEGORIES"
      :key="cat.id"
      class="sidebar-item"
      :class="{ active: activeCat === cat.id }"
      @click="emit('update:activeCat', cat.id)"
    >
      <span class="sidebar-icon"><CategoryIcon :id="cat.id" :size="16" /></span>
      <span class="sidebar-label">{{ cat.labels[lang()] }}</span>
      <span v-if="counts[cat.id]" class="sidebar-count">{{ counts[cat.id] }}</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 192px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-0);
  background: var(--bg-1);
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 7px 10px;
  border-radius: var(--r-md);
  background: transparent;
  border: none;
  color: var(--fg-2);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: color var(--t-fast), background var(--t-fast);
}
.sidebar-item:hover { color: var(--fg-0); background: var(--bg-2); }
.sidebar-item.active {
  color: var(--fg-0);
  background: var(--accent-soft);
}
.sidebar-item.active .sidebar-icon { color: var(--accent); }
.sidebar-item.active .sidebar-count {
  background: var(--accent-soft);
  color: var(--accent);
}

.sidebar-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--fg-3);
  transition: color var(--t-fast);
}
.sidebar-item:hover .sidebar-icon { color: var(--fg-1); }

.sidebar-label { flex: 1; line-height: 1; }

.sidebar-count {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 5px;
  background: var(--bg-3);
  color: var(--fg-3);
  border-radius: 4px;
  transition: background var(--t-fast), color var(--t-fast);
}

.sidebar-sep {
  height: 1px;
  background: var(--border-0);
  margin: 6px 4px;
}
</style>
