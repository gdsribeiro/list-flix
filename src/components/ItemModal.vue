<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Item, ApiResult } from '@/types'
import { CATEGORIES, STATUSES } from '@/constants'
import { tr } from '@/constants/i18n'
import { useTweaksStore } from '@/stores/tweaks'
import { uid } from '@/stores/items'
import { searchPaged, type SearchSource } from '@/services/apiSearch'

const props = defineProps<{ item: Item | null; isNew: boolean }>()
const emit = defineEmits<{ save: [Item]; delete: [string]; close: [] }>()

const tweaks = useTweaksStore()
const lang = () => tweaks.tweaks.language

const form = reactive<Item>({
  id: '', category: 'games', status: 'wishlist', title: '',
  platform: '', tags: [], progress: 0, cover: '', notes: '',
  createdAt: Date.now(), updatedAt: Date.now(),
})

watch(() => props.item, (item) => {
  if (!item) return
  Object.assign(form, { ...item, tags: [...item.tags] })
}, { immediate: true })

const tagsInput = ref('')
watch(() => form.tags, (tags) => { tagsInput.value = tags.join(', ') }, { immediate: true })

// ── Online search panel ──
const showSearch = ref(false)
const searchQuery = ref('')
const searchSource = ref<SearchSource>('auto')
const searchPage = ref(1)
const searchResults = ref<ApiResult[]>([])
const searchTotal = ref(0)
const searchLoading = ref(false)
const searchTotalPages = computed(() => Math.max(1, Math.ceil(searchTotal.value / 10)))

let searchTimer: ReturnType<typeof setTimeout> | null = null

function triggerSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  if (!searchQuery.value.trim()) { searchResults.value = []; searchTotal.value = 0; searchLoading.value = false; return }
  searchLoading.value = true
  searchTimer = setTimeout(doSearch, 450)
}

async function doSearch() {
  if (!searchQuery.value.trim()) return
  const res = await searchPaged(searchQuery.value, form.category, searchSource.value, searchPage.value)
  searchResults.value = res.results
  searchTotal.value = res.total
  searchLoading.value = false
}

watch([searchQuery, searchSource], () => { searchPage.value = 1; triggerSearch() })
watch(searchPage, doSearch)
watch(() => form.category, () => { if (showSearch.value) { searchPage.value = 1; triggerSearch() } })

function pickResult(r: ApiResult) {
  if (!form.title) form.title = r.title
  else if (!confirm(lang() === 'pt' ? `Substituir dados do formulário com "${r.title}"?` : `Replace form data with "${r.title}"?`)) return
  form.title = r.title
  form.cover = r.cover
  if (r.tags.length) {
    const cur = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
    tagsInput.value = Array.from(new Set([...cur, ...r.tags])).join(', ')
  }
  if (r.meta && !form.notes) form.notes = r.meta
  showSearch.value = false
}

// ── Form submit / delete ──
function submit() {
  const item: Item = {
    ...form,
    id: form.id || uid(),
    tags: tagsInput.value.split(',').map(s => s.trim()).filter(Boolean),
    updatedAt: Date.now(),
    createdAt: form.createdAt || Date.now(),
  }
  emit('save', item)
}

