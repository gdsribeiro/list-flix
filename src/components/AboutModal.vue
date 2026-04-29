<script setup lang="ts">
import { useTweaksStore } from '@/stores/tweaks'
import AppLogo from '@/components/icons/AppLogo.vue'

const emit = defineEmits<{ close: [] }>()
const tweaks = useTweaksStore()
const isPt = () => tweaks.tweaks.language === 'pt'

function onBackdrop(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('about-backdrop')) emit('close')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
</script>

<template>
  <div class="about-backdrop" @click="onBackdrop" @keydown.esc="onKey">
    <div class="about-modal" role="dialog" aria-modal="true">
      <div class="about-head">
        <div class="about-brand">
          <AppLogo :size="20" class="about-logo" />
          <span class="about-app-name">List<span class="sep">·</span>Flix</span>
        </div>
        <button class="close-btn" @click="emit('close')" :aria-label="isPt() ? 'Fechar' : 'Close'">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="about-body">
        <p class="about-intro">{{ isPt()
          ? 'Um lugar só seu para acompanhar o que você assiste, joga e lê — sem distrações, sem algoritmos, sem pressa.'
          : 'Your own place to track what you watch, play, and read — no distractions, no algorithms, no rush.'
        }}</p>

        <section class="about-section">
          <h3 class="section-title">{{ isPt() ? 'Seus dados' : 'Your data' }}</h3>
          <div class="data-card">
            <div class="data-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/>
                <path d="M5 7h6M5 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
              </svg>
            </div>
            <p>{{ isPt()
              ? 'Tudo fica salvo localmente no seu navegador. Sem conta, sem nuvem, sem rastreamento.'
              : 'Everything is saved locally in your browser. No account, no cloud, no tracking.'
            }}</p>
          </div>
          <p class="data-note">{{ isPt()
            ? 'Para fazer backup, exporte seus dados em JSON via Configurações.'
            : 'To back up your data, export it as JSON via Settings.'
          }}</p>
        </section>

        <div class="about-version">
          <span>List·Flix</span>
          <span class="version-badge">v1</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-backdrop {
  position: fixed;
  inset: 0;
  background: oklch(0 0 0 / 0.55);
  backdrop-filter: blur(6px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.about-modal {
  background: var(--bg-elevated);
  border: 1px solid var(--border-1);
  border-radius: var(--r-xl);
  width: min(480px, 100%);
  max-height: calc(100vh - 48px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-modal);
}

.about-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-0);
  flex-shrink: 0;
}

.about-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.about-logo { color: var(--accent); }

.about-app-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--fg-0);
}
.sep { color: var(--accent); opacity: 0.7; }

.close-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-0);
  border-radius: 6px;
  color: var(--fg-2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color var(--t-fast), background var(--t-fast);
}
.close-btn:hover { color: var(--fg-0); background: var(--bg-3); }

.about-body {
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.about-intro {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--fg-1);
}

.about-section { display: flex; flex-direction: column; gap: 8px; }

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--accent);
  margin: 0;
}

.about-section p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--fg-1);
}

.data-card {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-2);
  border: 1px solid var(--border-0);
  border-radius: var(--r-md);
  align-items: flex-start;
}

.data-icon {
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 1px;
}

.data-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--fg-1);
}

.data-note {
  font-size: 12px;
  color: var(--fg-2);
  line-height: 1.5;
}

.about-version {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 4px;
  border-top: 1px solid var(--border-0);
  font-size: 12px;
  color: var(--fg-3);
}

.version-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  background: var(--bg-3);
  border-radius: 4px;
  color: var(--fg-3);
}
</style>
