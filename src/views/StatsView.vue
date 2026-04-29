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
  CATEGORIES.map(c => ({ cat: c, count: items.items.filter(i => i.category === c.id).length }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count)
)
const maxCat = computed(() => Math.max(1, ...byCat.value.map(x => x.count)))

const byStatus = computed(() =>
  STATUSES.map(s => ({ st: s, count: items.items.filter(i => i.status === s.id).length }))
)
const maxStatus = computed(() => Math.max(1, ...byStatus.value.map(x => x.count)))

const statusPct = computed(() =>
  total.value === 0
    ? []
    : STATUSES.map(s => ({
        st: s,
        pct: Math.round((items.items.filter(i => i.status === s.id).length / total.value) * 100),
      })).filter(x => x.pct > 0)
)
</script>

<template>
  <div class="stats-page">
    <div class="stats-inner">
      <h1 class="page-title">{{ tr('stats', lang()) }}</h1>

      <!-- KPI tiles -->
      <div class="kpi-row">
        <div class="kpi-tile">
          <div class="kpi-num">{{ total }}</div>
          <div class="kpi-lbl">{{ tr('total', lang()) }}</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-num">{{ inProgress }}</div>
          <div class="kpi-lbl">{{ tr('inProgress', lang()) }}</div>
        </div>
        <div class="kpi-tile">
          <div class="kpi-num">{{ doneThisYear }}</div>
          <div class="kpi-lbl">{{ tr('doneThisYear', lang()) }} {{ cy }}</div>
        </div>
        <div class="kpi-tile kpi-accent">
          <div class="kpi-num">{{ total > 0 ? Math.round(items.items.filter(i => i.status === 'done').length / total * 100) : 0 }}%</div>
          <div class="kpi-lbl">{{ lang() === 'pt' ? 'Taxa de conclusão' : 'Completion rate' }}</div>
        </div>
      </div>

      <!-- Stacked status bar -->
      <section v-if="statusPct.length" class="section">
        <h2 class="section-title">{{ tr('byStatus', lang()) }}</h2>
        <div class="stack-bar">
          <div
            v-for="x in statusPct"
            :key="x.st.id"
            class="stack-seg"
            :style="{ width: x.pct + '%', background: `var(${x.st.colorVar})` }"
            :title="`${x.st.labels[lang()]}: ${x.pct}%`"
          />
        </div>
        <div class="stack-legend">
          <div v-for="x in statusPct" :key="x.st.id" class="legend-item">
            <span class="legend-dot" :style="`background: var(${x.st.colorVar})`" />
            <span>{{ x.st.labels[lang()] }}</span>
            <span class="legend-pct">{{ x.pct }}%</span>
          </div>
        </div>
      </section>

      <!-- Charts side by side -->
      <div class="charts-row">
        <!-- Category chart -->
        <section class="section chart-section">
          <h2 class="section-title">{{ tr('byCategory', lang()) }}</h2>
          <div v-if="byCat.length === 0" class="empty-note">—</div>
          <div v-else class="chart">
            <div v-for="x in byCat" :key="x.cat.id" class="chart-row">
              <div class="chart-label">
                <span class="chart-label-text">{{ x.cat.labels[lang()] }}</span>
              </div>
              <div class="chart-track">
                <div
                  class="chart-fill"
                  :style="{ width: (x.count / maxCat) * 100 + '%' }"
                />
                <span class="chart-count">{{ x.count }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Status chart -->
        <section class="section chart-section">
          <h2 class="section-title">{{ tr('byStatus', lang()) }}</h2>
          <div class="chart">
            <div v-for="x in byStatus" :key="x.st.id" class="chart-row">
              <div class="chart-label">
                <span class="status-dot" :style="`background: var(${x.st.colorVar})`" />
                <span class="chart-label-text">{{ x.st.labels[lang()] }}</span>
              </div>
              <div class="chart-track">
                <div
                  class="chart-fill"
                  :style="{ width: (x.count / maxStatus) * 100 + '%', background: `var(${x.st.colorVar})` }"
                />
                <span class="chart-count">{{ x.count }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page { flex: 1; overflow-y: auto; padding: 32px 40px; }
.stats-inner { max-width: 1100px; }

.page-title { margin: 0 0 28px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: var(--fg-0); }

/* KPIs */
.kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 40px; }
.kpi-tile {
  padding: 20px 22px; background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-lg);
}
.kpi-tile.kpi-accent {
  background: var(--accent-soft); border-color: var(--accent-line);
}
.kpi-num { font-size: 32px; font-weight: 800; line-height: 1; letter-spacing: -0.03em; color: var(--fg-0); }
.kpi-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); margin-top: 8px; }

/* Stacked bar */
.section { margin-bottom: 36px; }
.section-title { margin: 0 0 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-2); font-weight: 600; }
.stack-bar {
  height: 14px; border-radius: 7px; display: flex; overflow: hidden;
  background: var(--bg-3); gap: 1px; margin-bottom: 12px;
}
.stack-seg { height: 100%; transition: width var(--t-med); min-width: 2px; }
.stack-legend { display: flex; flex-wrap: wrap; gap: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--fg-1); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-pct { font-family: var(--font-mono); font-size: 11px; color: var(--fg-2); }

/* Charts */
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
.chart-section { margin-bottom: 0; }
.chart { display: flex; flex-direction: column; gap: 8px; }
.chart-row { display: flex; align-items: center; gap: 10px; }
.chart-label { display: flex; align-items: center; gap: 7px; width: 130px; flex-shrink: 0; }
.chart-label-text { font-size: 12px; color: var(--fg-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.chart-track {
  flex: 1; height: 28px; background: var(--bg-3); border-radius: 6px;
  overflow: hidden; position: relative; display: flex; align-items: center;
}
.chart-fill {
  height: 100%; background: var(--accent); border-radius: 6px;
  transition: width var(--t-med); min-width: 0;
}
.chart-count {
  position: absolute; right: 8px;
  font-family: var(--font-mono); font-size: 11px; color: var(--fg-2);
}

.empty-note { font-size: 12px; color: var(--fg-3); padding: 8px 0; }
</style>
