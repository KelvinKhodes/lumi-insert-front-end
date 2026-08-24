<script>
  import { fade, scale } from 'svelte/transition';
  import { X } from 'lucide-svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open]
   * @property {string} [title]
   * @property {any} [onClose]
   * @property {string} [maxWidthClass]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    open = false,
    title = '',
    onClose = () => {},
    maxWidthClass = 'max-w-[440px]',
    children
  } = $props();

  function handleKeydown(e) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <button
      aria-label="Close dialog"
      class="fixed inset-0 bg-black/35"
      transition:fade={{ duration: 120 }}
      onclick={onClose}
    ></button>

    <div
      class="app-window relative w-full {maxWidthClass} max-h-[85vh] overflow-y-auto"
      transition:scale={{ duration: 140, start: 0.96, opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div class="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-surface px-5 py-3.5">
        <h2 class="text-[15px] font-semibold text-ink">{title}</h2>
        <button class="rounded-control p-1.5 text-ink-secondary hover:bg-black/[0.05]" onclick={onClose} aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div class="p-5">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
