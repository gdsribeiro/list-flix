<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useItemsStore } from '@/stores/items'
import { useTweaksStore } from '@/stores/tweaks'
import AppTopbar from '@/components/AppTopbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import type { CategoryId } from '@/types'

const itemsStore = useItemsStore()
const tweaks = useTweaksStore()

const activeCat = ref<CategoryId | 'all'>('all')
const search = ref('')

onMounted(() => {
  tweaks.load()
  itemsStore.load()
})
</script>

<template>
  <div class="app">
    <AppTopbar v-model:search="search" @add="$router.push('/')" />
    <div class="app-body">
      <AppSidebar v-model:activeCat="activeCat" />
      <RouterView :active-cat="activeCat" :search="search" @update:search="search = $event" />
    </div>
  </div>
</template>

<style scoped>
.app { display: flex; flex-direction: column; height: 100vh; min-height: 0; }
.app-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
</style>
