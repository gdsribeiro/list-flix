<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTweaksStore } from '@/stores/tweaks'
import { tr } from '@/constants/i18n'
import AppLogo from '@/components/icons/AppLogo.vue'
import AboutModal from '@/components/AboutModal.vue'

const tweaks = useTweaksStore()
const route = useRoute()
const showAbout = ref(false)

const search = defineModel<string>('search', { required: true })
</script>

<template>
  <header class="topbar">
    <RouterLink to="/" class="brand">
      <AppLogo class="brand-mark" />
      <span class="brand-name">List<span class="brand-sep">·</span>Flix</span>
    </RouterLink>

    <div class="divider" />

    <label v-if="route.path === '/'" class="search">
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="4.25" stroke="currentColor" stroke-width="1.4"/>
        <path d="M9.5 9.5L12 12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <input v-model="search" type="search" :placeholder="tr('search', tweaks.tweaks.language)" />
    </label>

    <div class="topbar-right">
      <select
        class="lang-select"
        :value="tweaks.tweaks.language"
        @change="tweaks.set('language', ($event.target as HTMLSelectElement).value as any)"
        :aria-label="tr('language', tweaks.tweaks.language)"
      >
        <option value="pt">PT</option>
        <option value="en">EN</option>
      </select>

      <label class="theme-toggle" :title="tr('theme', tweaks.tweaks.language)">
        <input
          type="checkbox"
          :checked="tweaks.tweaks.theme === 'light'"
          @change="tweaks.set('theme', tweaks.tweaks.theme === 'dark' ? 'light' : 'dark')"
        />
        <span class="toggle-track">
          <span class="toggle-thumb">
            <svg v-if="tweaks.tweaks.theme === 'light'" width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="3" stroke="currentColor" stroke-width="1.6"/>
              <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.4 1.4M9.6 9.6L11 11M3 11l1.4-1.4M9.6 4.4L11 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
            <svg v-else width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11 8a5 5 0 01-5-5 4.5 4.5 0 000 9 5 5 0 005-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </span>
        </span>
      </label>

      <nav class="nav-links">
        <RouterLink
          to="/stats"
          class="nav-btn"
          :class="{ active: route.path === '/stats' }"
          :title="tr('stats', tweaks.tweaks.language)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 12V8M6 12V4M10 12V6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </RouterLink>
        <RouterLink
          to="/settings"
          class="nav-btn"
          :class="{ active: route.path === '/settings' }"
          :title="tr('settings', tweaks.tweaks.language)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          </svg>
        </RouterLink>
        <button
          class="nav-btn"
          :title="tweaks.tweaks.language === 'pt' ? 'Sobre' : 'About'"
          @click="showAbout = true"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M7 6.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="7" cy="4.5" r="0.75" fill="currentColor"/>
          </svg>
        </button>
      </nav>
    </div>

    <Transition name="modal">
      <AboutModal v-if="showAbout" @close="showAbout = false" />
    </Transition>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid var(--border-0);
  background: var(--bg-1);
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}
.brand-mark {
  color: var(--accent);
  flex-shrink: 0;
}
.brand-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.025em;
  color: var(--fg-0);
}
.brand-sep { color: var(--accent); opacity: 0.7; }

.divider {
  width: 1px;
  height: 20px;
  background: var(--border-0);
  flex-shrink: 0;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 320px;
  padding: 0 12px;
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-md);
  height: 34px;
  cursor: text;
  transition: border-color var(--t-fast);
}
.search:focus-within {
  border-color: var(--accent-line);
  background: var(--bg-3);
}
.search svg { color: var(--fg-3); flex: none; }
.search input {
  background: none;
  border: none;
  outline: none;
  color: var(--fg-0);
  width: 100%;
  font-size: 13px;
}
.search input::placeholder { color: var(--fg-3); }

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.lang-select {
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-md);
  color: var(--fg-2);
  padding: 0 10px;
  height: 32px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  outline: none;
  transition: border-color var(--t-fast), color var(--t-fast);
}
.lang-select:hover { border-color: var(--border-1); color: var(--fg-0); }

/* Theme toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.theme-toggle input { display: none; }
.toggle-track {
  width: 38px;
  height: 20px;
  border-radius: 10px;
  background: var(--bg-3);
  border: 1px solid var(--border-1);
  display: flex;
  align-items: center;
  padding: 2px;
  transition: background var(--t-fast), border-color var(--t-fast);
  cursor: pointer;
}
.theme-toggle input:checked + .toggle-track {
  background: var(--accent-soft);
  border-color: var(--accent-line);
}
.toggle-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--fg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-0);
  transition: transform var(--t-fast), background var(--t-fast);
}
.theme-toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(18px);
  background: var(--accent);
  color: var(--accent-fg);
}

/* Nav links */
.nav-links {
  display: flex;
  gap: 2px;
}
.nav-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--r-md);
  color: var(--fg-2);
  text-decoration: none;
  transition: color var(--t-fast), background var(--t-fast), border-color var(--t-fast);
}
.nav-btn:hover { color: var(--fg-0); background: var(--bg-3); border-color: var(--border-0); }
.nav-btn.active { color: var(--accent); background: var(--accent-soft); border-color: var(--accent-line); }
</style>
