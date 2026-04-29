<script setup lang="ts">
import { useItemsStore } from '@/stores/items'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'

const tweaks = useTweaksStore()
const items = useItemsStore()
const lang = () => tweaks.tweaks.language

function exportData() {
  const blob = new Blob([items.exportJson()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `listflix-${Date.now()}.json`; a.click()
  URL.revokeObjectURL(url)
}

function importData() {
  const inp = document.createElement('input')
  inp.type = 'file'; inp.accept = 'application/json'
  inp.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try { items.importJson(reader.result as string) } catch {}
    }
    reader.readAsText(file)
  }
  inp.click()
}
</script>

<template>
  <div class="settings-page">
    <div class="page-content">
      <h1 class="page-title">{{ tr('settings', lang()) }}</h1>

      <section class="section">
        <h2 class="section-title">{{ tr('appearance', lang()) }}</h2>
        <div class="setting-row">
          <span class="setting-label">{{ tr('showCovers', lang()) }}</span>
          <label class="toggle-switch">
            <input
              type="checkbox"
              :checked="tweaks.tweaks.showCovers"
              @change="tweaks.set('showCovers', !tweaks.tweaks.showCovers)"
            />
            <span class="toggle-track"><span class="toggle-thumb" /></span>
          </label>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">{{ tr('dataSection', lang()) }}</h2>
        <div class="data-actions">
          <button class="btn" @click="exportData">{{ tr('exportData', lang()) }}</button>
          <button class="btn" @click="importData">{{ tr('importData', lang()) }}</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page { flex: 1; overflow-y: auto; padding: 32px 40px; }
.page-content { max-width: 480px; }

.page-title {
  margin: 0 0 32px; font-size: 22px; font-weight: 700;
  letter-spacing: -0.02em; color: var(--fg-0);
}

.section { margin-bottom: 32px; }
.section-title {
  margin: 0 0 16px; font-size: 11px; text-transform: uppercase;
  letter-spacing: 0.06em; color: var(--fg-2); font-weight: 600;
}

.setting-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0; border-bottom: 1px solid var(--border-0);
}
.setting-label { font-size: 13px; color: var(--fg-1); font-weight: 500; }

.toggle-switch { display: flex; align-items: center; cursor: pointer; }
.toggle-switch input { display: none; }
.toggle-track {
  width: 36px; height: 20px; border-radius: 10px;
  background: var(--bg-3); border: 1px solid var(--border-1);
  display: flex; align-items: center; padding: 2px;
  transition: background var(--t-fast), border-color var(--t-fast);
}
.toggle-switch input:checked + .toggle-track {
  background: var(--accent-soft); border-color: var(--accent-line);
}
.toggle-thumb {
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--fg-2); transition: transform var(--t-fast), background var(--t-fast);
}
.toggle-switch input:checked + .toggle-track .toggle-thumb {
  transform: translateX(16px); background: var(--accent);
}

.data-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 0 16px; height: 34px; border-radius: var(--r-md);
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: var(--t-fast); border: 1px solid var(--border-0);
  background: var(--bg-2); color: var(--fg-1);
}
.btn:hover { background: var(--bg-3); color: var(--fg-0); border-color: var(--border-1); }
</style>
