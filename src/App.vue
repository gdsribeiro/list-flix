<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Item, CategoryId } from '@/types'
import type { SortKey } from '@/stores/items'
import { CATEGORIES, STATUSES } from '@/constants'
import { useItemsStore, uid } from '@/stores/items'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'
import AppTopbar from '@/components/AppTopbar.vue'
import AppTabs from '@/components/AppTabs.vue'
import BoardColumn from '@/components/BoardColumn.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemModal from '@/components/ItemModal.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import TweaksPanel from '@/components/TweaksPanel.vue'

const itemsStore = useItemsStore()
const tweaks = useTweaksStore()

const activeCat = ref<CategoryId>('games')
const search = ref('')
const sort = ref<SortKey>('recent')

const editingItem = ref<Item | null>(null)
const isNewItem = ref(false)

onMounted(() => {
  tweaks.load()
  itemsStore.load()
})

const counts = computed(() => itemsStore.countsByCategory())
const visible = computed(() => itemsStore.getFiltered(activeCat.value, search.value, sort.value))
const byStatus = computed(() => {
  const map: Record<string, Item[]> = {}
  for (const s of STATUSES) map[s.id] = []
  for (const i of visible.value) map[i.status].push(i)
  return map
})

function openAdd(statusId?: string) {
  editingItem.value = {
    id: uid(), category: activeCat.value,
    status: (statusId as any) ?? 'wishlist',
    title: '', year: '', platform: '', duration: '',
    tags: [], progress: 0, cover: '', notes: '',
    createdAt: Date.now(), updatedAt: Date.now(),
  }
  isNewItem.value = true
}

function openEdit(item: Item) {
  editingItem.value = { ...item, tags: [...item.tags] }
  isNewItem.value = false
}

function saveItem(item: Item) {
  if (isNewItem.value) itemsStore.add(item)
  else itemsStore.update(item)
  editingItem.value = null
}

function deleteItem(id: string) {
  itemsStore.remove(id)
  editingItem.value = null
}

function onDrop(itemId: string, statusId: string) {
  itemsStore.moveToStatus(itemId, statusId as any)
}
</script>

<template>
  <div class="app">
    <AppTopbar v-model:search="search" @add="openAdd()" />
    <AppTabs
      v-model:activeCat="activeCat"
      v-model:sort="sort"
      :counts="counts"
    />

    <main class="board-wrap">
      <!-- Empty state -->
      <div v-if="visible.length === 0 && !search" class="empty">
        <div class="empty-glyph">
          <span>{{ CATEGORIES.find(c => c.id === activeCat)?.icon }}</span>
        </div>
        <div class="empty-title">{{ tr('emptyTitle', tweaks.tweaks.language) }}</div>
        <div class="empty-sub">{{ tr('emptySub', tweaks.tweaks.language) }}</div>
        <button class="btn btn-primary" style="margin-top: 8px" @click="openAdd()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          {{ tr('add', tweaks.tweaks.language) }}
        </button>
      </div>

      <!-- Grid layout -->
      <div v-else-if="tweaks.tweaks.layout === 'grid'" class="grid-board">
        <ItemCard
          v-for="item in visible"
          :key="item.id"
          :item="item"
          @click="openEdit(item)"
        />
      </div>

      <!-- Kanban / List layout -->
      <div v-else class="board" :data-layout="tweaks.tweaks.layout">
        <BoardColumn
          v-for="status in STATUSES"
          :key="status.id"
          :status="status"
          :items="byStatus[status.id] ?? []"
          @add-item="openAdd"
          @edit-item="openEdit"
          @drop="onDrop"
        />
      </div>
    </main>

    <ItemModal
      v-if="editingItem"
      :item="editingItem"
      :is-new="isNewItem"
      @save="saveItem"
      @delete="deleteItem"
      @close="editingItem = null"
    />

    <StatsPanel v-if="tweaks.showStats" />
    <TweaksPanel v-if="tweaks.showTweaks" />
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; min-height: 0; }

.board-wrap { flex: 1; min-height: 0; overflow: auto; padding: 16px 20px 24px; }

.board {
  display: grid;
  grid-template-columns: repeat(6, minmax(240px, 1fr));
  gap: 14px; min-height: 100%;
}
.board[data-layout="list"] {
  display: flex; flex-direction: column; gap: 18px;
}
.grid-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 80px 20px;
  color: var(--fg-2); text-align: center;
}
.empty-glyph {
  width: 56px; height: 56px; background: var(--bg-2);
  border: 1px solid var(--border-0); border-radius: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 22px; opacity: 0.7;
}
.empty-title { font-size: 15px; font-weight: 600; color: var(--fg-1); }
.empty-sub { font-size: 12px; color: var(--fg-2); }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 14px; height: 34px; border-radius: var(--r-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: var(--t-fast); border: 1px solid var(--border-0);
  background: var(--bg-2); color: var(--fg-1);
}
.btn-primary { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
.btn-primary:hover { filter: brightness(1.08); }
</style>
