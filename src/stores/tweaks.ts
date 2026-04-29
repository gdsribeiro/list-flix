import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tweaks, Layout } from '@/types'

const STORAGE_KEY = 'listflix.v1.tweaks'

const defaults: Tweaks = {
  theme: 'dark',
  layout: 'quadro',
  language: 'pt',
  showCovers: true,
}

const legacyLayoutMap: Record<string, Layout> = {
  kanban: 'quadro',
  grid: 'galeria',
  list: 'historico',
}

export const useTweaksStore = defineStore('tweaks', () => {
  const tweaks = ref<Tweaks>({ ...defaults })

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) Object.assign(tweaks.value, JSON.parse(raw))
      if (tweaks.value.layout in legacyLayoutMap) {
        tweaks.value.layout = legacyLayoutMap[tweaks.value.layout]
      }
    } catch {}
    applyToDOM()
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks.value)) } catch {}
  }

  function set<K extends keyof Tweaks>(key: K, value: Tweaks[K]) {
    tweaks.value[key] = value
    applyToDOM()
    persist()
  }

  function applyToDOM() {
    const html = document.documentElement
    html.dataset.theme  = tweaks.value.theme
    html.dataset.layout = tweaks.value.layout
  }

  return { tweaks, load, set, applyToDOM }
})
