<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Header />
    <div class="container mx-auto px-4 py-6">
      <div class="flex gap-6">
        <aside v-if="uiStore.sidebarOpen" class="w-64 flex-shrink-0 hidden lg:block">
          <Sidebar />
        </aside>
        <main class="flex-1 min-w-0">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </main>
        <aside class="w-80 flex-shrink-0 hidden xl:block">
          <Widgets />
        </aside>
      </div>
    </div>
    <Footer />
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '../stores/ui'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Widgets from '../components/Widgets.vue'
import Footer from '../components/Footer.vue'
import NotificationContainer from '../components/NotificationContainer.vue'

const uiStore = useUIStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>