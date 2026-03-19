<template>
  <footer class="glass-strong border-t border-gray-200/50 dark:border-gray-700/50 mt-12 backdrop-blur-xl">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3 group">
          <div class="relative w-8 h-8 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/50 transition-all duration-400 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
            <svg
              class="w-5 h-5 text-white relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span class="text-base font-display font-semibold text-gradient-simple">云纽论坛</span>
        </div>

        <nav class="flex flex-wrap items-center justify-center gap-1">
          <a
            href="#"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-300 hover:scale-105"
          >关于我们</a>
          <a
            href="#"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-300 hover:scale-105"
          >使用条款</a>
          <a
            href="#"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-300 hover:scale-105"
          >隐私政策</a>
          <a
            href="#"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-300 hover:scale-105"
          >联系支持</a>
        </nav>

        <div class="flex items-center gap-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            © 2026 云纽. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>