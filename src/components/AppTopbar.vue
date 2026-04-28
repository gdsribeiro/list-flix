<script setup lang="ts">
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'

const emit = defineEmits<{ add: [] }>()
const tweaks = useTweaksStore()

const search = defineModel<string>('search', { required: true })
</script>

<template>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark"></span>
      <span class="brand-name">List<span class="brand-dim">·</span>Flix</span>
      <span class="brand-badge">v1</span>
    </div>

    <div class="spacer" />

    <label class="search">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <input
        v-model="search"
        type="text"
        :placeholder="tr('search', tweaks.tweaks.language)"
      />
    </label>

    <div class="lang-toggle">
      <button
        :data-active="tweaks.tweaks.language === 'pt' || undefined"
        @click="tweaks.set('language', 'pt')"
      >PT</button>
      <button
        :data-active="tweaks.tweaks.language === 'en' || undefined"
        @click="tweaks.set('language', 'en')"
      >EN</button>
    </div>

    <button
      class="icon-btn"
      :data-active="tweaks.showStats || undefined"
      :title="tr('stats', tweaks.tweaks.language)"
      @click="tweaks.showStats = !tweaks.showStats"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 12V8M6 12V4M10 12V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>

    <button
      class="icon-btn"
      :data-active="tweaks.showTweaks || undefined"
      :title="tr('tweaks', tweaks.tweaks.language)"
      @click="tweaks.showTweaks = !tweaks.showTweaks"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.4"/>
        <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.4 1.4M9.6 9.6L11 11M3 11l1.4-1.4M9.6 4.4L11 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
      </svg>
    </button>

    <button class="btn btn-primary" @click="emit('add')">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      {{ tr('add', tweaks.tweaks.language) }}
    </button>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-0);
  background: var(--bg-1);
  flex-shrink: 0;
}

.brand { display: flex; align-items: center; gap: 10px; }
.brand-mark {
  width: 10px; height: 10px; border-radius: 3px;
  background: var(--accent);
  box-shadow: 0 0 14px var(--accent-line);
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

.lang-toggle {
  display: inline-flex; background: var(--bg-2);
  border: 1px solid var(--border-0); border-radius: 8px; padding: 2px;
}
.lang-toggle button {
  background: none; border: none; color: var(--fg-2);
  padding: 4px 10px; font-size: 11px; font-weight: 600;
  letter-spacing: 0.04em; border-radius: 6px; cursor: pointer;
  transition: var(--t-fast);
}
.lang-toggle button[data-active] { background: var(--bg-4); color: var(--fg-0); }

.icon-btn {
  width: 34px; height: 34px;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--bg-2); border: 1px solid var(--border-0);
  border-radius: var(--r-md); color: var(--fg-1); cursor: pointer;
  transition: var(--t-fast);
}
.icon-btn:hover { color: var(--fg-0); border-color: var(--border-1); }
.icon-btn[data-active] { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-line); }

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
</style>
