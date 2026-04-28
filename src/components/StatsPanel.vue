<script setup lang="ts">
import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useTweaksStore } from '@/stores/tweaks'
import { CATEGORIES, STATUSES } from '@/constants'
import { tr } from '@/constants/i18n'

const items = useItemsStore()
const tweaks = useTweaksStore()
const lang = () => tweaks.tweaks.language

const total = computed(() => items.items.length)
const inProgress = computed(() => items.items.filter(i => i.status === 'active').length)
const cy = new Date().getFullYear()
const doneThisYear = computed(() =>
  items.items.filter(i => i.status === 'done' && new Date(i.updatedAt ?? i.createdAt ?? 0).getFullYear() === cy).length
)
const byCat = computed(() =>
  CATEGORIES.map(c => ({ cat: c, count: items.items.filter(i => i.category === c.id).length })).filter(x => x.count > 0)
)
const maxCat = computed(() => Math.max(1, ...byCat.value.map(x => x.count)))
const byStatus = computed(() =>
  STATUSES.map(s => ({ st: s, count: items.items.filter(i => i.status === s.id).length }))
)
const maxStatus = computed(() => Math.max(1, ...byStatus.value.map(x => x.count)))
</script>

<template>
  <div class="stats-panel">
    <div class="panel-head">
      <h2>{{ tr('stats', lang()) }}</h2>
      <button class="close-btn" @click="tweaks.showStats = false">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="panel-body">
      <div class="stat-grid">
        <div class="stat-tile">
          <div class="num">{{ total }}</div>
          <div class="lbl">{{ tr('total', lang()) }}</div>
        </div>
        <div class="stat-tile">
          <div class="num">{{ inProgress }}</div>
          <div class="lbl">{{ tr('inProgress', lang()) }}</div>
        </div>
        <div class="stat-tile span-2">
          <div class="num">{{ doneThisYear }}</div>
          <div class="lbl">{{ tr('doneThisYear', lang()) }} {{ cy }}</div>
        </div>
      </div>

      <div class="stat-section">
        <h3>{{ tr('byCategory', lang()) }}</h3>
        <div v-for="x in byCat" :key="x.cat.id" class="bar-row">
          <div class="bar-label">{{ x.cat.icon }} {{ x.cat.labels[lang()] }}</div>
          <div class="bar-track"><div class="bar-fill" :style="{ width: (x.count / maxCat) * 100 + '%' }" /></div>
          <div class="bar-num">{{ x.count }}</div>
        </div>
      </div>

      <div class="stat-section">
        <h3>{{ tr('byStatus', lang()) }}</h3>
        <div v-for="x in byStatus" :key="x.st.id" class="bar-row">
          <div class="bar-label">
            <span class="status-dot" :style="`background: var(${x.st.colorVar})`" />
            {{ x.st.labels[lang()] }}
          </div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: (x.count / maxStatus) * 100 + '%', background: `var(${x.st.colorVar})` }" />
          </div>
          <div class="bar-num">{{ x.count }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  position: fixed; right: 16px; top: 70px;
  width: 300px; max-height: calc(100vh - 96px);
  background: var(--bg-elevated); border: 1px solid var(--border-1);
  border-radius: var(--r-lg); box-shadow: var(--shadow-modal);
  z-index: 50; display: flex; flex-direction: column; overflow: hidden;
}
.panel-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; border-bottom: 1px solid var(--border-0);
}
.panel-head h2 { margin: 0; font-size: 14px; font-weight: 600; }
.close-btn {
  width: 28px; height: 28px; background: transparent; border: 1px solid var(--border-0);
  border-radius: 6px; color: var(--fg-2); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
}
.close-btn:hover { color: var(--fg-0); background: var(--bg-3); }

.panel-body { padding: 14px 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 18px; }

.stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.stat-tile { padding: 12px; background: var(--bg-2); border: 1px solid var(--border-0); border-radius: var(--r-md); }
.stat-tile.span-2 { grid-column: span 2; }
.num { font-size: 22px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; color: var(--fg-0); }
.lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); margin-top: 6px; }

.stat-section h3 { margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 600; }
.bar-row { display: grid; grid-template-columns: 110px 1fr 28px; align-items: center; gap: 8px; padding: 4px 0; }
.bar-label { font-size: 11.5px; color: var(--fg-1); display: flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; }
.bar-track { height: 6px; background: var(--bg-3); border-radius: 3px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); border-radius: 3px; }
.bar-num { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); text-align: right; }
</style>
