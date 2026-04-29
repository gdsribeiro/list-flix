import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Item, CategoryId, StatusId } from '@/types'
import { CATEGORIES } from '@/constants'

export type SortKey = 'recent' | 'title'

const STORAGE_KEY = 'listflix.v1.items'

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      items.value = Array.isArray(parsed) ? parsed : []
    } catch {
      items.value = []
    }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value)) } catch {}
  }

  function add(item: Item) {
    items.value.push(item)
    persist()
  }

  function update(updated: Item) {
    const idx = items.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) items.value[idx] = updated
    persist()
  }

  function remove(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    persist()
  }

  function moveToStatus(id: string, status: StatusId) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], status, updatedAt: Date.now() }
      persist()
    }
  }

  function reorderInStatus(draggedId: string, targetId: string) {
    const dragged = items.value.find(i => i.id === draggedId)
    const target = items.value.find(i => i.id === targetId)
    if (!dragged || !target || dragged.status !== target.status) return

    const statusItems = items.value
      .filter(i => i.status === dragged.status)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

    const fromIdx = statusItems.findIndex(i => i.id === draggedId)
    const toIdx = statusItems.findIndex(i => i.id === targetId)
    const adjustedToIdx = fromIdx < toIdx ? toIdx - 1 : toIdx
    statusItems.splice(fromIdx, 1)
    statusItems.splice(adjustedToIdx, 0, dragged)

    const now = Date.now()
    statusItems.forEach((item, idx) => {
      const globalIdx = items.value.findIndex(i => i.id === item.id)
      if (globalIdx !== -1) {
        items.value[globalIdx] = { ...items.value[globalIdx], updatedAt: now - idx * 1000 }
      }
    })
    persist()
  }

  function exportJson(): string {
    return JSON.stringify(items.value, null, 2)
  }

  function importJson(raw: string) {
    const data = JSON.parse(raw)
    if (Array.isArray(data)) { items.value = data; persist() }
  }

  function countsByCategory(): Record<CategoryId, number> {
    const counts = {} as Record<CategoryId, number>
    for (const c of CATEGORIES) counts[c.id] = 0
    for (const i of items.value) counts[i.category] = (counts[i.category] ?? 0) + 1
    return counts
  }

  function getFiltered(category: CategoryId | 'all', search: string, sort: SortKey): Item[] {
    let xs = category === 'all' ? [...items.value] : items.value.filter(i => i.category === category)
    if (search.trim()) {
      const q = search.toLowerCase()
      xs = xs.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        i.platform.toLowerCase().includes(q) ||
        i.notes.toLowerCase().includes(q),
      )
    }
    const out = [...xs]
    if (sort === 'title') out.sort((a, b) => a.title.localeCompare(b.title))
    else out.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    return out
  }

  return { items, load, add, update, remove, moveToStatus, reorderInStatus, exportJson, importJson, countsByCategory, getFiltered }
})

export { uid }