function handleDelete() {
  if (!confirm(tr('confirmDelete', lang()))) return
  emit('delete', form.id)
}

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).id === 'modal-backdrop') emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showSearch.value) { showSearch.value = false; return }
    emit('close')
  }
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div id="modal-backdrop" class="backdrop" @click="onBackdrop">
    <div class="modal">
      <div class="modal-head">
        <h2>{{ isNew ? tr('addNew', lang()) : tr('edit', lang()) }}</h2>
        <div class="head-actions">
          <button
            type="button"
            class="search-toggle"
            :data-active="showSearch || undefined"
            @click="showSearch = !showSearch"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.25" stroke="currentColor" stroke-width="1.4"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            {{ tr('searchOnline', lang()) }}
          </button>
          <button type="button" class="close-btn" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Search panel -->
      <div v-if="showSearch" class="search-panel">
        <div class="search-filters">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="lang() === 'pt' ? 'Buscar…' : 'Search…'"
            autofocus
          />
          <select v-model="searchSource" class="field-input select-sm">
            <option value="auto">{{ tr('sourceAuto', lang()) }}</option>
            <option value="openlibrary">Open Library</option>
            <option value="itunes">iTunes</option>
            <option value="jikan">Jikan (Anime)</option>
            <option value="wikipedia">Wikipedia</option>
          </select>
        </div>

        <div v-if="searchLoading" class="search-status">{{ tr('searching', lang()) }}</div>
        <div v-else-if="searchQuery.trim() && searchResults.length === 0" class="search-status">{{ tr('noResults', lang()) }}</div>

        <div v-if="searchResults.length" class="search-results">
          <div
            v-for="(r, i) in searchResults"
            :key="i"
            class="search-result"
            @click="pickResult(r)"
          >
            <div class="result-cover">
              <img v-if="r.cover" :src="r.cover" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
            </div>
            <div class="result-info">
              <div class="result-title">{{ r.title }}</div>
              <div v-if="r.meta" class="result-meta">{{ r.meta }}</div>
            </div>
          </div>
        </div>

        <div v-if="searchTotalPages > 1" class="search-pagination">
          <button class="page-btn" :disabled="searchPage <= 1" @click="searchPage--">←</button>
          <span class="page-info">{{ searchPage }} / {{ searchTotalPages }}</span>
          <button class="page-btn" :disabled="searchPage >= searchTotalPages" @click="searchPage++">→</button>
        </div>
      </div>

      <!-- Form -->
      <form class="modal-form" @submit.prevent="submit">
        <div class="modal-body">
          <div class="field">
            <label class="field-label">{{ tr('title', lang()) }}</label>
            <input v-model="form.title" type="text" class="field-input" required />
          </div>

          <div class="field-row">
            <div class="field">
              <label class="field-label">{{ tr('category', lang()) }}</label>
              <select v-model="form.category" class="field-input">
                <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.labels[lang()] }}</option>
              </select>
            </div>
            <div class="field">
              <label class="field-label">{{ tr('status', lang()) }}</label>
              <select v-model="form.status" class="field-input">
                <option v-for="s in STATUSES" :key="s.id" :value="s.id">{{ s.labels[lang()] }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="field-label">{{ tr('platform', lang()) }}</label>
            <input v-model="form.platform" type="text" class="field-input" placeholder="Steam, Netflix…" />
          </div>

          <div class="field">
            <label class="field-label">{{ tr('tags', lang()) }}</label>
            <input v-model="tagsInput" type="text" class="field-input" placeholder="RPG, Sci-Fi" />
          </div>

          <div class="field">
            <label class="field-label">{{ tr('progress', lang()) }} · <span>{{ form.progress }}%</span></label>
            <input v-model.number="form.progress" type="range" min="0" max="100" step="1" class="range-input" />
          </div>

          <div class="field">
            <label class="field-label">{{ tr('cover', lang()) }}</label>
            <input v-model="form.cover" type="text" class="field-input" placeholder="https://…" />
          </div>

          <div class="field">
            <label class="field-label">{{ tr('notes', lang()) }}</label>
            <textarea v-model="form.notes" class="field-input field-textarea" />
          </div>
        </div>

        <div class="modal-foot">
          <button v-if="!isNew" type="button" class="btn btn-danger" @click="handleDelete">
            {{ tr('del', lang()) }}
          </button>
          <div class="foot-right">
            <button type="button" class="btn btn-ghost" @click="emit('close')">{{ tr('cancel', lang()) }}</button>
            <button type="submit" class="btn btn-primary">{{ tr('save', lang()) }}</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed; inset: 0;
  background: oklch(0 0 0 / 0.55);
  backdrop-filter: blur(8px);
  z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal {
  background: var(--bg-elevated); border: 1px solid var(--border-1);
  border-radius: var(--r-xl); width: min(560px, 100%);
  max-height: calc(100vh - 48px); display: flex; flex-direction: column;
  box-shadow: var(--shadow-modal); overflow: hidden;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px; border-bottom: 1px solid var(--border-0); flex-shrink: 0;
}
.modal-head h2 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.head-actions { display: flex; align-items: center; gap: 8px; }

.search-toggle {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 10px; height: 28px; border-radius: var(--r-md);
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: var(--t-fast); border: 1px solid var(--border-0);
  background: transparent; color: var(--fg-2);
}
.search-toggle:hover { background: var(--bg-3); color: var(--fg-0); }
.search-toggle[data-active] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-line); }

