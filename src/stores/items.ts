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

  function reorderInStatus(draggedId: string, toIndex: number) {
    const item = items.value.find(i => i.id === draggedId)
    if (!item) return

    const statusItems = items.value
      .filter(i => i.status === item.status)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

    const fromIndex = statusItems.findIndex(i => i.id === draggedId)
    if (fromIndex === -1) return

    statusItems.splice(fromIndex, 1)
    const insertAt = Math.min(toIndex > fromIndex ? toIndex - 1 : toIndex, statusItems.length)
    statusItems.splice(insertAt, 0, item)

    const now = Date.now()
    statusItems.forEach((si, idx) => {
      const gi = items.value.findIndex(i => i.id === si.id)
      if (gi !== -1) items.value[gi] = { ...items.value[gi], updatedAt: now - idx * 1000 }
    })
    persist()
  }

  function moveToStatusAt(id: string, status: StatusId, toIndex: number) {
    moveToStatus(id, status)
    reorderInStatus(id, toIndex + 1)
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

  return { items, load, add, update, remove, moveToStatus, moveToStatusAt, reorderInStatus, exportJson, importJson, countsByCategory, getFiltered }
})

export { uid }
