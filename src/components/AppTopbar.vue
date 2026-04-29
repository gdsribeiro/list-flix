<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'

const tweaks = useTweaksStore()
const route = useRoute()

const search = defineModel<string>('search', { required: true })
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand">
      <span class="brand-mark"></span>
      <span class="brand-name">List<span class="brand-dim">·</span>Flix</span>
      <span class="brand-badge">v1</span>
    </RouterLink>

    <div class="spacer" />

    <label v-if="route.path === '/'" class="search">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <input v-model="search" type="text" :placeholder="tr('search', tweaks.tweaks.language)" />
    </label>

    <!-- Language combobox -->
    <select
      class="lang-select"
      :value="tweaks.tweaks.language"
      @change="tweaks.set('language', ($event.target as HTMLSelectElement).value as any)"
    >
      <option value="pt">PT</option>
      <option value="en">EN</option>
    </select>

    <!-- Theme toggle switch -->
    <label class="theme-switch" :title="tr('theme', tweaks.tweaks.language)">
      <input
        type="checkbox"
        :checked="tweaks.tweaks.theme === 'light'"
        @change="tweaks.set('theme', tweaks.tweaks.theme === 'dark' ? 'light' : 'dark')"
      />
      <span class="switch-track">
        <span class="switch-thumb">
          <!-- sun icon for light -->
          <svg v-if="tweaks.tweaks.theme === 'light'" width="10" height="10" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.5 1.5M9.5 9.5L11 11M3 11l1.5-1.5M9.5 4.5L11 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
          </svg>
          <!-- moon icon for dark -->
          <svg v-else width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M11 8a5 5 0 01-5-5 4.5 4.5 0 000 9 5 5 0 005-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </span>
      </span>
    </label>

    <RouterLink to="/stats" class="icon-btn" :data-active="route.path === '/stats' || undefined" :title="tr('stats', tweaks.tweaks.language)">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 12V8M6 12V4M10 12V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </RouterLink>

    <RouterLink to="/settings" class="icon-btn" :data-active="route.path === '/settings' || undefined" :title="tr('settings', tweaks.tweaks.language)">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.4 1.4M9.6 9.6L11 11M3 11l1.4-1.4M9.6 4.4L11 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </RouterLink>
  </header>
</template>

<style scoped>
.topbar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 20px; border-bottom: 1px solid var(--border-0);
  background: var(--bg-1); flex-shrink: 0;
}

.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.brand-mark {
  width: 10px; height: 10px; border-radius: 3px;
  background: var(--accent); box-shadow: 0 0 14px var(--accent-line);
}
.brand-name { font-weight: 700; font-size: 15px; letter-spacing: -0.02em; color: var(--fg-0); }
.brand-dim { opacity: 0.4; }
.brand-badge {
  font-family: var(--font-mono); font-size: 9px; font-weight: 500;
  color: var(--fg-2); padding: 2px 6px; background: var(--bg-3);
  border-radius: 4px; letter-spacing: 0.02em;
}
.spacer { flex: 1; }

.search {
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px; background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-md); height: 34px; min-width: 220px; cursor: text;
}
.search:focus-within { border-color: var(--accent-line); }
.search svg { color: var(--fg-2); flex: none; }
.search input {
  background: none; border: none; outline: none;
  color: var(--fg-0); width: 100%; font-size: 13px;
}
.search input::placeholder { color: var(--fg-3); }

.lang-select {
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-md); color: var(--fg-1); padding: 0 10px;
  height: 34px; font-size: 12px; font-weight: 600; cursor: pointer;
  outline: none; transition: var(--t-fast);
}
.lang-select:hover { border-color: var(--border-1); }

/* Theme switch */
.theme-switch { display: flex; align-items: center; cursor: pointer; }
.theme-switch input { display: none; }
.switch-track {
  width: 40px; height: 22px; border-radius: 11px;
  background: var(--bg-3); border: 1px solid var(--border-1);
  display: flex; align-items: center;
  padding: 2px; transition: background var(--t-fast), border-color var(--t-fast);
  cursor: pointer;
}
.theme-switch input:checked + .switch-track {
  background: var(--accent-soft); border-color: var(--accent-line);
}
.switch-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--fg-2); display: flex; align-items: center; justify-content: center;
  color: var(--bg-0); transition: transform var(--t-fast), background var(--t-fast);
}
.theme-switch input:checked + .switch-track .switch-thumb {
  transform: translateX(18px); background: var(--accent);
}

.icon-btn {
  width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-md); color: var(--fg-1); cursor: pointer;
  transition: var(--t-fast); text-decoration: none;
}
.icon-btn:hover { color: var(--fg-0); border-color: var(--border-1); }
.icon-btn[data-active] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-line); }
</style>
