<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Item, CategoryId } from '@/types'
import type { SortKey } from '@/stores/items'
import { CATEGORIES, STATUSES } from '@/constants'
import { useItemsStore, uid } from '@/stores/items'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'
import BoardColumn from '@/components/BoardColumn.vue'
import ItemCard from '@/components/ItemCard.vue'
import ItemModal from '@/components/ItemModal.vue'

const props = defineProps<{
  activeCat: CategoryId | 'all'
  search: string
}>()

const itemsStore = useItemsStore()
const tweaks = useTweaksStore()
const lang = () => tweaks.tweaks.language

const sort = ref<SortKey>('recent')
const editingItem = ref<Item | null>(null)
const isNewItem = ref(false)
const filterStatus = ref<string | null>(null)

// Reset status filter when switching to kanban
watch(() => tweaks.tweaks.layout, (layout) => {
  if (layout === 'kanban') filterStatus.value = null
})

const visible = computed(() => itemsStore.getFiltered(props.activeCat, props.search, sort.value))

const byStatus = computed(() => {
  const map: Record<string, Item[]> = {}
  for (const s of STATUSES) map[s.id] = []
  for (const i of visible.value) map[i.status].push(i)
  return map
})

const displayItems = computed(() =>
  filterStatus.value ? visible.value.filter(i => i.status === filterStatus.value) : visible.value
)

const activeCatObj = computed(() =>
  props.activeCat === 'all' ? null : CATEGORIES.find(c => c.id === props.activeCat)
)

function openAdd(statusId?: string) {
  const defaultCat: CategoryId = props.activeCat === 'all' ? 'games' : props.activeCat
  editingItem.value = {
    id: uid(), category: defaultCat,
    status: (statusId ?? filterStatus.value ?? 'wishlist') as any,
    title: '', platform: '',
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

function onReorder(draggedId: string, targetId: string) {
  itemsStore.reorderInStatus(draggedId, targetId)
}

function toggleStatus(id: string) {
  filterStatus.value = filterStatus.value === id ? null : id
}
</script>

<template>
  <div class="home-wrap">
    <div class="home-toolbar">
      <div class="toolbar-left">
        <span class="cat-label">
          <template v-if="activeCatObj">{{ activeCatObj.labels[lang()] }}</template>
          <template v-else>{{ tr('allCategories', lang()) }}</template>
        </span>
        <span v-if="visible.length" class="item-count">{{ displayItems.length }}</span>
      </div>
      <div class="toolbar-right">
        <div class="layout-seg">
          <button :class="{ active: tweaks.tweaks.layout === 'kanban' }" @click="tweaks.set('layout', 'kanban')">{{ tr('layoutKanban', lang()) }}</button>
          <button :class="{ active: tweaks.tweaks.layout === 'grid' }" @click="tweaks.set('layout', 'grid')">{{ tr('layoutGrid', lang()) }}</button>
          <button :class="{ active: tweaks.tweaks.layout === 'list' }" @click="tweaks.set('layout', 'list')">{{ tr('layoutList', lang()) }}</button>
        </div>
        <select class="sort-select" v-model="sort" :aria-label="tr('sortRecent', lang())">
          <option value="recent">{{ tr('sortRecent', lang()) }}</option>
          <option value="title">{{ tr('sortTitle', lang()) }}</option>
        </select>
        <button class="btn-add" @click="openAdd()">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          {{ tr('add', lang()) }}
        </button>
      </div>
    </div>

    <!-- Status filter bar — only in grid/list -->
    <div v-if="tweaks.tweaks.layout !== 'kanban'" class="status-bar">
      <button
        class="status-chip"
        :class="{ active: filterStatus === null }"
        @click="filterStatus = null"
      >
        {{ lang() === 'pt' ? 'Todos' : 'All' }}
        <span class="chip-count">{{ visible.length }}</span>
      </button>
      <template v-for="s in STATUSES" :key="s.id">
        <button
          v-if="byStatus[s.id]?.length"
          class="status-chip"
          :class="{ active: filterStatus === s.id }"
          :style="`--chip-color: var(${s.colorVar})`"
          @click="toggleStatus(s.id)"
        >
          {{ s.labels[lang()] }}
          <span class="chip-count">{{ byStatus[s.id].length }}</span>
        </button>
      </template>
    </div>

    <main class="board-wrap">
      <div v-if="displayItems.length === 0 && !search && !filterStatus" class="empty">
        <div class="empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="empty-title">{{ tr('emptyTitle', lang()) }}</div>
        <div class="empty-sub">
          {{ lang() === 'pt'
            ? 'Comece adicionando um filme, jogo ou livro que queira acompanhar.'
            : 'Start by adding a movie, game, or book you want to track.' }}
        </div>
        <button class="btn-add" style="margin-top: 4px" @click="openAdd()">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          {{ tr('add', lang()) }}
        </button>
      </div>

      <div v-else-if="displayItems.length === 0" class="empty">
        <div class="empty-title">{{ lang() === 'pt' ? 'Nenhum resultado' : 'No results' }}</div>
      </div>

      <div v-else-if="tweaks.tweaks.layout === 'grid'" class="grid-board">
        <ItemCard
          v-for="item in displayItems"
          :key="item.id"
          :item="item"
          layout="grid"
          @click="openEdit(item)"
        />
      </div>

      <div v-else-if="tweaks.tweaks.layout === 'list'" class="list-board">
        <ItemCard
          v-for="item in displayItems"
          :key="item.id"
          :item="item"
          layout="list"
          @click="openEdit(item)"
        />
      </div>

      <div v-else class="board">
        <BoardColumn
          v-for="status in STATUSES"
          :key="status.id"
          :status="status"
          :items="byStatus[status.id] ?? []"
          @add-item="openAdd"
          @edit-item="openEdit"
          @drop="onDrop"
          @reorder="onReorder"
        />
      </div>
    </main>

    <Transition name="modal">
      <ItemModal
        v-if="editingItem"
        :item="editingItem"
        :is-new="isNewItem"
        @save="saveItem"
        @delete="deleteItem"
        @close="editingItem = null"
      />
    </Transition>
  </div>
</template>

<style scoped>
.home-wrap { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

.home-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 44px;
  border-bottom: 1px solid var(--border-0);
  background: var(--bg-1);
  flex-shrink: 0;
  gap: 12px;
}
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.toolbar-right { display: flex; align-items: center; gap: 6px; }

.cat-label { font-size: 13px; font-weight: 600; color: var(--fg-0); }
.item-count {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  background: var(--bg-3);
  border-radius: 4px;
  color: var(--fg-3);
}

.sort-select {
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-md);
  color: var(--fg-2);
  padding: 0 9px;
  height: 30px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: border-color var(--t-fast), color var(--t-fast);
}
.sort-select:hover { border-color: var(--border-1); color: var(--fg-0); }

.layout-seg {
  display: inline-flex;
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-md);
  padding: 2px;
  gap: 1px;
}
.layout-seg button {
  background: none;
  border: none;
  color: var(--fg-3);
  padding: 3px 9px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 7px;
  cursor: pointer;
  transition: color var(--t-fast), background var(--t-fast);
}
.layout-seg button:hover { color: var(--fg-1); }
.layout-seg button.active { background: var(--bg-4); color: var(--fg-0); }

