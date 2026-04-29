<script setup lang="ts">
import { ref, computed } from 'vue'
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

const visible = computed(() => itemsStore.getFiltered(props.activeCat, props.search, sort.value))
const byStatus = computed(() => {
  const map: Record<string, Item[]> = {}
  for (const s of STATUSES) map[s.id] = []
  for (const i of visible.value) map[i.status].push(i)
  return map
})

const activeCatObj = computed(() =>
  props.activeCat === 'all' ? null : CATEGORIES.find(c => c.id === props.activeCat)
)

function openAdd(statusId?: string) {
  const defaultCat: CategoryId = props.activeCat === 'all' ? 'games' : props.activeCat
  editingItem.value = {
    id: uid(), category: defaultCat,
    status: (statusId as any) ?? 'wishlist',
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
</script>

<template>
  <div class="home-wrap">
    <div class="home-toolbar">
      <div class="toolbar-left">
        <span class="cat-label">
          <template v-if="activeCatObj">{{ activeCatObj.labels[lang()] }}</template>
          <template v-else>{{ tr('allCategories', lang()) }}</template>
        </span>
        <span class="item-count">{{ visible.length }}</span>
      </div>
      <div class="toolbar-right">
        <select class="select" v-model="sort">
          <option value="recent">{{ tr('sortRecent', lang()) }}</option>
          <option value="title">{{ tr('sortTitle', lang()) }}</option>
        </select>
        <div class="layout-seg">
          <button :data-active="tweaks.tweaks.layout === 'kanban' || undefined" @click="tweaks.set('layout', 'kanban')">{{ tr('layoutKanban', lang()) }}</button>
          <button :data-active="tweaks.tweaks.layout === 'grid' || undefined" @click="tweaks.set('layout', 'grid')">{{ tr('layoutGrid', lang()) }}</button>
          <button :data-active="tweaks.tweaks.layout === 'list' || undefined" @click="tweaks.set('layout', 'list')">{{ tr('layoutList', lang()) }}</button>
        </div>
        <button class="btn btn-add" @click="openAdd()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          {{ tr('add', lang()) }}
        </button>
      </div>
    </div>

    <main class="board-wrap">
      <div v-if="visible.length === 0 && !search" class="empty">
        <div class="empty-glyph">
          <span>◎</span>
        </div>
        <div class="empty-title">{{ tr('emptyTitle', lang()) }}</div>
        <div class="empty-sub">{{ tr('emptySub', lang()) }}</div>
        <button class="btn btn-add" style="margin-top: 8px" @click="openAdd()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          {{ tr('add', lang()) }}
        </button>
      </div>

      <div v-else-if="tweaks.tweaks.layout === 'grid'" class="grid-board">
        <ItemCard
          v-for="item in visible"
          :key="item.id"
          :item="item"
          @click="openEdit(item)"
        />
      </div>

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
  </div>
</template>

<style scoped>
.home-wrap { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

.home-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; border-bottom: 1px solid var(--border-0);
  background: var(--bg-1); flex-shrink: 0; gap: 12px;
}
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.cat-label { font-size: 14px; font-weight: 600; color: var(--fg-0); }
.item-count {
  font-family: var(--font-mono); font-size: 10px;
  padding: 2px 6px; background: var(--bg-3); border-radius: 4px; color: var(--fg-2);
}

.select {
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: 8px; color: var(--fg-1); padding: 6px 10px;
  font-size: 12px; cursor: pointer; outline: none;
}
.select:hover { border-color: var(--border-1); }

.layout-seg {
  display: inline-flex; background: var(--bg-2);
  border: 1px solid var(--border-0); border-radius: 8px; padding: 2px;
}
.layout-seg button {
  background: none; border: none; color: var(--fg-2);
  padding: 4px 9px; font-size: 11px; font-weight: 500;
  border-radius: 5px; cursor: pointer; transition: var(--t-fast);
}
.layout-seg button[data-active] { background: var(--bg-4); color: var(--fg-0); }

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
.btn:hover { background: var(--bg-3); color: var(--fg-0); border-color: var(--border-1); }
.btn-add { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
.btn-add:hover { filter: brightness(1.08); }
</style>
