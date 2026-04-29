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

  // Moves item to new status and appends it to the end of items array
  // so it lands last in the new column (predictable position for moveToStatusAt).
  function moveToStatus(id: string, status: StatusId) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx === -1) return
    const [item] = items.value.splice(idx, 1)
    items.value.push({ ...item, status, updatedAt: Date.now() })
    persist()
  }

  // Reorders within same status by rearranging items.value in-place.
  // Does NOT touch updatedAt — only the drag position changes, not the edit timestamp.
  function reorderInStatus(draggedId: string, toIndex: number) {
    const status = items.value.find(i => i.id === draggedId)?.status
    if (!status) return

    // Extract status items preserving array order
    const statusItems = items.value.filter(i => i.status === status)
    const fromIndex = statusItems.findIndex(i => i.id === draggedId)
    if (fromIndex === -1) return

    const insertAt = Math.min(
      toIndex > fromIndex ? toIndex - 1 : toIndex,
      statusItems.length - 1,
    )
    if (fromIndex === insertAt) return

    const [moved] = statusItems.splice(fromIndex, 1)
    statusItems.splice(insertAt, 0, moved)

    // Write reordered items back into the same slots in items.value
    let ptr = 0
    items.value = items.value.map(item =>
      item.status === status ? statusItems[ptr++] : item,
    )
    persist()
  }

  function moveToStatusAt(id: string, status: StatusId, toIndex: number) {
    moveToStatus(id, status)   // item appended to end → last in new column
    reorderInStatus(id, toIndex) // move from last to toIndex
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

  // Filtered without sorting — preserves items.value order for kanban columns.
  function getFilteredUnsorted(category: CategoryId | 'all', search: string): Item[] {
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
    return xs
  }

  return { items, load, add, update, remove, moveToStatus, moveToStatusAt, reorderInStatus, exportJson, importJson, countsByCategory, getFiltered, getFilteredUnsorted }
})

export { uid }