/* Status filter bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--border-0);
  background: var(--bg-1);
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.status-bar::-webkit-scrollbar { display: none; }

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  height: 26px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--border-0);
  background: transparent;
  color: var(--fg-2);
  transition: color var(--t-fast), background var(--t-fast), border-color var(--t-fast);
}
.status-chip:hover {
  color: var(--fg-0);
  background: var(--bg-3);
  border-color: var(--chip-color, var(--border-1));
}
.status-chip.active {
  background: oklch(from var(--chip-color, var(--accent)) l c h / 0.12);
  border-color: oklch(from var(--chip-color, var(--accent)) l c h / 0.4);
  color: var(--chip-color, var(--accent));
}
.status-chip:not([style]).active {
  background: var(--accent-soft);
  border-color: var(--accent-line);
  color: var(--accent);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 10px;
  opacity: 0.7;
}

.board-wrap { flex: 1; min-height: 0; overflow: auto; padding: 16px 20px 24px; }

.board {
  display: grid;
  grid-template-columns: repeat(6, minmax(220px, 1fr));
  gap: 12px;
  min-height: 100%;
}
.grid-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.list-board {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 720px;
}

/* Empty state */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}
.empty-icon {
  width: 52px;
  height: 52px;
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fg-3);
}
.empty-title { font-size: 15px; font-weight: 600; color: var(--fg-1); }
.empty-sub { font-size: 13px; color: var(--fg-2); max-width: 280px; line-height: 1.5; }

/* Add button */
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 30px;
  border-radius: var(--r-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: filter var(--t-fast);
  border: none;
  background: var(--accent);
  color: var(--accent-fg);
}
.btn-add:hover { filter: brightness(1.1); }
</style>
