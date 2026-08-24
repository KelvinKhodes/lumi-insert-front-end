<script>
  import { Hammer } from 'lucide-svelte';
  import { pageTitle } from '../stores/pageTitle.js';

  /**
   * @typedef {Object} Props
   * @property {string} [title]
   */

  /** @type {Props} */
  let { title = 'Coming soon' } = $props();
  pageTitle.set(title);
</script>

<div class="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
  <div class="flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04]">
    <Hammer size={20} class="text-ink-secondary" />
  </div>
  <h2 class="text-[15px] font-medium text-ink">{title}</h2>
  <p class="max-w-[280px] text-[13px] text-ink-secondary">
    This screen hasn't been built yet — it's next up in the Stage B build queue.
  </p>
</div>
