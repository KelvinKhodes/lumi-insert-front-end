<script>
  import { Menu } from 'lucide-svelte';
  import Sidebar from './Sidebar.svelte';
  import { pageTitle } from '../stores/pageTitle.js';
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();

  let sidebarOpen = $state(false);
</script>

<div class="min-h-screen bg-canvas dark:bg-dark-canvas md:p-6">
  <div class="app-window mx-auto flex h-screen w-full max-w-[1400px] md:h-[calc(100vh-3rem)] md:rounded-sf">
    <Sidebar open={sidebarOpen} onClose={() => (sidebarOpen = false)} />

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- mobile top bar -->
      <header class="flex items-center gap-3 border-b border-hairline px-4 py-3 md:hidden">
        <button
          class="rounded-control p-1.5 text-ink hover:bg-black/[0.05]"
          onclick={() => (sidebarOpen = true)}
          aria-label="Open navigation"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <span class="text-[15px] font-semibold text-ink">{$pageTitle}</span>
      </header>

      <main class="min-w-0 flex-1 overflow-y-auto">
        {@render children?.()}
      </main>
    </div>
  </div>
</div>