.close-btn {
  width: 28px; height: 28px; background: transparent; border: 1px solid var(--border-0);
  border-radius: 6px; color: var(--fg-2); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.close-btn:hover { color: var(--fg-0); background: var(--bg-3); }

/* Search panel */
.search-panel {
  border-bottom: 1px solid var(--border-0); background: var(--bg-1);
  padding: 12px 20px; display: flex; flex-direction: column; gap: 8px;
  flex-shrink: 0; max-height: 300px;
}
.search-filters { display: flex; gap: 8px; }
.search-input {
  flex: 1; background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-sm); padding: 7px 10px; color: var(--fg-0);
  outline: none; font-size: 13px;
}
.search-input:focus { border-color: var(--accent-line); }
.select-sm { width: 140px; flex-shrink: 0; }
.search-status { font-size: 12px; color: var(--fg-2); padding: 4px 0; }
.search-results { overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
.search-result {
  display: grid; grid-template-columns: 36px 1fr; gap: 10px;
  padding: 6px; border-radius: 6px; cursor: pointer; transition: var(--t-fast);
}
.search-result:hover { background: var(--bg-3); }
.result-cover {
  width: 36px; height: 48px; background: var(--bg-3);
  border-radius: 4px; overflow: hidden; flex-shrink: 0;
}
.result-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.result-title { font-size: 12px; font-weight: 500; color: var(--fg-0); line-height: 1.3; }
.result-meta { font-size: 11px; color: var(--fg-2); margin-top: 2px; line-height: 1.3; }
.search-pagination { display: flex; align-items: center; gap: 10px; padding-top: 4px; }
.page-btn {
  width: 26px; height: 26px; background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: 6px; color: var(--fg-1); cursor: pointer; font-size: 13px;
  display: inline-flex; align-items: center; justify-content: center; transition: var(--t-fast);
}
.page-btn:hover:not(:disabled) { background: var(--bg-3); }
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-info { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); }

/* Form */
.modal-form { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
.modal-body { padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 500; }
.field-input {
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-sm); padding: 8px 10px; color: var(--fg-0);
  outline: none; font-size: 13px;
}
.field-input:focus { border-color: var(--accent-line); }
.field-textarea { min-height: 70px; resize: vertical; font-family: inherit; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.range-input { -webkit-appearance: none; appearance: none; background: transparent; height: 22px; padding: 0; border: none; cursor: pointer; width: 100%; }
.range-input::-webkit-slider-runnable-track { background: var(--bg-3); height: 4px; border-radius: 2px; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); margin-top: -5px; cursor: pointer; }

.modal-foot {
  padding: 14px 20px; border-top: 1px solid var(--border-0);
  display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
}
.foot-right { display: flex; gap: 8px; margin-left: auto; }

.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 0 14px; height: 34px; border-radius: var(--r-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: var(--t-fast); border: 1px solid var(--border-0);
  background: var(--bg-2); color: var(--fg-1);
}
.btn:hover { background: var(--bg-3); color: var(--fg-0); border-color: var(--border-1); }
.btn-primary { background: var(--accent); color: var(--accent-fg); border-color: var(--accent); }
.btn-primary:hover { filter: brightness(1.08); }
.btn-ghost { background: transparent; }
.btn-danger { color: oklch(0.7 0.13 25); border-color: oklch(0.5 0.08 25); }
.btn-danger:hover { background: oklch(0.32 0.06 25); color: oklch(0.78 0.13 25); }
</style>
