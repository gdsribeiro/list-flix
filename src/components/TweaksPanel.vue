<script setup lang="ts">
import { useTweaksStore } from '@/stores/tweaks'
import { useItemsStore } from '@/stores/items'
import { tr } from '@/constants/i18n'

const tweaks = useTweaksStore()
const items = useItemsStore()
const lang = () => tweaks.tweaks.language

const ACCENT_PRESETS = [265, 30, 145, 220, 340, 60]

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
  <div class="tweaks-panel">
    <h3>{{ tr('appearance', lang()) }}</h3>

    <div class="seg-row">
      <span class="seg-label">{{ tr('theme', lang()) }}</span>
      <div class="seg">
        <button :data-active="tweaks.tweaks.theme === 'dark' || undefined" @click="tweaks.set('theme', 'dark')">{{ tr('dark', lang()) }}</button>
        <button :data-active="tweaks.tweaks.theme === 'light' || undefined" @click="tweaks.set('theme', 'light')">{{ tr('light', lang()) }}</button>
      </div>
    </div>

    <div class="seg-row">
      <span class="seg-label">{{ tr('density', lang()) }}</span>
      <div class="seg">
        <button :data-active="tweaks.tweaks.density === 'compact' || undefined" @click="tweaks.set('density', 'compact')">{{ tr('compact', lang()) }}</button>
        <button :data-active="tweaks.tweaks.density === 'normal' || undefined" @click="tweaks.set('density', 'normal')">{{ tr('normal', lang()) }}</button>
        <button :data-active="tweaks.tweaks.density === 'spacious' || undefined" @click="tweaks.set('density', 'spacious')">{{ tr('spacious', lang()) }}</button>
      </div>
    </div>

    <div class="seg-row">
      <span class="seg-label">{{ tr('layout', lang()) }}</span>
      <div class="seg">
        <button :data-active="tweaks.tweaks.layout === 'kanban' || undefined" @click="tweaks.set('layout', 'kanban')">{{ tr('layoutKanban', lang()) }}</button>
        <button :data-active="tweaks.tweaks.layout === 'grid' || undefined" @click="tweaks.set('layout', 'grid')">{{ tr('layoutGrid', lang()) }}</button>
        <button :data-active="tweaks.tweaks.layout === 'list' || undefined" @click="tweaks.set('layout', 'list')">{{ tr('layoutList', lang()) }}</button>
      </div>
    </div>

    <div class="accent-row">
      <label class="seg-label">
        {{ tr('accent', lang()) }}
        <span class="accent-val">{{ tweaks.tweaks.accentHue }}°</span>
      </label>
      <input
        type="range" min="0" max="360" step="5"
        :value="tweaks.tweaks.accentHue"
        class="range-input"
        @input="tweaks.set('accentHue', parseInt(($event.target as HTMLInputElement).value))"
      />
      <div class="swatches">
        <button
          v-for="h in ACCENT_PRESETS"
          :key="h"
          :data-active="tweaks.tweaks.accentHue === h || undefined"
          :style="`background: oklch(0.72 0.18 ${h})`"
          @click="tweaks.set('accentHue', h)"
        />
      </div>
    </div>

    <h3>{{ tr('dataSection', lang()) }}</h3>
    <button class="btn" @click="exportData">{{ tr('exportData', lang()) }}</button>
    <button class="btn" @click="importData">{{ tr('importData', lang()) }}</button>
  </div>
</template>

<style scoped>
.tweaks-panel {
  position: fixed; right: 16px; bottom: 16px; width: 270px;
  background: var(--bg-elevated); border: 1px solid var(--border-1);
  border-radius: var(--r-lg); box-shadow: var(--shadow-modal);
  z-index: 60; padding: 14px; display: flex; flex-direction: column;
  gap: 10px; max-height: calc(100vh - 32px); overflow-y: auto;
}
h3 { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 600; }
.seg-row { display: flex; flex-direction: column; gap: 5px; }
.seg-label { font-size: 11.5px; color: var(--fg-1); font-weight: 500; }
.seg {
  display: inline-flex; background: var(--bg-2);
  border: 1px solid var(--border-0); border-radius: 7px; padding: 2px;
}
.seg button {
  flex: 1; background: none; border: none; color: var(--fg-2);
  padding: 4px 8px; font-size: 11px; font-weight: 500;
  border-radius: 5px; cursor: pointer; transition: var(--t-fast);
}
.seg button[data-active] { background: var(--bg-4); color: var(--fg-0); }

.accent-row { display: flex; flex-direction: column; gap: 6px; }
.accent-val { font-family: var(--font-mono); color: var(--fg-2); font-size: 10px; }
.range-input { -webkit-appearance: none; appearance: none; background: transparent; height: 22px; padding: 0; border: none; cursor: pointer; width: 100%; }
.range-input::-webkit-slider-runnable-track { background: var(--bg-3); height: 4px; border-radius: 2px; }
.range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); margin-top: -5px; cursor: pointer; }
.swatches { display: flex; gap: 6px; flex-wrap: wrap; }
.swatches button {
  width: 22px; height: 22px; border-radius: 50%;
  border: 1px solid var(--border-1); cursor: pointer; padding: 0;
}
.swatches button[data-active] { box-shadow: 0 0 0 2px var(--bg-elevated), 0 0 0 4px var(--accent); }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  gap: 6px; padding: 0 14px; height: 30px; border-radius: var(--r-md);
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: var(--t-fast); border: 1px solid var(--border-0);
  background: var(--bg-2); color: var(--fg-1);
}
.btn:hover { background: var(--bg-3); color: var(--fg-0); border-color: var(--border-1); }
.btn-danger { color: oklch(0.7 0.13 25); border-color: oklch(0.5 0.08 25); }
.btn-danger:hover { background: oklch(0.32 0.06 25); color: oklch(0.78 0.13 25); }
</style>
