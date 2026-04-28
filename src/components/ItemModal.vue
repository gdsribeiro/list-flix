<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import type { Item } from '@/types'
import { CATEGORIES, STATUSES } from '@/constants'
import { tr } from '@/constants/i18n'
import { useTweaksStore } from '@/stores/tweaks'
import { searchByCategory } from '@/services/apiSearch'
import type { ApiResult } from '@/types'
import { uid } from '@/stores/items'

const props = defineProps<{ item: Item | null; isNew: boolean }>()
const emit = defineEmits<{ save: [Item]; delete: [string]; close: [] }>()

const tweaks = useTweaksStore()
const lang = () => tweaks.tweaks.language

const form = reactive<Item>({
  id: '', category: 'games', status: 'wishlist', title: '', year: '',
  platform: '', duration: '', tags: [], progress: 0, cover: '', notes: '',
  createdAt: Date.now(), updatedAt: Date.now(),
})

watch(() => props.item, (item) => {
  if (!item) return
  Object.assign(form, {
    ...item,
    tags: [...item.tags],
  })
}, { immediate: true })

const tagsInput = ref('')
watch(() => form.tags, (tags) => { tagsInput.value = tags.join(', ') }, { immediate: true })

const apiQuery = ref('')
const apiResults = ref<ApiResult[]>([])
const apiLoading = ref(false)
let apiTimer: ReturnType<typeof setTimeout> | null = null

watch(apiQuery, (q) => {
  if (apiTimer) clearTimeout(apiTimer)
  if (!q.trim()) { apiResults.value = []; apiLoading.value = false; return }
  apiLoading.value = true
  apiTimer = setTimeout(async () => {
    apiResults.value = await searchByCategory(q, form.category)
    apiLoading.value = false
  }, 450)
})

function pickApiResult(r: ApiResult) {
  form.title = r.title
  if (r.year) form.year = r.year
  if (r.cover) form.cover = r.cover
  if (r.tags.length) {
    const cur = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
    tagsInput.value = Array.from(new Set([...cur, ...r.tags])).join(', ')
  }
  apiQuery.value = ''
  apiResults.value = []
}

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
  if (e.key === 'Escape') emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div id="modal-backdrop" class="backdrop" @click="onBackdrop">
    <form class="modal" @submit.prevent="submit">
      <div class="modal-head">
        <h2>{{ isNew ? tr('addNew', lang()) : tr('edit', lang()) }}</h2>
        <button type="button" class="close-btn" @click="emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- API Search -->
        <div class="api-section">
          <label class="field-label">{{ tr('searchApi', lang()) }}</label>
          <input
            v-model="apiQuery"
            type="text"
            class="field-input"
            :placeholder="tr('apiHint', lang())"
            autofocus
          />
          <div v-if="apiQuery.trim()" class="api-status">
            {{ apiLoading ? tr('searching', lang()) : apiResults.length === 0 ? tr('noResults', lang()) : `${apiResults.length} ${tr('results', lang())}` }}
          </div>
          <div v-if="apiResults.length" class="api-results">
            <div
              v-for="(r, i) in apiResults"
              :key="i"
              class="api-result"
              @click="pickApiResult(r)"
            >
              <div class="api-result-cover">
                <img v-if="r.cover" :src="r.cover" alt="" @error="($event.target as HTMLImageElement).style.display='none'" />
              </div>
              <div class="api-result-info">
                <div class="api-result-title">{{ r.title }}</div>
                <div class="api-result-meta">{{ r.year }}{{ r.year && r.meta ? ' · ' : '' }}{{ r.meta }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Title -->
        <div class="field">
          <label class="field-label">{{ tr('title', lang()) }}</label>
          <input v-model="form.title" type="text" class="field-input" required />
        </div>

        <!-- Category + Status -->
        <div class="field-row">
          <div class="field">
            <label class="field-label">{{ tr('category', lang()) }}</label>
            <select v-model="form.category" class="field-input">
              <option v-for="c in CATEGORIES" :key="c.id" :value="c.id">{{ c.icon }} {{ c.labels[lang()] }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ tr('status', lang()) }}</label>
            <select v-model="form.status" class="field-input">
              <option v-for="s in STATUSES" :key="s.id" :value="s.id">{{ s.labels[lang()] }}</option>
            </select>
          </div>
        </div>

        <!-- Year + Platform + Duration -->
        <div class="field-row field-row-3">
          <div class="field">
            <label class="field-label">{{ tr('year', lang()) }}</label>
            <input v-model="form.year" type="text" class="field-input" />
          </div>
          <div class="field">
            <label class="field-label">{{ tr('platform', lang()) }}</label>
            <input v-model="form.platform" type="text" class="field-input" placeholder="Steam, Netflix…" />
          </div>
          <div class="field">
            <label class="field-label">{{ tr('duration', lang()) }}</label>
            <input v-model="form.duration" type="text" class="field-input" placeholder="12h, 320 pgs…" />
          </div>
        </div>

        <!-- Tags -->
        <div class="field">
          <label class="field-label">{{ tr('tags', lang()) }}</label>
          <input v-model="tagsInput" type="text" class="field-input" placeholder="RPG, Sci-Fi" />
        </div>

        <!-- Progress -->
        <div class="field">
          <label class="field-label">{{ tr('progress', lang()) }} · <span>{{ form.progress }}%</span></label>
          <input v-model.number="form.progress" type="range" min="0" max="100" step="1" class="range-input" />
        </div>

        <!-- Cover -->
        <div class="field">
          <label class="field-label">{{ tr('cover', lang()) }}</label>
          <input v-model="form.cover" type="text" class="field-input" placeholder="https://…" />
        </div>

        <!-- Notes -->
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
  padding: 16px 20px; border-bottom: 1px solid var(--border-0);
}
.modal-head h2 { margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; }
.close-btn {
  width: 28px; height: 28px; background: transparent; border: 1px solid var(--border-0);
  border-radius: 6px; color: var(--fg-2); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.close-btn:hover { color: var(--fg-0); background: var(--bg-3); }

.modal-body { padding: 16px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }

.api-section {
  display: flex; flex-direction: column; gap: 7px;
  padding-bottom: 14px; border-bottom: 1px dashed var(--border-0);
}
.api-status { font-size: 11px; color: var(--fg-2); font-family: var(--font-mono); }
.api-results { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
.api-result {
  display: grid; grid-template-columns: 40px 1fr; gap: 10px;
  padding: 6px; border-radius: 6px; cursor: pointer; transition: var(--t-fast);
}
.api-result:hover { background: var(--bg-3); }
.api-result-cover { width: 40px; height: 56px; background: var(--bg-3); border-radius: 4px; overflow: hidden; }
.api-result-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.api-result-title { font-size: 12.5px; font-weight: 500; color: var(--fg-0); line-height: 1.3; }
.api-result-meta { font-size: 11px; color: var(--fg-2); font-family: var(--font-mono); margin-top: 2px; }

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
.field-row-3 { grid-template-columns: 1fr 1fr 1fr; }

.range-input { -webkit-appearance: none; appearance: none; background: transparent; height: 22px; padding: 0; border: none; cursor: pointer; width: 100%; }
.range-input::-webkit-slider-runnable-track { background: var(--bg-3); height: 4px; border-radius: 2px; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); margin-top: -5px; cursor: pointer; }

.modal-foot {
  padding: 14px 20px; border-top: 1px solid var(--border-0);
  display: flex; align-items: center; justify-content: space-between;
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
